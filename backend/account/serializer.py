from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        elif User.objects.filter(email = data['email']).exists():
                raise serializers.ValidationError("This Eemail already exist.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            **{'password': validated_data['password']}
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()



class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()