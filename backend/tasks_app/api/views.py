"""
API views for the tasks application.

This module provides API endpoints for listing, creating, retrieving,
updating, and deleting tasks.
"""

from rest_framework import generics
from tasks_app.models import Task
from .serializers import TaskSerializer


class TasksList(generics.ListCreateAPIView):
    """
    API view to list all tasks or create a new task.

    GET: Returns a list of all tasks.
    POST: Creates a new task.
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a specific task.

    GET: Returns details of a specific task by ID.
    PUT/PATCH: Updates a specific task by ID.
    DELETE: Deletes a specific task by ID.
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer