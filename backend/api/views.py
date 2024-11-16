import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AudioSerializer
from .utils import vosk_speech_to_text
from django.http import JsonResponse
from .models import VoiceTexts, OriginText
from konlpy.tag import Okt
from .pronunciation_analyzer import generate_readable_comparison

okt = Okt()

class OriginTextView(APIView):
    def get(self, request):
        try:
            origin_text = OriginText.objects.get(id=1)
            return Response({
                'text': origin_text.text
            }, status=status.HTTP_200_OK)
        except OriginText.DoesNotExist:
            return Response({
                'error': '원본 텍스트를 찾을 수 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)

class SpeechToTextView(APIView):
    def post(self, request, format=None):
        print("\n=== API 요청 디버깅 시작 ===")
        print(f"요청 데이터: {request.data}")
        
        serializer = AudioSerializer(data=request.data)
        
        if serializer.is_valid():
            audio_file = serializer.validated_data['audio_file']
            input_path = os.path.join(settings.MEDIA_ROOT, 'uploads', audio_file.name)
            
            # 파일 저장
            os.makedirs(os.path.dirname(input_path), exist_ok=True)
            with open(input_path, 'wb+') as f:
                for chunk in audio_file.chunks():
                    f.write(chunk)
            print(f"파일 저장됨: {input_path}")
            
            # 음성 인식 및 MP3 파일 생성
            transcript, mp3_path = vosk_speech_to_text(input_path)
            if not transcript:
                return Response({'error': '음성 인식 실패'}, status=status.HTTP_400_BAD_REQUEST)
            print(f"음성 인식 결과: {transcript}")
            
            # DB에 저장
            voice_text = VoiceTexts.objects.create(text=transcript)
            print(f"DB 저장 ID: {voice_text.id}")
            
            # MP3 파일 URL 생성
            if mp3_path:
                audio_url = os.path.join(settings.MEDIA_URL, 'uploads', os.path.basename(mp3_path))
            else:
                audio_url = None

            try:
                original = OriginText.objects.get(id=1)
                original_text = original.text
                print(f"원본 텍스트: {original_text}")
                
                # 형태소 분석
                original_tokens = okt.morphs(original_text)
                user_tokens = okt.morphs(transcript)
                print(f"원본 토큰: {original_tokens}")
                print(f"사용자 토큰: {user_tokens}")
                
                # 교정 결과 생성
                readable_result = generate_readable_comparison(original_tokens, user_tokens)
                print(f"교정 결과: {readable_result}")
                
                response_data = {
                    'text': transcript,
                    'readable_result': readable_result,
                    'original_text': original_text,
                    'voice_text_id': voice_text.id,
                    'audio_url': audio_url  # 변환된 MP3 파일의 URL
                }
                print(f"응답 데이터: {response_data}")
                
                return Response(response_data, status=status.HTTP_200_OK)
                
            except OriginText.DoesNotExist:
                print("원본 텍스트를 찾을 수 없음")
                return Response({
                    'text': transcript,
                    'voice_text_id': voice_text.id,
                    'audio_url': audio_url,
                    'error': '원본 텍스트를 찾을 수 없습니다.'
                }, status=status.HTTP_200_OK)
            
        print(f"유효성 검사 실패: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestView(APIView):
    def get(self, request, *args, **kwargs):
        return JsonResponse({'message': 'API is working!'})

