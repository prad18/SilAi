from rest_framework import serializers
from accounts.models import CustomUserModel

class MyUserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(use_url=True,required=False)

    class Meta:
        model = CustomUserModel
        fields = ['email', 'first_name', 'last_name', 'profile_image']
        read_only_fields = ['email']
