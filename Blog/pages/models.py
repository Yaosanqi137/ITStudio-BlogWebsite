from django.db import models
from user.models import BlogUser

class UserMessage(models.Model):
    user = models.ForeignKey(BlogUser, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    redirect_url = models.URLField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])

    @property
    def unread_count(self):
        return UserMessage.objects.filter(user=self, is_read=False).count()