# check_wav_header.py

import os

def check_wav_header(file_path):
    if not os.path.exists(file_path):
        print(f"파일이 존재하지 않습니다: {file_path}")
        return
    with open(file_path, 'rb') as f:
        header = f.read(12)  # WAV 헤더는 최소 12바이트
        print("WAV Header:", header)
        if header[:4] == b'RIFF' and header[8:12] == b'WAVE':
            print("파일 헤더가 올바릅니다.")
        else:
            print("파일 헤더가 올바르지 않습니다.")

if __name__ == "__main__":
    file_path = r"C:\My-Portfolio\voskProject\backend\media\uploads\recording_converted.wav"  # 실제 파일 경로로 변경
    check_wav_header(file_path)
