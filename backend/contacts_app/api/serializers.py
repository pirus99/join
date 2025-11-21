from rest_framework import serializers
from contacts_app.models import Contact
from django.contrib.auth.models import User

class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'uid']
