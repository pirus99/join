from rest_framework import generics
from tasks_app.models import Task
from .serializers import TaskSerializer

class TasksList(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    #permission_classes = [AllowAll]

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer