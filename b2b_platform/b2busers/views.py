# views.py
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from django.http import response
from b2b_platform.settings import EMAIL_HOST, EMAIL_HOST_EMAIL, EMAIL_HOST_PASSWORD, EMAIL_HOST_USER, EMAIL_PORT, EXPIARY_TOKEN_TIME
from b2busers.utils import addMinutesToNow, newtoken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer,CompanyUserRegistrationSerializer,UpdateUserSerializer
from rest_framework.views import APIView
from rest_framework import generics

from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .permissions import IsSuperUserOrCompanyAdmin
from rest_framework.permissions import IsAuthenticated
from .serializers import StaffUserDetailSerializer
from .permissions import IsCompanyAdmin
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add extra fields to the token payload
        data['username'] = self.user.username
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name

        # If the user has a company, include its name
        if hasattr(self.user, 'company'):
            data['company'] = self.user.company.name if self.user.company else None

        return data

from django.db.models import Q

from rest_framework_simplejwt.views import TokenObtainPairView

class LoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email").lower()
        password = request.data.get("password")

        user = authenticate(email=email, password=password)
         
        if user:
            refresh = RefreshToken.for_user(user)
            response = {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "main_url" : "/admin/order-management" if user.is_superuser else "/cartdetails" if self.is_contract(user)  else "/"
            }
            if not user.is_superuser:
                result = user.orders.filter(
    Q(status='ACC') | Q(status='PRJ'),
    order_status='UNP'
).order_by('-invoice__expirePaymentDate'
).values_list('invoice__expirePaymentDate', 'id', flat=False).first()

                if result:
                    latest, id = result
                    response["expiry_order"] = (latest,id)
            return Response(response)
            
        else:
            return Response({"error": "Invalid credentials"}, status=400)
    def is_contract(self,user):
        return user.is_authenticated and user.company and user.role != "company_admin" and user.company.branches.filter(branch_contract__isnull=False).exists()


class RegisterStaffView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUserOrCompanyAdmin]  # ✅ Restrict access

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.company = request.user.company
            user.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import StaffUserSerializer
from .permissions import IsCompanyAdmin  # ✅ Import custom permission

class UsersListView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyAdmin]  # ✅ Restrict access

    def get(self, request, *args, **kwargs):
        company = request.user.company  # ✅ Get the logged-in user's company
        users = CustomUser.objects.filter(company=company).exclude(id=request.user.id)  # ✅ Exclude self

        serializer = StaffUserSerializer(users, many=True)
        return Response(serializer.data, status=200)



from .models import CustomUser
from .serializers import UserSerializer

from rest_framework.permissions import IsAuthenticated




from .serializers import UserSerializer

class UserDetailAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  # Get logged-in user
 # Retrieve branches linked to the logged-in user

class UpdateUserAPI(APIView):
    def post(self,request):
        serializer = UpdateUserSerializer(data=request.data)
        user = serializer.save()
        return Response({"message": "User created successfully", "user_id": user.id}, status=status.HTTP_201_CREATED)

class CompanyUserRegistrationAPIView(APIView):
    def post(self, request):
        serializer = CompanyUserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully", "user_id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import CustomUser

@api_view(['POST'])
def requestResetPassword(request):
    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        # Prevent email enumeration (security best practice)
        return Response(status=status.HTTP_200_OK)

    user.reset_token = newtoken()
    user.reset_expiary_date = addMinutesToNow(EXPIARY_TOKEN_TIME)
    user.save()

    sendUserResetRequest(user)

    return Response(status=status.HTTP_200_OK)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from .models import CustomUser

@api_view(['POST'])
def reset_password(request):
    """
    Reset user password using a reset token.
    Expects JSON:
    {
        "reset_token": "token_here",
        "new_password": "NewPass123!",
        "confirm_password": "NewPass123!"
    }
    """
    data = request.data
    reset_token = data.get("reset_token")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    if not reset_token or not new_password or not confirm_password:
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(reset_token=reset_token)
        if not user.reset_expiary_date or timezone.make_aware(user.reset_expiary_date) < timezone.now():
            return Response({"error": "Reset token has expired."}, status=status.HTTP_400_BAD_REQUEST)

    except CustomUser.DoesNotExist:
        return Response({"error": "Invalid reset token."}, status=status.HTTP_400_BAD_REQUEST)

 

    # Set new password
    user.set_password(new_password)
    # Clear reset token and expiry
    user.reset_token = None
    user.reset_expiary_date = None
    user.save()

    return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)


from django.utils.translation import gettext as _
def sendUserResetRequest(user):
    message = MIMEMultipart()
    message["Subject"] = _("RESET_SUBJECT")
    
        
    sender_email = EMAIL_HOST_EMAIL
    receiver_email = user.email
    message["From"] = sender_email
    message["To"] = receiver_email
    body = _("RESET_MESSAGE_PASSWORD") % {
    "name": user.first_name,
    "token": user.reset_token,
}
    # Create the multipart email


    # Attach the text part
    message.attach(MIMEText(body, "html"))
 
      
    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
        server.starttls()  # Secure the connection
        server.login(EMAIL_HOST_USER , EMAIL_HOST_PASSWORD )
        server.sendmail( EMAIL_HOST_EMAIL, user.email ,message.as_string())



class StaffUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyAdmin]  # ✅ Restrict access to company admins

    def get(self, request, user_id, *args, **kwargs):
        try:
            user = CustomUser.objects.get(id=user_id, company=request.user.company)  # ✅ Ensure user belongs to the same company
            serializer = StaffUserDetailSerializer(user)
            return Response(serializer.data, status=200)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found or not in your company'}, status=404)
            
from rest_framework.views import APIView
from rest_framework.response import Response



class CheckEmailExistsView(APIView):
   

    def get(self, request, email, *args, **kwargs):
        exists = CustomUser.objects.filter(email=email).exists()  # ✅ Check email existence
        return Response({"exists": exists}, status=200)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import UpdateUserSerializer
from django.shortcuts import get_object_or_404

class UpdateUserAPIView(APIView):
    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = UpdateUserSerializer(user, data=request.data)

        if serializer.is_valid():
            updated_user = serializer.save()  # Calls the `update` method
            return Response(UpdateUserSerializer(updated_user).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UpdateUserLanguage(APIView):
    permission_classes = [IsAuthenticated] 
    def post(self, request):
       user = request.user
       language = request.data.get('language', 'ar-SA')
       user.language = language
       user.save()
       return Response(UpdateUserSerializer(user).data, status=status.HTTP_200_OK)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)

            return Response({
                "access": new_access_token,
                "access_expires": int(refresh.access_token.payload['exp'])
            })
        except Exception as e:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
 
# views.py






