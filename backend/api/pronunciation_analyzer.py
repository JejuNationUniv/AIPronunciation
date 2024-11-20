import numpy as np
import Levenshtein
from pykospacing import Spacing
from difflib import SequenceMatcher
import json
import pymysql
from pymysql import Error

# DB 연결 설정
db_config = {
   "host": "localhost",
   "port": 3306,
   "user": "root", 
   "password": "1388",
   "database": "vosk_voice",
}

sentences = [
   "한라산 정상에서 맑은 하늘을 보았습니다",
   "성산일출봉 절벽 위로 붉은 태양이 떠올랐다",
   "해녀들이 숨비소리를 내며 깊은 바다 속을 헤엄쳤다",
   "귤꽃향기 맡으며 쇠소깍 검은 모래를 밟았습니다",
   "늦갈밭오름 둘레길에서 햇빛 속 눈꽃송이가 날아갔다"
]

spacing = Spacing()

def get_latest_transcription():
   """DB에서 가장 최근 음성 텍스트를 가져오는 함수"""
   try:
       conn = pymysql.connect(**db_config)
       cursor = conn.cursor()
       
       cursor.execute("""
           SELECT text FROM api_voicetexts 
           ORDER BY created_at DESC LIMIT 1
       """)
       latest_text = cursor.fetchone()
       
       if latest_text:
           return latest_text[0]
       return None
       
   except Error as e:
       print(f"DB 오류: {e}")
       return None
   finally:
       if 'conn' in locals() and conn:
           cursor.close()
           conn.close()

def find_most_similar_sentence(user_transcription):
   corrected_transcription = spacing(user_transcription)
   max_similarity = 0
   most_similar_sentence = sentences[0]
   for sentence in sentences:
       similarity = Levenshtein.ratio(''.join(sentence.split()), ''.join(corrected_transcription.split()))
       if similarity > max_similarity:
           max_similarity = similarity
           most_similar_sentence = sentence
   return most_similar_sentence

def compare_sentences(original_sentence, user_transcription, threshold=0.7):
   corrected_transcription = spacing(user_transcription)
   original_words = spacing(original_sentence).split()
   user_words = corrected_transcription.split()
   matcher = SequenceMatcher(None, original_words, user_words)
   frontend_words = []  # 프론트엔드용 단어 목록
   mispronounced_words = []
   missing_words = []
   extra_words = []
   correct_count = 0

   for tag, i1, i2, j1, j2 in matcher.get_opcodes():
       if tag == 'equal':
           for i in range(i1, i2):
               word = original_words[i]
               frontend_words.append({
                   "text": word,
                   "type": "normal"
               })
               correct_count += 1
       elif tag == 'replace':
           for idx in range(max(i2 - i1, j2 - j1)):
               orig_word = original_words[i1 + idx] if i1 + idx < i2 else ""
               user_word = user_words[j1 + idx] if j1 + idx < j2 else ""
               if orig_word != "" and user_word != "":
                   frontend_words.append({
                       "text": user_word,
                       "type": "error",
                       "expected": orig_word
                   })
                   mispronounced_words.append(user_word)
               elif orig_word != "":
                   frontend_words.append({
                       "text": orig_word,
                       "type": "missing"
                   })
                   missing_words.append(orig_word)
               elif user_word != "":
                   frontend_words.append({
                       "text": user_word,
                       "type": "extra"
                   })
                   extra_words.append(user_word)
       elif tag == 'delete':
           for i in range(i1, i2):
               word = original_words[i]
               frontend_words.append({
                   "text": word,
                   "type": "missing"
               })
               missing_words.append(word)
       elif tag == 'insert':
           for i in range(j1, j2):
               word = user_words[i]
               frontend_words.append({
                   "text": word,
                   "type": "extra"
               })
               extra_words.append(word)

   total_words = len(original_words)
   accuracy = correct_count / total_words if total_words > 0 else 0

   corrected_pronunciation_words = []
   for word_info in frontend_words:
       if word_info["type"] != "extra":
           if word_info["type"] == "error":
               corrected_pronunciation_words.append(word_info["expected"])
           else:
               corrected_pronunciation_words.append(word_info["text"])
   
   corrected_pronunciation = ' '.join(corrected_pronunciation_words)

   result = {
       "words": frontend_words,                    # 프론트엔드 렌더링용 단어별 정보
       "corrected": corrected_pronunciation,       # 교정된 전체 문장
       "errors": {
           "mispronounced": mispronounced_words,  # 틀린 발음 목록
           "missing": missing_words,              # 누락된 단어 목록
           "extra": extra_words                   # 추가된 단어 목록
       },
       "accuracy": accuracy,
       "original": original_sentence,
       "user_input": user_transcription
   }

   return json.dumps(result, ensure_ascii=False, indent=2)

def print_styled_sentence(result_json):
   result = json.loads(result_json)
   
   print("\n전체 문장 출력:")
   for word_info in result["words"]:
       word = word_info["text"]
       word_type = word_info["type"]

       if word_type == "normal":
           print(f"\033[1m{word}\033[0m", end=' ')
       elif word_type == "error":
           print(f"\033[31m{word}\033[0m", end=' ')
       elif word_type == "missing":
           print(f"\033[34m{word}\033[0m", end=' ')
       elif word_type == "extra":
           print(f"\033[4;31m{word}\033[0m", end=' ')
   print()

   print("\n1열: 교정된 발음")
   print(result["corrected"])

   print("\n2열: 틀린 발음된 단어만")
   print(", ".join(result["errors"]["mispronounced"]))

   print("\n3열: 누락된 단어만")
   print(", ".join(result["errors"]["missing"]))

   print("\n4열: 추가된 단어만")
   print(", ".join(result["errors"]["extra"]))

   print(f"\n발음 정확도: {result['accuracy']*100:.2f}%")

if __name__ == "__main__":
   db_transcription = get_latest_transcription()
   
   if db_transcription:
       print(f"DB에서 가져온 최신 발음: {db_transcription}")
       user_transcription = db_transcription
   else:
       user_transcription = input("사용자 발음을 입력하세요: ")

   most_similar_sentence = find_most_similar_sentence(user_transcription)
   print(f"\n가장 유사한 문장: {most_similar_sentence}")

   if user_transcription:
       result_json = compare_sentences(most_similar_sentence, user_transcription)
       print_styled_sentence(result_json)
   else:
       print("사용자 발음이 입력되지 않아 비교를 수행할 수 없습니다.")
