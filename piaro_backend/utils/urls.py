from django.urls import path
from .views import get_content_types

urlpatterns = [
    path('content_types/', get_content_types, name='get_content_types'),
]
