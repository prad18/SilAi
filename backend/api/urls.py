from django.urls import path
from .views import LeaderList

urlpatterns = [
    path("leaders/", LeaderList.as_view(), name="leader-list"),
]