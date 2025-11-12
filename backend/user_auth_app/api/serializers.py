from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email']

class LoginSerializer(serializers.Serializer):

    class Meta:
        model = User
       
class RegistrationSerializer(serializers.ModelSerializer):

    class Meta:
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
        pw= self.validated_data['password']
        account = User(email=self.validated_data['email'], username=self.validated_data['email'], first_name=self.validated_data['first_name'], last_name=self.validated_data['last_name'])
        account.set_password(pw)
        account.save()
        return account
