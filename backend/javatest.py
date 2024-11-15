from konlpy.tag import Okt

# Okt 객체 생성
okt = Okt()

# 테스트 문장
text = "자바 환경설정이 제대로 되었는지 확인하는 테스트 코드입니다."

# 형태소 분석
morphs = okt.morphs(text)
print("형태소 분석 결과:", morphs)

# 명사 추출
nouns = okt.nouns(text)
print("명사 추출 결과:", nouns)

# 문장 분석
pos = okt.pos(text)
print("품사 분석 결과:", pos)
