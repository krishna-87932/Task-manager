from django.urls import path

from . import views

from . import views

urlpatterns = [
    path('login/', views.LoginApi.as_view(), name='userlogin'),
    path('register/',views.RegisterView.as_view(), name="registeruser"),
    path('getuser/<int:pk>', views.UserDetailView.as_view(), name="getuser"),

    path("forgot-password/", views.ForgetUserPassword.as_view()),
    path("reset-password/", views.ResetPassword.as_view()),

    
]
