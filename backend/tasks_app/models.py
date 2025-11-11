from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    subtasks = models.JSONField(default=list, blank=True)
    priority = models.IntegerField()
    category = models.IntegerField(default=0)
    dueDate = models.DateField()  
    assignedTo = models.JSONField(default=list, blank=True)
    status = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} {self.priority}"
