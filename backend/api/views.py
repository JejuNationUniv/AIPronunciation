from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AudioSerializer
from .utils import vosk_speech_to_text
from django.http import JsonResponse
from .models import VoiceTexts, OriginText
from konlpy.tag import Okt
from .pronunciation_analyzer import find_most_similar_sentence, compare_sentences
import json
import os

okt = Okt()

def speech_to_text(request):
   if request.method == 'POST':
       original_sentence = request.POST.get('original_sentence', '')
       user_transcription = request.POST.get('user_transcription', '')
       result = compare_sentences(original_sentence, user_transcription)
       return JsonResponse(result, safe=False)

class OriginTextView(APIView):
   def get(self, request):
       text_id = request.query_params.get('id', 1)
       try:
           origin_text = OriginText.objects.get(id=text_id)
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
           
           # 음성 인식
           transcript, mp3_path = vosk_speech_to_text(input_path)
           if not transcript:
               return Response({'error': '음성 인식 실패'}, status=status.HTTP_400_BAD_REQUEST)
           print(f"음성 인식 결과: {transcript}")
           
           # DB에 저장
           voice_text = VoiceTexts.objects.create(text=transcript)
           print(f"DB 저장 ID: {voice_text.id}")
           
           if mp3_path:
               audio_url = os.path.join(settings.MEDIA_URL, 'uploads', os.path.basename(mp3_path))
           else:
               audio_url = None

           try:
               original = OriginText.objects.get(id=1)
               original_text = original.text
               print(f"원본 텍스트: {original_text}")
               
               # 가장 유사한 문장 찾기 및 분석
               most_similar = find_most_similar_sentence(transcript)
               analysis = json.loads(compare_sentences(most_similar, transcript))

               # 색상 분석
               colored_text = "분석 결과: "
               transcript_words = set(transcript.split())  # 사용자가 말한 단어들

               for word in most_similar.split():
                   if word in transcript_words:
                       # 정확히 발음한 단어는 검정색
                       colored_text += f'<span style="color:black">{word}</span> '
                   else:
                       # 누락된 단어는 파란색
                       colored_text += f'<span style="color:blue">{word}</span> '

               # 틀린 발음 찾기
               for word in transcript_words:
                   if word not in set(most_similar.split()):
                       # 잘못 발음한 단어는 빨간색
                       colored_text += f'<span style="color:red">{word}</span> '

               response_data = {
                   'text': transcript,
                   'readable_result': f"{most_similar}",
                   'colored_analysis': colored_text,
                   'accuracy': analysis['accuracy'],
                   'original_text': original_text,
                   'voice_text_id': voice_text.id,
                   'audio_url': audio_url
               }
               
               print(f"응답 데이터: {response_data}")
               return Response(response_data, status=status.HTTP_200_OK)
               
           except OriginText.DoesNotExist:
               print("원본 텍스트를 찾을 수 없음")
               return Response({
                   'text': transcript,
                   'error': '원본 텍스트를 찾을 수 없습니다.'
               }, status=status.HTTP_200_OK)
           
       print(f"유효성 검사 실패: {serializer.errors}")
       return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestView(APIView):
   def get(self, request, *args, **kwargs):
       return JsonResponse({'message': 'API is working!'})