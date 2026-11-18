from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_status(request):
    return JsonResponse({
        "project": "TAILOR & BOUTIQUE MEASUREMENT BOOK",
        "status": "Online",
        "api_documentation": "/api/health/",
        "author": "College Final Project - Full Stack Implementation"
    })

urlpatterns = [
    path('', root_status, name='root_status'),
    path('api/', include('api.urls')),
]
