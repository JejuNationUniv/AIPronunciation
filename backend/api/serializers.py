# api/serializers.py
#Django REST Framework에서 요청 데이터를 검증하고 직렬화

from rest_framework import serializers

class AudioSerializer(serializers.Serializer):
    audio_file = serializers.FileField()