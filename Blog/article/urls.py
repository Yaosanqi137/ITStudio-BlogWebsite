from django.urls import path
from . import views

app_name = 'article'

urlpatterns = [
    path('list', views.list_view, name='list'),
    path('detail/<int:id>', views.detail_view, name='detail'),
    path('edit/<int:id>', views.edit_view, name='edit'),
    path('create', views.create_view, name='create'),
    path('delete/<int:id>', views.delete_view, name='delete'),
    path('myarticle', views.delete_view, name='delete'),
]