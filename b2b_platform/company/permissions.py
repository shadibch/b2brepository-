from rest_framework.permissions import BasePermission
class IsSuperUserOrCompanyAdmin(BasePermission):
    """
    Custom permission to allow only superusers or company_admin users.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser or request.user.role == "company_admin")