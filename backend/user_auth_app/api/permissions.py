"""
Custom permission classes for the user authentication application.

This module defines permission classes for controlling access to
user-related API endpoints.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrAdmin(BasePermission):
    """
    Permission class that allows access only to object owners or admins.

    Read operations (GET, HEAD, OPTIONS) are allowed for all users.
    Write operations require the user to be either the object owner
    or a superuser.
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission to access the object.

        Args:
            request: The HTTP request.
            view: The view being accessed.
            obj: The object being accessed.

        Returns:
            bool: True if permission is granted, False otherwise.
        """
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False

        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        owner_id = None
        if owner is not None:
            owner_id = (
                getattr(owner, "pk", None) or
                getattr(owner, "id", None) or
                (owner if isinstance(owner, int) else None)
            )
        else:
            owner_id = getattr(obj, "pk", None) or getattr(obj, "id", None)

        return bool(
            user.is_superuser or (owner_id is not None and user.id == owner_id)
        )
