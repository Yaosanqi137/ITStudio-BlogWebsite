from django.urls import path
from . import views

app_name = 'comment'

urlpatterns = [
    path('post/<int:article_id>', views.article_post_view, name='post'),
]