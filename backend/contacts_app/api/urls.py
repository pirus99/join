from django.urls import path
from .views import ContactDetail, ContactsList

urlpatterns = [
    path('', ContactsList.as_view(), name='contact-list'),
    path('<int:pk>/', ContactDetail.as_view(), name='contact-detail')
]
