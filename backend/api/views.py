# api/views.py
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AudioSerializer
from .utils import vosk_speech_to_text
from django.http import JsonResponse
from .models import VoiceText

class SpeechToTextView(APIView):
   def post(self, request, format=None):
       print("Request data:", request.data)
       print("Request files:", request.FILES)
       serializer = AudioSerializer(data=request.data)
       
       if serializer.is_valid():
           audio_file = serializer.validated_data['audio_file']
           input_path = os.path.join(settings.MEDIA_ROOT, 'uploads', audio_file.name)
           
           # 파일 저장
           os.makedirs(os.path.dirname(input_path), exist_ok=True)
           with open(input_path, 'wb+') as f:
               for chunk in audio_file.chunks():
                   f.write(chunk)
           print(f"파일이 저장되었습니다: {input_path}")
           
           # Vosk로 음성 인식
           transcript = vosk_speech_to_text(input_path)
           if not transcript:
               return Response({'error': '음성 인식 실패'}, status=status.HTTP_400_BAD_REQUEST)
           
           # 텍스트를 공백 기준으로 분리
           words = transcript.split()
           
           # VoiceText 객체 생성을 위한 데이터 준비
           voice_text_data = {}
           for i, word in enumerate(words[:30], 1):  # 30개 단어까지만
               voice_text_data[f'word{i}'] = word
           
           # DB에 저장
           voice_text = VoiceText.objects.create(**voice_text_data)
           
           # 기존 transcript response와 저장된 데이터 ID 모두 반환
           return Response({
               'text': transcript,  # 리액트에서 화면 출력용
               'voice_text_id': voice_text.id  # DB 저장 확인용
           }, status=status.HTTP_200_OK)
       
       return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API가 정상적으로 작동하는지 확인하기 위한 테스트 뷰
class TestView(APIView):
   def get(self, request, *args, **kwargs):
       return JsonResponse({'message': 'API is working!'})

# 저장된 음성 텍스트 데이터 조회 뷰
class VoiceTextListView(APIView):
   def get(self, request):
       voice_texts = VoiceText.objects.all().order_by('-created_at')
       data = []
       for vt in voice_texts:
           words = []
           for i in range(1, 31):  # 30개 단어까지 조회
               word = getattr(vt, f'word{i}')
               if word:  # null이 아닌 경우만 추가
                   words.append(word)
           data.append({
               'id': vt.id,
               'words': words,
               'created_at': vt.created_at
           })
       return Response(data)

# 특정 음성 텍스트 상세 조회 뷰
class VoiceTextDetailView(APIView):
   def get(self, request, pk):
       try:
           voice_text = VoiceText.objects.get(pk=pk)
           words = []
           for i in range(1, 31):
               word = getattr(voice_text, f'word{i}')
               if word:
                   words.append(word)
           data = {
               'id': voice_text.id,
               'words': words,
               'created_at': voice_text.created_at
           }
           return Response(data)
       except VoiceText.DoesNotExist:
           return Response({'error': '해당 데이터를 찾을 수 없습니다.'}, 
                         status=status.HTTP_404_NOT_FOUND)