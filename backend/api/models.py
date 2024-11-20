# models.py
from django.db import models

class VoiceTexts(models.Model):
    text = models.TextField()  # 전체 텍스트를 저장할 필드
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Voice Text {self.id}"
    
class OriginText(models.Model):
    text = models.TextField()  # 원문 문장을 저장할 필드
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Origin Voice {self.id}"
    
# LastPage 위한 Models(정확도)
class PronunciationAccuracy(models.Model):
    text = models.CharField(max_length=50)
    accuracy = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # 최신순 정렬