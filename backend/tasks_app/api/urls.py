"""
URL configuration for the tasks API.

This module defines the URL patterns for task-related API endpoints.
"""

from django.urls import path
from .views import TasksList, TaskDetail

urlpatterns = [
    path('', TasksList.as_view(), name='tasks-list'),
    path('<int:pk>/', TaskDetail.as_view(), name='task-detail'),
]
