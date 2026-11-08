from django.urls import path
from . import views

urlpatterns = [
    path('addtask/', views.AddTask.as_view(),name="add_task"),
    path('gettask/<int:pk>/', views.GetTask.as_view(), name="get_id_task"),
    path('alltasks/', views.GetAllTasks.as_view(), name="get_all_task"),
    path('delete/<int:pk>/', views.DeleteTask.as_view(), name="single_delete"),
    path('update-state/<int:pk>/', views.completeTask.as_view(), name="update-status")
]
