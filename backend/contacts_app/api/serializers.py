"""
Serializers for the contacts application.

This module defines serializers for converting Contact model instances
to and from JSON representations.
"""

from rest_framework import serializers
from contacts_app.models import Contact


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for the Contact model.

    Converts Contact model instances to JSON and validates incoming data
    for creating or updating contacts.
    """

    class Meta:
        """Meta class defining model and fields for serialization."""

        model = Contact
        fields = ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'uid']
