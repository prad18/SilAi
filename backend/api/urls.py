from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'leaders', views.LeaderViewSet)
router.register(r'chats', views.ChatViewSet)

urlpatterns = [
    path('', include(router.urls)),
]