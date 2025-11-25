"""
API views for user authentication.

This module provides API endpoints for user registration, login, logout,
and user profile management.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegistrationSerializer, UserProfileSerializer
from .permissions import IsOwnerOrAdmin


class LogoutView(APIView):
    """
    API view for user logout.

    Deletes the user's authentication token to log them out.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Handle logout request.

        Args:
            request: The HTTP request containing the authenticated user.

        Returns:
            Response with logout confirmation message.
        """
        request.user.auth_token.delete()
        return Response({"message": "Logged out successfully"}, status=200)


class UserList(generics.ListAPIView):
    """
    API view to list all users.

    GET: Returns a list of all registered users.
    """

    queryset = User.objects.all()
    serializer_class = UserProfileSerializer


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a specific user.

    Only the owner or admin can modify user data.
    """

    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsOwnerOrAdmin]


class RegistrationView(APIView):
    """
    API view for user registration.

    Creates a new user account and returns an authentication token.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handle user registration request.

        Args:
            request: The HTTP request containing user registration data.

        Returns:
            Response with user data and token on success,
            or validation errors on failure.
        """
        serializer = RegistrationSerializer(data=request.data)

        data = {}
        if serializer.is_valid():
            saved_account = serializer.save()
            token, created = Token.objects.get_or_create(user=saved_account)
            data = {
                'id': saved_account.id,
                'token': token.key,
                'first_name': saved_account.first_name,
                'last_name': saved_account.last_name,
                'username': saved_account.username,
                'email': saved_account.email
            }
        else:
            data = serializer.errors
            if 'first_name' in data and \
                    "This field is required." in data['first_name']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'last_name' in data and \
                    "This field is required." in data['last_name']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'password' in data and \
                    "This field is required." in data['password']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'email' in data and \
                    "This field is required." in data['email']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

        return Response(data, status=201)


class CustomLoginView(ObtainAuthToken):
    """
    Custom login view extending Django REST framework's ObtainAuthToken.

    Returns user details along with the authentication token.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handle login request.

        Args:
            request: The HTTP request containing login credentials.

        Returns:
            Response with user data and token on success,
            or authentication errors on failure.
        """
        serializer = self.serializer_class(data=request.data)

        data = {}
        if serializer.is_valid():
            user = serializer.validated_data['user']

            token, created = Token.objects.get_or_create(user=user)
            data = {
                'id': user.id,
                'token': token.key,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }
        else:
            data = serializer.errors

            if 'non_field_errors' in data and \
                    "Unable to log in with provided credentials." in \
                    data['non_field_errors']:
                return Response(data, status=status.HTTP_401_UNAUTHORIZED)
            if 'username' in data and \
                    "This field is required." in data['username']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'password' in data and \
                    "This field is required." in data['password']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

        return Response(data)
    