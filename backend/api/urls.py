# api/urls.py

from django.urls import path
from .views import SpeechToTextView, TestView

urlpatterns = [
    path('speech-to-text/', SpeechToTextView.as_view(), name='speech-to-text'),
    path('test/', TestView.as_view(), name='test'),
]
