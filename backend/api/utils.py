# api/utils.py

from vosk import Model, KaldiRecognizer
import json
import wave
import os
import subprocess
from django.conf import settings
from decouple import config

# Vosk 모델 초기화 (애플리케이션 시작 시 한 번만 수행)
model = Model(os.path.join(settings.MEDIA_ROOT, 'models', 'vosk-model-small-ko-0.22'))

def convert_webm_to_wav(input_path, output_path):
    try:
        ffmpeg_path = config('FFMPEG_PATH', default='ffmpeg')  # 환경 변수 또는 .env 파일에서 경로 가져오기
        command = [
            ffmpeg_path,
            '-y',  # 기존 파일 덮어쓰기
            '-i', input_path,
            '-ar', '16000',  # 샘플링 레이트 16000 Hz
            '-ac', '1',       # 채널 수 1 (모노)
            '-f', 'wav',
            output_path
        ]
        print(f"Executing FFmpeg command: {' '.join(command)}")
        result = subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("FFmpeg stdout:", result.stdout.decode())
        print("FFmpeg stderr:", result.stderr.decode())
        return True
    except subprocess.CalledProcessError as e:
        print("FFmpeg 변환 오류:", e)
        print("FFmpeg stderr:", e.stderr.decode())
        return False

def vosk_speech_to_text(input_path):
    try:
        # 파일 확장자가 webm인 경우, wav로 변환
        if input_path.lower().endswith('.webm'):
            converted_path = os.path.splitext(input_path)[0] + "_converted.wav"
            if convert_webm_to_wav(input_path, converted_path):
                print("파일 변환 성공:", converted_path)
                wf = wave.open(converted_path, "rb")
            else:
                print("파일 변환 실패.")
                return ""
        else:
            wf = wave.open(input_path, "rb")

        # 오디오 파일 형식 검증
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
            print("오디오 파일 형식이 올바르지 않습니다.")
            return ""

        rec = KaldiRecognizer(model, wf.getframerate())
        transcript = ""
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                print("중간 결과:", result)  # 중간 결과 출력
                transcript += result.get('text', '') + " "
        # 마지막 결과
        result = json.loads(rec.FinalResult())
        print("최종 결과:", result)  # 최종 결과 출력
        transcript += result.get('text', '')
        return transcript.strip()
    except Exception as e:
        print("Vosk 오류:", e)
        return ""

