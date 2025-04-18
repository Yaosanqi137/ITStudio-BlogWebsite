from django.db import models
from user.models import BlogUser

class UserMessage(models.Model):
    user = models.ForeignKey(BlogUser, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    redirect_url = models.URLField(blank=True, null=True)