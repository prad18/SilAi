from rest_framework import serializers
from accounts.models import CustomUserModel

class MyUserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(use_url=True,required=False)
    has_social_account = serializers.SerializerMethodField()
    has_usable_password = serializers.SerializerMethodField()

    class Meta:
        model = CustomUserModel
        fields = ['email', 'first_name', 'last_name', 'profile_image', 'has_social_account', 'has_usable_password']
        read_only_fields = ['email']

    def get_has_social_account(self, obj):
        """Check if user has any social accounts (Google, Facebook, etc.)"""
        return obj.socialaccount_set.exists()
    
    def get_has_usable_password(self, obj):
        """Check if user has a usable password (for manual registration)"""
        return obj.has_usable_password()
