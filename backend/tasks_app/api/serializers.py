"""
Serializers for the tasks application.

This module defines serializers for converting Task model instances
to and from JSON representations.
"""

from rest_framework import serializers
from tasks_app.models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.

    Converts Task model instances to JSON and validates incoming data
    for creating or updating tasks.
    """

    class Meta:
        """Meta class defining model and fields for serialization."""

        model = Task
        fields = '__all__'
