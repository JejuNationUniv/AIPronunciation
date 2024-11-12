import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from collections import Counter
import pickle
import json
import mysql.connector  # MySQL 연결을 위한 라이브러리
from mysql.connector import Error  # 오류 처리를 위한 라이브러리

# 형태소 분석기를 위한 라이브러리
from konlpy.tag import Okt  # KoNLPy 설치 필요: pip install konlpy

# 1. MySQL 데이터베이스에서 데이터 가져오기
def load_sentences_from_db(db_config):
    try:
        conn = mysql.connector.connect(
            host=db_config["host"],
            user=db_config["user"],
            password=db_config["password"],
            database=db_config["database"]
        )
        
        if conn.is_connected():
            cursor = conn.cursor()
            cursor.execute("SELECT sentence, label FROM sentences")
            data = cursor.fetchall()
            sentences = [row[0] for row in data]
            labels = [row[1] for row in data]
            return sentences, labels

    except Error as e:
        print(f"데이터베이스 연결 오류: {e}")
        return [], []  # 오류가 발생하면 빈 리스트 반환

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# MySQL 데이터베이스 접속 정보
db_config = {
    "host": "localhost",  # 3306이 아닌 localhost로 수정
    "port": 3306,        # port는 별도로 지정
    "user": "root",
    "password": "1388",
    "database": "vosk_voice"
}

# 데이터베이스에서 문장과 레이블 불러오기
try:
    sentences, labels = load_sentences_from_db(db_config)
except Exception as e:
    print(f"데이터베이스에서 문장을 불러오는 중 오류 발생: {e}")
    sentences = [
        "한라산 정상에서 맑은 하늘을 보았습니다",
        "성산일출봉 절벽 위로 붉은 태양이 떠올랐다",
        "해녀들이 숨비소리를 내며 깊은 바다 속을 헤엄쳤다",
        "귤꽃향기 맡으며 쇠소깍 검은 모래를 밟았습니다",
        "늦갈밭오름 둘레길에서 햇빛 속 눈꽃송이가 날아갔다"
    ]
    labels = [1, 1, 1, 1, 1]  # 모든 문장을 긍정으로 설정

# 형태소 분석기 초기화
okt = Okt()

# 2. 데이터 전처리

# 형태소 토크나이징 및 단어 사전 생성
def tokenize(sentences):
    words = []
    for sentence in sentences:
        words.extend(okt.morphs(sentence))
    return words

all_words = tokenize(sentences)
word_counts = Counter(all_words)
vocab = sorted(word_counts, key=word_counts.get, reverse=True)
vocab_to_int = {word: idx+1 for idx, word in enumerate(vocab)}  # 단어를 숫자로 매핑

# 문장을 인코딩
encoded_sentences = []
for sentence in sentences:
    encoded_sentence = [vocab_to_int[word] for word in okt.morphs(sentence)]
    encoded_sentences.append(encoded_sentence)

# 시퀀스 패딩
def pad_sequences(sentences, seq_length):
    features = np.zeros((len(sentences), seq_length), dtype=int)
    for i, row in enumerate(sentences):
        features[i, -len(row):] = np.array(row)[:seq_length]
    return features

seq_length = max(len(sentence) for sentence in encoded_sentences)
padded_sentences = pad_sequences(encoded_sentences, seq_length)

# 레이블을 Numpy 배열로 변환
labels = np.array(labels)

# 3. 데이터셋 및 데이터로더 생성
class TextDataset(Dataset):
    def __init__(self, sentences, labels):
        self.sentences = torch.LongTensor(sentences)
        self.labels = torch.FloatTensor(labels)
    
    def __len__(self):
        return len(self.sentences)
    
    def __getitem__(self, idx):
        return self.sentences[idx], self.labels[idx].unsqueeze(0)  # 레이블 차원 증가

dataset = TextDataset(padded_sentences, labels)
dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

# 4. 모델 정의
class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, output_dim):
        super(LSTMClassifier, self).__init__()
        self.embedding = nn.Embedding(vocab_size+1, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        embeds = self.embedding(x)
        lstm_out, _ = self.lstm(embeds)
        out = lstm_out[:, -1, :]
        out = self.fc(out)
        out = self.sigmoid(out)
        return out

vocab_size = len(vocab_to_int)
embed_dim = 16
hidden_dim = 32
output_dim = 1

model = LSTMClassifier(vocab_size, embed_dim, hidden_dim, output_dim)

# 5. 손실 함수 및 옵티마이저 설정
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 6. 모델 학습
epochs = 50

for epoch in range(epochs):
    for inputs, targets in dataloader:
        model.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
    if (epoch+1) % 10 == 0:
        print(f'Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}')

# 모델 저장
torch.save(model.state_dict(), 'lstm_model.pth')

# 단어 사전과 시퀀스 길이 저장
with open('vocab_to_int.pkl', 'wb') as f:
    pickle.dump({'vocab_to_int': vocab_to_int, 'seq_length': seq_length}, f)

# 7. 사용자 발음과 원본 문장 비교 및 JSON 출력 기능 추가

def compare_sentences(original_sentence, user_transcription):
    original_tokens = okt.morphs(original_sentence)
    user_tokens = okt.morphs(user_transcription)
    
    incorrect_words = []
    max_len = max(len(original_tokens), len(user_tokens))
    
    for idx in range(max_len):
        orig_word = original_tokens[idx] if idx < len(original_tokens) else ""
        user_word = user_tokens[idx] if idx < len(user_tokens) else ""
        
        if orig_word != user_word:
            incorrect_entry = {"word": user_word, "position": idx+1}
            if orig_word != "" and user_word == "":
                incorrect_entry["missing_word"] = orig_word
            elif orig_word == "" and user_word != "":
                incorrect_entry["extra_word"] = user_word
            elif orig_word != "" and user_word != "":
                incorrect_entry["expected_word"] = orig_word
            incorrect_words.append(incorrect_entry)
    
    result = {
        "incorrect_words": incorrect_words,
        "user_transcription": user_transcription
    }
    return json.dumps(result, ensure_ascii=False, indent=2)

# 8. 데이터베이스에서 가져온 문장과 사용자 발음 비교 및 결과 출력

# 예시 사용자 발음 리스트 (일부 틀린 단어 포함)
user_transcriptions = [
    "한라산 정상에서 맑은 하늘을 보았습니다",           # 정답
    "성산일출봉 절벽 위로 푸른 태양이 떠올랐다",       # '푸른' 대신 '붉은' (틀림)
    "해녀들이 숨비소리를 내며 깊은 바다 속을 헤엄쳤다",  # 정답
    "귤꽃향기 맡으며 쇠소깍 흰 모래를 밟았습니다",     # '흰' 대신 '검은' (틀림)
    "늦갈밭오름 둘레길에서 햇빛 속 눈꽃송이가 날아갔다"  # 정답
]

# 비교 및 결과 출력
for orig_sentence, user_transcription in zip(sentences, user_transcriptions):
    print(f"\n원본 문장: {orig_sentence}")
    print(f"사용자 발음: {user_transcription}")
    comparison_result = compare_sentences(orig_sentence, user_transcription)
    print(comparison_result)
    
    filename = f"result_{sentences.index(orig_sentence)+1}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(comparison_result)