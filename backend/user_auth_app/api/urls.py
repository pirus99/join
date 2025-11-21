from django.urls import path, include
from .views import UserList, UserDetail, RegistrationView, CustomLoginView, LogoutView

urlpatterns = [
    path('users/', UserList.as_view(), name='userprofile-list'),
    path('users/<int:pk>/', UserDetail.as_view(), name='userprofile-detail'),
    path('registration/', RegistrationView.as_view(), name='registration'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout')
]
