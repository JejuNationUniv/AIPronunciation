import pymysql
from pymysql import Error

def load_sentences_from_db(db_config):
    try:
        print("DB 연결 시도...")
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='1388',
            database='vosk_voice'
        )
        
        if conn:  # pymysql은 is_connected() 대신 그냥 conn 객체 확인
            print("DB 연결 성공!")
            cursor = conn.cursor()
            
            print("쿼리 실행 시작...")
            cursor.execute("SELECT id, text, created_at FROM api_voicetexts ORDER BY created_at DESC")
            data = cursor.fetchall()
            print(f"가져온 데이터 수: {len(data)}")
            
            if data:
                print("첫 번째 레코드:", data[0])
            
            sentences = [row[1] for row in data]  # text 컬럼은 인덱스 1
            labels = [1 for _ in range(len(sentences))]
            
            return sentences, labels

    except Error as e:
        print(f"데이터베이스 오류: {e}")
        print(f"오류 타입: {type(e)}")
        return [], []

    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()
            print("DB 연결 종료")