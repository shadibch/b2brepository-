from rest_framework.permissions import BasePermission

class IsSuperUserOrCompanyAdmin(BasePermission):
    """
    Custom permission to allow only superusers or company_admin users.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser or request.user.role == "company_admin")
        



class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsCompanyAdmin(BasePermission):
    """
    Custom permission to allow only company_admin users.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "company_admin"
