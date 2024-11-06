# api/views.py

import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AudioSerializer
from .utils import vosk_speech_to_text
from django.http import JsonResponse  # TestView를 위해 추가

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
            
            # Vosk를 사용하여 음성 인식
            transcript = vosk_speech_to_text(input_path)
            if not transcript:
                return Response({'error': '음성 인식 실패'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'text': transcript}, status=status.HTTP_200_OK)
        else:
            # 유효하지 않은 요청 시 오류 로그 출력
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API가 정상적으로 작동하는지 확인하기 위한 테스트 뷰
class TestView(APIView):
    def get(self, request, *args, **kwargs):
        return JsonResponse({'message': 'API is working!'})
