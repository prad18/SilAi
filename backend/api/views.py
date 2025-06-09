from rest_framework import generics
from .models import Leader
from .serializers import LeaderSerializer
from rest_framework.permissions import IsAuthenticated

class LeaderList(generics.ListAPIView):
    queryset = Leader.objects.all()
    serializer_class = LeaderSerializer
    permission_classes = [IsAuthenticated]