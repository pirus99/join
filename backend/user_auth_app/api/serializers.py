"""
Serializers for the user authentication application.

This module defines serializers for user registration, login,
and user profile management.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import IntegrityError


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.

    Converts User model instances to JSON for profile display
    and updates.
    """

    class Meta:
        """Meta class defining model and fields for serialization."""

        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email']


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login credentials.

    Validates username and password for authentication.
    """

    class Meta:
        """Meta class defining the model reference."""

        model = User


class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Validates and processes new user registration data including
    email, password, first name, and last name.
    """

    class Meta:
        """Meta class defining model, fields, and validation rules."""

        model = User
        fields = ['first_name', 'last_name', 'email', 'password']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'min_length': 8
            },
            'last_name': {
                'required': True
            },
            'first_name': {
                'required': True
            },
            'username': {
                'required': False
            },
            'email': {
                'required': True,
            }
        }

    def save(self):
        """
        Create and save a new user account.

        Uses email as username for authentication. Validates required
        fields and handles duplicate email/username errors.

        Returns:
            User: The newly created user account.

        Raises:
            ValidationError: If password or email is missing,
                or if email/username already exists.
        """
        UserModel = get_user_model()
        pw = self.validated_data.get('password')
        email = self.validated_data.get('email')
        # Using E-Mail instead of username to sign-in
        username = self.validated_data.get('email')

        if not pw:
            raise serializers.ValidationError(
                {'password': 'Password is required.'}
            )
        if not email:
            raise serializers.ValidationError(
                {'email': 'Email is required.'}
            )

        account = UserModel(
            email=email,
            username=username,
            first_name=self.validated_data.get('first_name', ''),
            last_name=self.validated_data.get('last_name', '')
        )
        account.set_password(pw)
        try:
            account.save()
        except IntegrityError:
            raise serializers.ValidationError('email/username already taken.')
        return account
