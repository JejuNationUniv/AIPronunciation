from django.urls import path
from .views import SpeechToTextView, TestView, OriginTextView, AccuracyView

urlpatterns = [
    path('speech-to-text/', SpeechToTextView.as_view(), name='speech-to-text'),
    path('speech-to-text/original/', OriginTextView.as_view(), name='original-text'),
    path('test/', TestView.as_view(), name='test'),
    path('pronunciation/accuracy/', AccuracyView.as_view(), name='pronunciation-accuracy'),
]