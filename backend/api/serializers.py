from rest_framework import serializers
from .models import Leader, Chat, UserLeaderSession

class LeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leader
        fields = '__all__'

class UserLeaderSessionSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UserLeaderSession
        fields = ['id', 'session_id', 'session_name', 'created_at', 'updated_at', 'message_count']
        read_only_fields = ['id', 'session_id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return Chat.objects.filter(session_id=obj.session_id).count()

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'user', 'leader', 'user_input', 'ai_response', 'timestamp', 'session_id']
        read_only_fields = ['timestamp', 'user']