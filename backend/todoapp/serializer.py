from rest_framework import serializers
from .models import Tasks
from django.http import Http404




class AddTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = ["id", "title", "desc", "status", "created_at"]
        read_only_fields = ["id", "created_at"]
        
    def create_task(self, taskdata):
        new_task = Tasks.objects.create(
            title = taskdata['title'],
            desc = taskdata['desc'],
            status = taskdata['status']
        )
        return new_task
    
    
class GetTaskserializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = "__all__"
