# models.py
from django.db import models

class VoiceText(models.Model):
   word1 = models.CharField(max_length=100, blank=True, null=True)
   word2 = models.CharField(max_length=100, blank=True, null=True) 
   word3 = models.CharField(max_length=100, blank=True, null=True)
   word4 = models.CharField(max_length=100, blank=True, null=True)
   word5 = models.CharField(max_length=100, blank=True, null=True)
   word6 = models.CharField(max_length=100, blank=True, null=True)
   word7 = models.CharField(max_length=100, blank=True, null=True)
   word8 = models.CharField(max_length=100, blank=True, null=True)
   word9 = models.CharField(max_length=100, blank=True, null=True)
   word10 = models.CharField(max_length=100, blank=True, null=True)
   word11 = models.CharField(max_length=100, blank=True, null=True)
   word12 = models.CharField(max_length=100, blank=True, null=True)  
   word13 = models.CharField(max_length=100, blank=True, null=True)
   word14 = models.CharField(max_length=100, blank=True, null=True)
   word15 = models.CharField(max_length=100, blank=True, null=True)
   word16 = models.CharField(max_length=100, blank=True, null=True)
   word17 = models.CharField(max_length=100, blank=True, null=True)
   word18 = models.CharField(max_length=100, blank=True, null=True)
   word19 = models.CharField(max_length=100, blank=True, null=True)
   word20 = models.CharField(max_length=100, blank=True, null=True)
   word21 = models.CharField(max_length=100, blank=True, null=True)
   word22 = models.CharField(max_length=100, blank=True, null=True)
   word23 = models.CharField(max_length=100, blank=True, null=True)
   word24 = models.CharField(max_length=100, blank=True, null=True)
   word25 = models.CharField(max_length=100, blank=True, null=True)
   word26 = models.CharField(max_length=100, blank=True, null=True)
   word27 = models.CharField(max_length=100, blank=True, null=True)
   word28 = models.CharField(max_length=100, blank=True, null=True)
   word29 = models.CharField(max_length=100, blank=True, null=True)
   word30 = models.CharField(max_length=100, blank=True, null=True)
   created_at = models.DateTimeField(auto_now_add=True)

   class Meta:
       db_table = 'voice_text'