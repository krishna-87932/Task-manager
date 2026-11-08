from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import *
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import *
from django.http import Http404

class AddTask(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddTaskSerializer(data=request.data)

        if serializer.is_valid():
            task = serializer.save(user=request.user)
            # print("user: ", request.user)
            # print("data: ", request.data)
            user_token = Token.objects.get(user=request.user)
            print(request.user)
            return Response({
                "status": True,
                "msg": "Task added successfully",
                "data": {
                    "id": task.id,
                    "title": task.title,
                    "desc": task.desc,
                    "status": task.status,
                    "user_id": task.user_id,
                    "username": task.user.username,
                    "Token": str(user_token)
                }
            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class GetTask(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_task(self, pk):
        try:
            return Tasks.objects.get(pk=pk)
        except Tasks.DoesNotExist:
            raise Http404
        
    def get(self, request, pk):
        task = self.get_task(pk)
        print(task)
        serializer = GetTaskserializer(task)
        return Response({
            "ststus": True,
            "data": 
                serializer.data
            
        })
        
class GetAllTasks(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        tasks = Tasks.objects.filter(user = request.user)
        serializer = GetTaskserializer(tasks, many = True)
        
        return Response({
            "status": True,
            "data": serializer.data
        })
        
        
class DeleteTask(APIView):
    
    def delete(self, request, pk, format = None):
        try:
            task = Tasks.objects.get(pk=pk)
        except Tasks.DoesNotExist:
            return Response(
                {"error": "Task not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class completeTask(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        data = request.data
        try:
            task = Tasks.objects.get(pk=pk)
        except Tasks.DoesNotExist:
            return Response(
                {"error": "Task not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        print(task.status)
        task.status = data['status']
        print(task.status)
        return Response(status=status.HTTP_200_OK)