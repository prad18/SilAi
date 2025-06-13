from rest_framework import serializers
from .models import Leader, Chat

class LeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leader
        fields = '__all__'

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'user', 'leader', 'user_input', 'ai_response', 'timestamp', 'session_id']
        read_only_fields = ['timestamp', 'user']