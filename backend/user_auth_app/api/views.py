from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .serializers import RegistrationSerializer, UserProfileSerializer
from .permissions import IsOwnerOrAdmin

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Logged out successfully"}, status=200)

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsOwnerOrAdmin]

class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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
            if 'first_name' in data and "This field is required." in data['first_name']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'last_name' in data and "This field is required." in data['last_name']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'password' in data and "This field is required." in data['password']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'email' in data and "This field is required." in data['email']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

        return Response(data)
    
class CustomLoginView(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request):
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

            if 'non_field_errors' in data and "Unable to log in with provided credentials." in data['non_field_errors']:
                return Response(data, status=status.HTTP_401_UNAUTHORIZED)
            if 'username' in data and "This field is required." in data['username']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            if 'password' in data and "This field is required." in data['password']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(data)
    