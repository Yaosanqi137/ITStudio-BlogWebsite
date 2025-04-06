from django import forms
from .models import Article

class ArticlePostForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'body', 'head_img', 'category']