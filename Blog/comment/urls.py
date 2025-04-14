from django.urls import path
from . import views

app_name = 'comment'

urlpatterns = [
    path('post/<int:article_id>', views.article_post_view, name='post'),
    path('cafe', views.cafe_view, name='cafe'),
    path('cafe/<int:parent_comment_id>', views.cafe_view, name='cafe_reply'),
]