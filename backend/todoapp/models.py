from django.db import models
from datetime import date
from django.contrib.auth import get_user_model

User = get_user_model()

class Tasks(models.Model):
    title = models.CharField(null=False,blank=False, max_length=150)
    desc = models.CharField( max_length=700)
    status = models.BooleanField()
    created_at = models.DateField(auto_now_add=False,default=date.today)
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="task",
        # null=True,
        # blank=True
        
    )
    
    def __str__(self) -> str:
        return f"{self.id}  {self.title} - {self.user.username}"
    
    
    
    
