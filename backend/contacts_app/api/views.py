from rest_framework import generics
from contacts_app.models import Contact
from .serializers import ContactSerializer

class ContactList(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    #permission_classes = [AllowAll]

class ContactDetail(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer