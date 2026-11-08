from rest_framework.decorators import api_view
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializer import *
from django.contrib.auth.models import User
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    


class LoginApi(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'
    # permission_classes = [IsAuthenticated] // adds a authentication reqird  
    def post(self, request):
        
        data = request.data
        serializer = LoginSerializer(data=data)
        
        if not serializer.is_valid():
            return Response({
                'status': False,
                'msg': serializer.errors
            })
        username = serializer.data['username']
        password = serializer.data['password']
        print(username,password)
            
        user_ojb = authenticate(username = username, password= password)
        
        if user_ojb:
            token,_ = Token.objects.get_or_create(user=user_ojb)
            return Response({
                "status": True,
                "data": {'token': str(token)}
            })

        
        return Response(
            {
                "status": False,
                "data": {},
                'msg': "Invalid Credintials."
            }
        )
        


class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        serializer = RegisterSerializer(data=data)
        
        if serializer.is_valid():
            print(request.user)
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'status':True,
                'data': {
                    'id':user.id,
                    'username':user.username,
                    'token':str(token)
                    },
                'message':'user created sucsessful.'
            })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgetUserPassword(APIView):
     def post(self, request):

        email = request.data.get("email")

        if not email:
            return Response(
                {"message": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        # Use the same response whether the account exists or not.
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = (
                f"http://localhost:3000/reset-password"
                f"?uid={uid}&token={token}"
            )

            send_mail(
                subject="Reset your password",
                message=f"Click this link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response({
            "status": True,
            "message": "If an account exists with this email, a reset link has been sent."
        })
        
        

class ResetPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not all([uid, token, password, confirm_password]):
            return Response(
                {"message": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {"message": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            return Response(
                {"message": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"message": "Invalid or expired reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response(
                {"message": error.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(password)
        user.save()

        # Invalidate existing DRF authentication tokens.
        Token.objects.filter(user=user).delete()

        return Response({
            "status": True,
            "message": "Password reset successfully. Please log in again."
        })
        
        