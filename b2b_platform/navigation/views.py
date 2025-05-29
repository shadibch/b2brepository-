from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class NavigationLinksAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def get(self, request):
        user = request.user
        
        # Define links based on role
        role_links = {
            "company_admin": [
                {"name": "Branches", "url": "branches"},
                {"name": "Manage Users", "url": "users"},
                {"name": "Orders", "url": "orders"},
            ],
            "staff": [
                {"name": "Home", "url": "/"},
                {"name": "My Orders", "url": "/orders"},
                {"name": "Support", "url": "/support"},
            ],
            "guest": [
                {"name": "Home", "url": "/"},
                {"name": "Login", "url": "/login"},
                {"name": "Sign Up", "url": "/register"},
            ]
        }
        
        # Get links based on user role
        links = role_links.get(user.role, role_links["guest"])  # Default to 'guest' if no role
        
        return Response({"links": links})
