"""
URL configuration for the contacts API.

This module defines the URL patterns for contact-related API endpoints.
"""

from django.urls import path
from .views import ContactDetail, ContactsList

urlpatterns = [
    path('', ContactsList.as_view(), name='contact-list'),
    path('<int:pk>/', ContactDetail.as_view(), name='contact-detail'),
]
