"""
Task model definitions for the tasks application.

This module contains the Task model representing tasks with priorities,
due dates, and assignees.
"""

from django.db import models


class Task(models.Model):
    """
    Model representing a task with all its properties.

    Attributes:
        title: The title of the task.
        description: Detailed description of the task.
        subtasks: JSON list of subtasks.
        priority: Priority level of the task (integer).
        category: Category identifier for the task.
        dueDate: The due date for task completion.
        assignedTo: JSON list of users assigned to the task.
        status: Current status of the task (integer).
    """

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    subtasks = models.JSONField(default=list, blank=True)
    priority = models.IntegerField()
    category = models.IntegerField(default=0)
    dueDate = models.DateField()
    assignedTo = models.JSONField(default=list, blank=True)
    status = models.IntegerField(default=0)

    def __str__(self):
        """Return a string representation of the task."""
        return f"{self.title} {self.priority}"
