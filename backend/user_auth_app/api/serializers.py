from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import IntegrityError

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
         
        UserModel = get_user_model()
        pw = self.validated_data.get('password')
        email = self.validated_data.get('email')
        username = self.validated_data.get('email') #Using E-Mail instead of username to sign-in

        if not pw:
            raise serializers.ValidationError({'password': 'Password is required.'})
        if not email:
            raise serializers.ValidationError({'email': 'Email is required.'})

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
