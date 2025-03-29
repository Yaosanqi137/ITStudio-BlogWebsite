from django.contrib.auth.decorators import login_required
from django.shortcuts import render

def homepage_view(request):
    return render(request, "Hub.html")