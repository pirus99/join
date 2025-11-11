from django.urls import path
from .views import ContactDetail, ContactList

urlpatterns = [
    path('', ContactList.as_view(), name='contact-list'),
    path('<int:pk>/', ContactDetail.as_view(), name='contact-detail')
]
