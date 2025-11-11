from rest_framework import serializers
from tasks_app.models import Task
from django.contrib.auth.models import User

class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ['__all__']
