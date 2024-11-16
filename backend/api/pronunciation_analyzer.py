import json
import pymysql
from pymysql import Error
from konlpy.tag import Okt

print("프로그램 시작...")

db_config = {
    "host": "localhost",
    "port": 3306,
    "user": "root", 
    "password": "1388",
    "database": "vosk_voice",
}

print("DB 설정 완료")

print("형태소 분석기 초기화 시작...")
okt = Okt()
print("형태소 분석기 초기화 완료")

def find_word_match(word, tokens, start_idx=0):
    """주어진 단어가 토큰 리스트에 있는지 확인하고 위치를 반환"""
    try:
        return tokens.index(word, start_idx)
    except ValueError:
        return -1

def generate_readable_comparison(original_tokens, user_tokens):
    result_parts = []
    used_user_indices = set()
    
    for i, orig_word in enumerate(original_tokens):
        # 정확히 같은 위치에 같은 단어가 있는 경우
        if i < len(user_tokens) and orig_word == user_tokens[i]:
            result_parts.append(f"{orig_word}(<span style='color: blue;'>O</span>)")
            used_user_indices.add(i)
            continue
        
        # 다른 위치에서 같은 단어를 찾기
        found_idx = -1
        for j, user_word in enumerate(user_tokens):
            if j not in used_user_indices and orig_word == user_word:
                found_idx = j
                break
        
        if found_idx != -1:
            # 순서만 다른 경우
            result_parts.append(f"{orig_word}(<span style='color: red;'>순서변경</span>)")
            used_user_indices.add(found_idx)
        else:
            # 해당 위치에 다른 단어가 있는 경우
            if i < len(user_tokens):
                wrong_word = user_tokens[i]
                if i not in used_user_indices:
                    result_parts.append(f"{orig_word}(<span style='color: red;'>{wrong_word}</span>)")
                    used_user_indices.add(i)
                else:
                    result_parts.append(f"{orig_word}(<span style='color: red;'>누락</span>)")
            else:
                result_parts.append(f"{orig_word}(<span style='color: red;'>누락</span>)")
    
    # 사용되지 않은 사용자 발화 단어들은 추가된 것
    extra_words = [word for i, word in enumerate(user_tokens) if i not in used_user_indices]
    
    result = ' '.join(result_parts)
    if extra_words:
        result += f" (추가: <span style='color: red;'>{', '.join(extra_words)}</span>)"
    
    return result


def compare_with_latest_voice(db_config, original_id=1):
    try:
        print("DB 연결 시도...")
        conn = pymysql.connect(**db_config)
        
        if conn:
            print("DB 연결 성공!")
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, text 
                FROM api_origintext 
                WHERE id = %s
            """, (original_id,))
            original_data = cursor.fetchone()
            
            cursor.execute("""
                SELECT id, text, created_at 
                FROM api_voicetexts 
                ORDER BY created_at DESC 
                LIMIT 1
            """)
            voice_data = cursor.fetchone()
            
            if not original_data or not voice_data:
                print("데이터를 찾을 수 없습니다.")
                return None
            
            orig_id, orig_text = original_data
            voice_id, voice_text, voice_created = voice_data
            
            print("\n" + "="*60)
            print("발음 교정 결과 보고서")
            print("="*60)
            
            print(f"\n[시간] {voice_created}")
            
            print("\n[원문]")
            print(f"{orig_text}")
            
            print("\n[발화]")
            print(f"{voice_text}")
            
            original_tokens = okt.morphs(orig_text)
            user_tokens = okt.morphs(voice_text)
            
            print("\n[형태소 분석]")
            print(f"원문: {' + '.join(original_tokens)}")
            print(f"발화: {' + '.join(user_tokens)}")
            
            print("\n[교정 결과]")
            readable_result = generate_readable_comparison(original_tokens, user_tokens)
            print(readable_result)
            
            print("\n[상세 분석]")
            exact_matches = sum(1 for i, j in zip(original_tokens, user_tokens) if i == j)
            order_changes = sum(1 for word in original_tokens if word in user_tokens) - exact_matches
            total_words = len(original_tokens)
            
            accuracy = ((exact_matches + (order_changes * 0.5)) / total_words) * 100
            
            print(f"완벽한 발음: {exact_matches}개")
            if order_changes > 0:
                print(f"순서만 다른 단어: {order_changes}개")
            print(f"전체 단어 수: {total_words}개")
            print(f"정확도: {accuracy:.1f}%")
            
            print("\n" + "="*60)
            
            return {
                "original_text": orig_text,
                "voice_text": voice_text,
                "readable_result": readable_result,
                "accuracy": accuracy
            }

    except Error as e:
        print(f"데이터베이스 오류: {e}")
        return None

    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()
            print("DB 연결 종료")

if __name__ == "__main__":
    try:
        compare_with_latest_voice(db_config)
    except Exception as e:
        print(f"\n오류 발생: {str(e)}")
        import traceback
        print("\n상세 오류:")
        print(traceback.format_exc())