from django.shortcuts import render, redirect
from django.http import JsonResponse

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import CustomUserModel
from.serializers import MyUserProfileSerializer

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404



class GoogleLogin(SocialLoginView): # if you want to use Authorization Code Grant, use this
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000/"
    client_class = OAuth2Client

def email_confirmation(request, key):
    return redirect(f"http://localhost:3000/dj-rest-auth/registration/account-confirm-email/{key}")

def reset_password_confirm(request, uid, token):
    return redirect(f"http://localhost:3000/reset/password/confirm/{uid}/{token}")

@require_GET
def check_email(request):
    email = request.GET.get("email", "").strip()
    exists = CustomUserModel.objects.filter(email=email).exists()
    return JsonResponse({"exists": exists})

@api_view(['GET'])
def get_user_profile_data(request,pk):

    try:
        try:
            user=CustomUserModel.objects.get(email=pk)
        except CustomUserModel.DoesNotExist:
            return Response({'error':'user doesnot exist'})
        
        serializer= MyUserProfileSerializer(user,many=False)
        return Response(serializer.data)
    except:
        return Response({'error':"error getting user data"})
    

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # ✅ Handle file uploads
def user_profile(request):
    user = request.user  # ✅ Get logged-in user

    if request.method == 'GET':
        serializer = MyUserProfileSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data.copy()  # ✅ Copy request data to modify safely
        if not request.FILES.get('profile_image', None):  # ✅ Ensure the file is optional
            data.pop('profile_image', None)

        serializer = MyUserProfileSerializer(user, data=data, partial=True)  # ✅ Partial update
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        
        return Response(serializer.errors, status=400)