"""
Contact model definitions for the contacts application.

This module contains the Contact model representing contact information
stored in the database.
"""

from django.db import models
from django.contrib.auth.models import User


class Contact(models.Model):
    """
    Model representing a contact with personal information.

    Attributes:
        firstName: The first name of the contact.
        lastName: The last name of the contact.
        email: The email address of the contact.
        phoneNumber: The phone number of the contact.
        uid: Foreign key reference to the User who owns this contact.
    """

    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    phoneNumber = models.CharField(max_length=40)
    uid = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.CASCADE
    )

    def __str__(self):
        """Return a string representation of the contact."""
        return f"{self.firstName} {self.lastName}"