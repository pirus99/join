from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrAdmin(BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        owner_id = None
        if owner is not None:
            owner_id = getattr(owner, "pk", None) or getattr(owner, "id", None) or (owner if isinstance(owner, int) else None)
        else:
            owner_id = getattr(obj, "pk", None) or getattr(obj, "id", None)

        return bool(user.is_superuser or (owner_id is not None and user.id == owner_id))
