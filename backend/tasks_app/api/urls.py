from django.urls import path
from .views import TasksList, TaskDetail

urlpatterns = [
    path('', TasksList().as_view(), name='tasks-list'),
    path('<int:pk>/', TaskDetail.as_view(), name='task-detail')
]
