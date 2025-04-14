from django import forms
from .models import Comment, Chat


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('body',)

class ChatForm(forms.ModelForm):
    class Meta:
        model = Chat
        fields = ('body',)