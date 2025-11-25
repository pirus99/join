"""
API views for the contacts application.

This module provides API endpoints for listing, creating, retrieving,
updating, and deleting contacts.
"""

from rest_framework import generics
from contacts_app.models import Contact
from .serializers import ContactSerializer


class ContactsList(generics.ListCreateAPIView):
    """
    API view to list all contacts or create a new contact.

    GET: Returns a list of all contacts.
    POST: Creates a new contact.
    """

    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class ContactDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a specific contact.

    GET: Returns details of a specific contact by ID.
    PUT/PATCH: Updates a specific contact by ID.
    DELETE: Deletes a specific contact by ID.
    """

    queryset = Contact.objects.all()
    serializer_class = ContactSerializer