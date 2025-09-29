from django.shortcuts import render

from rest_framework.decorators import api_view

# Create your views here.
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Company, Branch, ProductContract
from .serializers import CompanySerializer, BranchSerializer, BranchSerializerCompany
from django.db.models import Q
class FilterCompanyByNameAPIView(APIView):
    def get(self, request, *args, **kwargs):
        query_string = request.query_params.get('q', '')  # Get the query string from the request
        companies = Company.objects.filter(name__icontains=query_string)  # Filter companies ignoring case
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class CreateCompanyView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSuperUserOrCompanyAdmin  # Import the custom permission

class CreateBranchView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUserOrCompanyAdmin]  # ✅ Restrict access

    def post(self, request, *args, **kwargs):
        serializer = BranchSerializerCompany(data=request.data)

        if serializer.is_valid():
            # ✅ Create branch manually using validated data
            branch = Branch.objects.create(
                name=serializer.validated_data['name'],
                address=serializer.validated_data['address'],
                phone=serializer.validated_data['phone'],
                company=request.user.company  # ✅ Assign logged-in user's company
            )

            return Response(BranchSerializerCompany(branch).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class UpdateBranchView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUserOrCompanyAdmin]  # ✅ Restrict access

    def post(self, request, pk, *args, **kwargs):
        try:
            branch = Branch.objects.get(pk=pk)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BranchSerializerCompany(branch, data=request.data)
        
        if serializer.is_valid():
            # ✅ Update fields manually using validated data
            branch.name = serializer.validated_data['name']
            branch.address = serializer.validated_data['address']
            branch.phone = serializer.validated_data['phone']
            branch.company = request.user.company  # ✅ Ensure company is correctly assigned
            branch.save()

            return Response(BranchSerializerCompany(branch).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import BasePermission




from rest_framework.permissions import IsAuthenticated
from company.models import Branch
from .serializers import BranchSerializer

from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from company.models import Branch
from .serializers import BranchSerializer

class UserBranchListAPIView(generics.ListAPIView):
    serializer_class = BranchSerializerCompany
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'company_admin':
            return user.company.branches.all()  # Get all branches under the company
        else:
            return user.branches.all()  # Get branches linked to the user

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Branch
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSuperUserOrCompanyAdmin
from .serializers import BranchSerializerCompany
@api_view(['GET'])
def get_company_branches(request, company_id):
    branches = Branch.objects.filter(company_id=company_id)
    serializer = BranchSerializerCompany(branches, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Branch
from .serializers import BranchWithProductSerializer

@api_view(['GET'])
def get_company_branches_with_product(request, company_id, product_id):
    branches = Branch.objects.filter(company_id=company_id).prefetch_related('branch_contract')
    serializer = BranchWithProductSerializer(branches, many=True, context={'product_id': product_id})
    return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteBranchView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUserOrCompanyAdmin]  # ✅ Restrict access

    def delete(self, request, pk, *args, **kwargs):
        try:
            branch = Branch.objects.get(pk=pk)
            branch.delete()  # ✅ Only deletes the branch, company remains
            return Response({"message": f'Branch "{branch.name}" deleted successfully!'}, status=status.HTTP_200_OK)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Company
from .serializers import CompanySerializer

class CompanyPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser
from rest_framework.generics import *
class CompanyViewSet(ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    pagination_class = CompanyPagination
    permission_classes = [IsSuperUser]
    
    def get_queryset(self):
        queryset = Company.objects.all().order_by('name')
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(register_number__icontains=search_query)
            )
        
        return queryset.order_by('name') 

class ContractItemsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUserOrCompanyAdmin]

    def post(self, request, branch_id):
        try:
            branch = Branch.objects.get(pk=branch_id)
            items = request.data.get('items', [])
            for item in items:
                product = Product.objects.get(pk=item)
                contract, created = ProductContract.objects.get_or_create(branch=branch,product=product)
            
         
            
            return Response({'message': 'Items added successfully'}, status=status.HTTP_200_OK)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, branch_id, item_id):
        try:
            branch = Branch.objects.get(pk=branch_id)
            if not branch.branch_contract:
                return Response({'error': 'No contract found'}, status=status.HTTP_404_NOT_FOUND)
            product = Product.objects.get(pk=item_id)
            ProductContract.objects.filter(branch=branch, product=product).delete()

            return Response({'message': 'Item removed successfully'}, status=status.HTTP_200_OK)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)

class UpdateCompanyView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def patch(self, request, company_id):
        try:
            company = Company.objects.get(pk=company_id)
            serializer = CompanySerializer(company, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)





    
