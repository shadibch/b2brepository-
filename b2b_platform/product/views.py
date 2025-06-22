from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Category, CategoryTranslation, ProductPrice, Product, ProductTranslation, ProductMedia
from .serializers import *
from django.db.models import OuterRef, Subquery
from django.db import transaction
from b2busers.permissions import IsSuperUser
import json
import uuid

from django.http import HttpResponse
from rest_framework.permissions import IsAdminUser

from rest_framework.generics import ListAPIView
from .models import Category
from .serializers import CategorySerializer

class CategoryListView(ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.prefetch_related('translations')[:15]  # Limit to 15 categories

   # ✅ Allows public access

from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Product
from .serializers import ProductSerializer
from rest_framework.pagination import PageNumberPagination

class ProductPagination(PageNumberPagination):
    page_size = 50  # ✅ Limit results to 50 per page

class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        user = self.request.user

      
        return Product.objects.all().prefetch_related("media").prefetch_related("translations").all()

    def get_permissions(self):
        if self.request.user.is_authenticated:
            return [IsAuthenticated()]  # ✅ Restrict advanced queries for logged-in users
        return [AllowAny()]  # ✅ Open access for basic query
class ProductListByCategoryView(ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        user = self.request.user
        category_id = self.kwargs.get("category_id")  # ✅ Correctly extract category ID

        if not Category.objects.filter(id=category_id).exists():
            return Product.objects.none()  # ✅ Return an empty queryset if category doesn't exist


    
        return Product.objects.filter(categories__id=category_id).prefetch_related("translations").prefetch_related("media")  # ✅ **Ensure this line does not end with `.all()`**
        

from .models import ProductGroup
from .serializers import ProductGroupSerializer

from rest_framework.generics import ListAPIView
from .models import ProductGroup
from .serializers import ProductGroupSerializer

class ProductGroupListView(ListAPIView):
    serializer_class = ProductGroupSerializer

    def get_queryset(self):
        category_id = self.kwargs.get("category_id")  # Get category_id from URL
        return ProductGroup.objects.filter(categories_groups__id=category_id).prefetch_related("subgroups").all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  # ✅ Pass the request to the serializer context
        return context
  # ✅ Dynamically filter by category_id

class AdminProductGroupListView(ListAPIView):
    serializer_class = AdminProductGroupSerializer

    def get_queryset(self):
       
        return ProductGroup.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  # ✅ Pass the request to the serializer context
        return context
  # ✅ Dynamically filter by category_id

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q


from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer

class ProductPagination(PageNumberPagination):
    page_size = 50 # ✅ Number of products per page
    page_size_query_param = "page_size"
    max_page_size = 100

class FilterProductsBySubgroups(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    pagination_class = ProductPagination  # ✅ Enable pagination

    def post(self, request, *args, **kwargs):
        subgroup_id_lists = request.data.get("subgroup_id_lists", [])

        if not subgroup_id_lists:
            return Response({"error": "No subgroup IDs provided"}, status=400)
        category_id = self.kwargs.get("category_id")
        
        # ✅ Prefetch translations to optimize database queries
        queryset = Product.objects.filter(categories__id=category_id).prefetch_related("translations")

        user = self.request.user
        # ✅ Apply filtering using AND condition across sublists
        if len(subgroup_id_lists) > 0:
            for subgroup_ids in subgroup_id_lists:
                if len(subgroup_ids) > 0:
                    queryset = queryset.filter(subgroups__id__in=subgroup_ids)
       
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)

        return Response(self.get_serializer(queryset, many=True).data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductSerializer



class GetProductByPartID(APIView):
    permission_classes = [AllowAny]

    def get(self, request, part_id):
        product = get_object_or_404(Product, part_id=part_id)  # ✅ Get product
        serialized_product = ProductSerializer(product, context={"request": request}).data  # ✅ Pass request context
        return Response(serialized_product)
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Category

from rest_framework.generics import ListAPIView
from rest_framework.generics import get_object_or_404
from .models import Category
from .serializers import CategorySerializer
from django.db.models import F
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
class WideSearch(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    pagination_class = ProductPagination  # ✅ Enable pagination
    def get_queryset(self):
        query = self.request.GET.get("q")
        return self.search_products(query).distinct()
    def search_products(self, query):
    # Define the search vectors for both Product and ProductTranslation
        search_vector = (
            SearchVector('name', weight='A') +  # High priority
            SearchVector('description', weight='B')  # Medium priority
        )

        translation_search_vector = (
            SearchVector('translations__name', weight='A') +  # High priority
            SearchVector('translations__description', weight='B')  # Medium priority
        )
        product_search_vector = SearchVector(search_vector)  # Fields in Product model
        translation_search_vector = SearchVector(translation_search_vector)  # Fields in related ProductTranslation

    # Create the search query
        search_query = SearchQuery(query)

    # Annotate rank for both Product and ProductTranslation
        results = Product.objects.annotate(
            rank=SearchRank(product_search_vector, search_query) + SearchRank(translation_search_vector, search_query)
        ).filter(rank__gte=0.01).order_by('-rank')  # Ensure results are distinct and ordered by relevance
        for product in results:
            print(f"Product ID: {product.id}, Rank: {product.rank}")
        return results




class CategoryHierarchyAPIView(ListAPIView):
   
    serializer_class = CategorySerializer

    def get_queryset(self):
        category_id = self.kwargs.get("category_id")  # Get category_id from URL parameters

        category = get_object_or_404(Category, id=category_id)  # Get the initial category
        hierarchy = []

        # Traverse through parent categories till root
        while category is not None:
            hierarchy.insert(0, category)  # Insert category at the start of the list
            category = category.parent  # Move to the parent category

        return hierarchy  # Return the hierarchy as a queryset

class CategoryAdminViewSet(APIView):
    permission_classes = [IsSuperUser]
    
    def get(self, request):
        """Get all categories"""
        categories = Category.objects.filter(parent__isnull=True).prefetch_related(
            'translations',
            'children__translations',
            'groups'
        )
        serializer = CategoryAdminSerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, category_id=None):
        """Create or update a category"""
        try:
            with transaction.atomic():
                if category_id:
                    # Update existing category
                    category = get_object_or_404(Category, id=category_id)
                    translations_data = request.data.get('translations', {})
                    groups = request.data.get('groups', [])
                    parent = request.data.get('parent')

                    # Update translations
                    for lang, data in translations_data.items():
                        CategoryTranslation.objects.update_or_create(
                            category=category,
                            language=lang,
                            defaults={'name': data.get('name', '')}
                        )

                    # Update parent if provided
                    if parent is not None:
                        category.parent_id = parent

                    # Update groups
                    category.groups.set(groups)
                    category.save()

                else:
                    # Create new category
                    translations_data = request.data.get('translations', {})
                    groups = request.data.get('groups', [])
                    parent = request.data.get('parent')

                    # Use first translation as base name
                    first_trans = next(iter(translations_data.values()))
                    category = Category.objects.create(
                        name=first_trans.get('name', ''),
                        parent_id=parent
                    )

                    # Create translations
                    for lang, data in translations_data.items():
                        CategoryTranslation.objects.create(
                            category=category,
                            language=lang,
                            name=data.get('name', '')
                        )

                    # Set groups
                    category.groups.set(groups)

                serializer = CategoryAdminItemSerializer(category, context={'request': request})
                return Response(serializer.data, status=status.HTTP_201_CREATED if not category_id else status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, category_id):
        """Delete a category"""
        try:
            category = get_object_or_404(Category, id=category_id)
            
            # Check for children
            if category.children.exists():
                return Response(
                    {'error': 'Cannot delete category with child categories'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for products
            if category.products.exists():
                return Response(
                    {'error': 'Cannot delete category with associated products'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CategoryMoveAPIView(APIView):
    permission_classes = [IsSuperUser]
    
    def post(self, request, category_id):
        """Move a category to a new parent"""
        try:
            category = get_object_or_404(Category, id=category_id)
            new_parent_id = request.data.get('parent_id')
            
            if new_parent_id:
                # Ensure we're not creating a cycle
                new_parent = get_object_or_404(Category, id=new_parent_id)
                current = new_parent
                while current:
                    if current.id == category.id:
                        return Response(
                            {'error': 'Cannot move category: would create a cycle'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    current = current.parent
                
                category.parent = new_parent
            else:
                category.parent = None
                
            category.save()
            serializer = CategoryAdminItemSerializer(category, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class CategoryAdminListView(ListAPIView):
    permission_classes = [IsSuperUser]
    serializer_class = CategoryAdminSerializer
    
    def get_queryset(self):
        return Category.objects.filter(parent__isnull=True).prefetch_related(
            'translations',
            'children__translations',
            'groups'
        )

class CategoryAdminDetail(APIView):
    permission_classes = [IsSuperUser]
    
    def get(self, request, category_id):
        category = get_object_or_404(Category, id=category_id) 
        serializer = CategoryAdminItemSerializer(category, context={'request': request})
        return Response(serializer.data)

# views.py
from rest_framework import viewsets
from .models import ProductGroup
from .serializers import (
    ProductGroupSerializer, 
    ProductAdminGroupSerializer,
    ProductGroupCreateSerializer
)
from b2busers.permissions import IsSuperUser  # Add import for IsSuperUser

# views.py
from rest_framework import viewsets
from .models import ProductGroup
from .serializers import ProductGroupSerializer
from rest_framework.pagination import PageNumberPagination

class GroupPagination(PageNumberPagination):
    page_size = 10


class ProductGroupViewSet(viewsets.ModelViewSet):
    queryset = ProductGroup.objects.prefetch_related(
        'translations',
        'subgroups__translations'
    )
    permission_classes = [IsSuperUser]
    pagination_class = GroupPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductGroupCreateSerializer
        return ProductAdminGroupSerializer

from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from b2busers.permissions import IsSuperUser
from .models import Category
from .serializers import CategorySerializer, CategoryAdminSerializer
from rest_framework.response import Response
from django.db import transaction
from django.db.models import ProtectedError

class CategoryViewSet(ModelViewSet):
    """
    ViewSet for managing categories in the admin interface.
    Provides CRUD operations with proper permission checks and error handling.
    """
    permission_classes = [IsSuperUser]
    serializer_class = CategoryAdminCreateUpdateSerializer
    queryset = Category.objects.all()
    http_method_names = ['get', 'post', 'put', 'delete', 'patch']  # Explicitly allow POST

    def get_queryset(self):
        """Return categories based on parent filter"""
        queryset = Category.objects.all()
        parent_id = self.request.query_params.get('parent', None)
        
        if parent_id is not None:
            if parent_id == '':  # Empty string means root categories
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
                
        return queryset.prefetch_related('translations', 'groups')

    def create(self, request, *args, **kwargs):
        """Create a new category with translations and groups"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Create the category first
                    category = serializer.save()
                    
                    # Handle translations
                    translations = request.data.get('translations', [])
                    for trans in translations:
                        if trans.get('name'):  # Only create if name is provided
                            CategoryTranslation.objects.create(
                                category=category,
                                language=trans['language'],
                                name=trans['name']
                            )
                    
                    return Response(
                        self.get_serializer(category).data,
                        status=status.HTTP_201_CREATED
                    )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Update an existing category with translations and groups"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Update the category first
                    category = serializer.save()
                    
                    # Handle translations
                    translations = request.data.get('translations', [])
                    
                    # Remove existing translations
                    category.translations.all().delete()
                    
                    # Create new translations
                    for trans in translations:
                        if trans.get('name'):  # Only create if name is provided
                            CategoryTranslation.objects.create(
                                category=category,
                                language=trans['language'],
                                name=trans['name']
                            )
                    
                    return Response(self.get_serializer(category).data)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Delete a category if it has no dependencies"""
        instance = self.get_object()
        try:
            with transaction.atomic():
                # Check for children
                if instance.children.exists():
                    return Response(
                        {'error': 'Cannot delete category with child categories'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check for products
                if instance.products.exists():
                    return Response(
                        {'error': 'Cannot delete category with associated products'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
                
        except ProtectedError:
            return Response(
                {'error': 'Cannot delete category due to protected relations'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PublicCategoryViewSet(ModelViewSet):
    """
    ViewSet for public access to categories.
    Provides read-only access with translations.
    """
    permission_classes = []  # Public access
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    http_method_names = ['get']  # Read-only

    def get_queryset(self):
        """Return categories based on parent filter with translations"""
        queryset = Category.objects.all()
        parent_id = self.request.query_params.get('parent', None)
        
        if parent_id is not None:
            if parent_id == '':  # Empty string means root categories
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
                
        return queryset.prefetch_related('translations')

class CategorySaveView(APIView):
    permission_classes = [IsSuperUser]

    def post(self, request):
        """Create a new category"""
        try:
            translations_data = request.data.get('translations', {})
            
            # Validate at least one translation exists
            if not any(trans.get('name') for trans in translations_data.values()):
                return Response(
                    {'error': 'At least one translation must be provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Determine category name
            if translations_data.get('en', {}).get('name'):
                name = translations_data['en']['name']
            else:
                # Use the first available translation
                name = next(trans['name'] for trans in translations_data.values() if trans.get('name'))

            with transaction.atomic():
                # Create category
                category_data = {
                    'name': name,
                }
                
                # Add parent only if specified and not root
                parent_id = request.data.get('parent')
                if parent_id is not None:
                    category_data['parent_id'] = parent_id

                category = Category.objects.create(**category_data)

                # Create translations
                for lang, trans_data in translations_data.items():
                    if trans_data and trans_data.get('name'):
                        CategoryTranslation.objects.create(
                            category=category,
                            language=lang,
                            name=trans_data['name']
                        )

                # Set groups
                groups = request.data.get('groups', [])
                if groups:
                    category.groups.set(groups)

                serializer = CategoryAdminItemSerializer(category, context={'request': request})
                return Response({
                    'message': 'Category created successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def put(self, request):
        """Update an existing category"""
        try:
            category_id = request.data.get('id')
            if not category_id:
                return Response(
                    {'error': 'Category ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            category = get_object_or_404(Category, id=category_id)
            translations_data = request.data.get('translations', {})

            # Validate at least one translation exists
            if not any(trans.get('name') for trans in translations_data.values()):
                return Response(
                    {'error': 'At least one translation must be provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Determine category name
            if translations_data.get('en', {}).get('name'):
                name = translations_data['en']['name']
            else:
                # Use the first available translation
                name = next(trans['name'] for trans in translations_data.values() if trans.get('name'))

            with transaction.atomic():
                # Update category
                category.name = name
                
                # Update parent only if specified and not root
                parent_id = request.data.get('parent')
                if parent_id is not None:
                    category.parent_id = parent_id
                elif request.data.get('parent') is None:  # Explicitly set to root
                    category.parent = None
                
                category.save()

                # Update translations
                category.translations.all().delete()  # Remove existing translations
                for lang, trans_data in translations_data.items():
                    if trans_data and trans_data.get('name'):
                        CategoryTranslation.objects.create(
                            category=category,
                            language=lang,
                            name=trans_data['name']
                        )

                # Update groups
                groups = request.data.get('groups', [])
                category.groups.set(groups)

                serializer = CategoryAdminItemSerializer(category, context={'request': request})
                return Response({
                    'message': 'Category updated successfully',
                    'data': serializer.data
                })

        except Exception as e:
            print(e)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
import cloudinary.uploader
import cloudinary.uploader

class CategoryAdminCreateUpdateView(CreateAPIView):
    permission_classes = [IsSuperUser]
    serializer_class = CategoryAdminCreateUpdateSerializer
    queryset = Category.objects.all()
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        try:
            translations_data = json.loads(request.data.get('translations', '[]'))
            groups = json.loads(request.data.get('groups', '[]'))

            if not any(trans.get('name') for trans in translations_data):
                return Response(
                    {'error': 'At least one translation must be provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            name = next(trans.get('name') for trans in translations_data if trans.get('name'))
            category_id = request.data.get('id')
            file = request.FILES.get('file')
            parent_id = request.data.get('parent')

            with transaction.atomic():
                file_url = None
                if file:
                    # Upload to Cloudinary manually
                    upload_result = cloudinary.uploader.upload(file)
                    file_url = upload_result.get('secure_url')

                if category_id and category_id != 'null' and category_id != '':
                    category = get_object_or_404(Category, id=category_id)
                    category.name = name
                    if file:
                        category.file = file_url
                    if parent_id and parent_id != 'null':
                        category.parent_id = parent_id
                    category.save()
                else:
                    category = Category.objects.create(
                        name=name,
                        file=file_url,
                        parent_id=parent_id if parent_id and parent_id != 'null' else None
                    )

                category.translations.all().delete()
                for trans_data in translations_data:
                    if trans_data.get('name'):
                        CategoryTranslation.objects.create(
                            category=category,
                            language=trans_data['language'],
                            name=trans_data['name']
                        )

                if groups:
                    category.groups.set(groups)

                serializer = CategoryAdminItemSerializer(category, context={'request': request})
                return Response({
                    'message': 'Category saved successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED if not category_id else status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProductAdminViewSet(ModelViewSet):
    permission_classes = [IsSuperUser]
    serializer_class = ProductAdminSerializer
    parser_classes = (JSONParser,MultiPartParser, FormParser)
    queryset = Product.objects.all()

    def generate_part_id(self):
        # Generate a unique part_id
        while True:
            part_id = str(uuid.uuid4().hex[:8]).upper()
            if not Product.objects.filter(part_id=part_id).exists():
                return part_id

    # Add price-related methods
    @action(detail=True, methods=['get'])
    def prices(self, request, pk=None):
        """Get all prices for a product"""
        product = self.get_object()
        prices = product.prices.all()
        serializer = ProductPriceSerializer(prices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_price(self, request, pk=None):
        """Add or update a price for a product"""
        print(request.data)
        product = self.get_object()
        
        try:
            purchaser_id = request.data.get('purchaser')
            is_percentage = request.data.get('is_percentage', True)
            discount_value = request.data.get('discount_value')

            if not purchaser_id or discount_value is None:
                return Response(
                    {'error': 'Purchaser and discount value are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create the price instance
            price, created = ProductPrice.objects.get_or_create(
                product=product,
                purchaser_id=purchaser_id,
                defaults={
                    'percentage_discount': discount_value if is_percentage else None,
                    'flat_discount': discount_value if not is_percentage else None
                }
            )

            if not created:
                # Update existing price
                if is_percentage:
                    price.percentage_discount = discount_value
                    price.flat_discount = None
                else:
                    price.flat_discount = discount_value
                    price.percentage_discount = None
                price.save()

            serializer = ProductPriceSerializer(price)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['delete'])
    def delete_price(self, request, pk=None):
        """Delete a price for a product"""
        try:
            product = self.get_object()
            price_id = request.query_params.get('price_id')
            
            if not price_id:
                return Response(
                    {'error': 'Price ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            price = get_object_or_404(ProductPrice, id=price_id, product=product)
            price.delete()
            
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Add new media handling methods
    @action(detail=True, methods=['post'])
    def update_media(self, request, pk=None):
        """Replace an existing media file at a specific index"""
        try:
            product = self.get_object()
            index = int(request.query_params.get('index', 0))
            
            if 'images' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            image = request.FILES['images']
            
            # Get the media item at the specified index
            media_items = list(product.media.all())
            if index >= len(media_items):
                return Response(
                    {'error': 'Invalid media index'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete the old media and create new one
            media_items[index].delete()
            ProductMedia.objects.create(
                product=product,
                file=image,
                media_type='image'
            )

            return Response({'message': 'Media updated successfully'})

        except Exception as e:
            print(e)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['delete'])
    def delete_media(self, request, pk=None):
        """Delete a media file at a specific index"""
        try:
            product = self.get_object()
            index = int(request.query_params.get('index', 0))
            
            # Get the media item at the specified index
            media_items = list(product.media.all())
            if index >= len(media_items):
                return Response(
                    {'error': 'Invalid media index'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete the media item
            media_items[index].delete()

            return Response({'message': 'Media deleted successfully'})

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def add_media(self, request, pk=None):
        """Add a new media file to the product"""
        try:
            product = self.get_object()
            
            if 'images' not in request.FILES:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            image = request.FILES['images']
            
            # Create new media
            ProductMedia.objects.create(
                product=product,
                file=image,
                media_type='image'
            )

            return Response({'message': 'Media added successfully'})

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                # Parse JSON data from form fields
                translations = json.loads(request.data.get('translations', '[]'))
                category_id = request.data.get('closest_category')
                closest_category = Category.objects.get(id=category_id)
                subgroups = json.loads(request.data.get('subgroups', '[]'))
                price = request.data.get('base_price')
                stock_quantity = request.data.get('stock_quantity')
                # Validate translations
                availibility = request.data.get('availibility')

                if not any(trans.get('name') for trans in translations):
                    return Response(
                        {'error': 'At least one translation must be provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Get the first available name for the base name
                name = next(trans['name'] for trans in translations if trans.get('name'))
                part_id = request.data.get('part_id')

                # Create product
                product = Product.objects.create(
                    name=name,
                    part_id=part_id,
                    base_price=price,
                    stock_quantity = stock_quantity,
                    closest_category=closest_category,
                    availibility = availibility
                )
                category = closest_category
                categories = []
                while category:
                    categories.append(category)
                    category = category.parent
                product.categories.set(categories)
                # Create translations
                for trans in translations:
                    if trans.get('name') or trans.get('description'):
                        ProductTranslation.objects.create(
                            product=product,
                            language=trans['language'],
                            name=trans.get('name', ''),
                            description=trans.get('description', '')
                        )

                # Handle images
                images = request.FILES.getlist('images')
                for image in images:
                    ProductMedia.objects.create(
                        product=product,
                        file=image
                    )

                # Set groups and subgroups

                product.subgroups.set(subgroups)

                serializer = self.get_serializer(product)
                return Response({
                    'message': 'Product created successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                product = self.get_object()
                
                # Parse JSON data
                translations = json.loads(request.data.get('translations', '[]'))
                category_id = request.data.get('closest_category')
                print(category_id)
                closest_category = Category.objects.get(id=category_id)
                stock_quantity = request.data.get('stock_quantity')
                subgroups = json.loads(request.data.get('subgroups', '[]'))
                price = request.data.get('price')
                availibility = request.data.get('availibility')
                # Validate translations
                if not any(trans.get('name') for trans in translations):
                    return Response(
                        {'error': 'At least one translation must be provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Update base name
                name = next(trans['name'] for trans in translations if trans.get('name'))
                product.name = name
                product.price = price
                product.closest_category=closest_category
                product.stock_quantity = stock_quantity
                product.availibility = availibility
                product.save()
                category = closest_category
                categories = []
                while category:
                    categories.append(category)
                    category = category.parent
                product.categories.set(categories)
                # Update translations
                product.translations.all().delete()
                for trans in translations:
                    if trans.get('name') or trans.get('description'):
                        ProductTranslation.objects.create(
                            product=product,
                            language=trans['language'],
                            name=trans.get('name', ''),
                            description=trans.get('description', '')
                        )

                # Handle new images
                if 'images' in request.FILES:
                    images = request.FILES.getlist('images')
                    for image in images:
                        ProductMedia.objects.create(
                            product=product,
                            file=image
                        )

                # Update groups and subgroups
                
                product.subgroups.set(subgroups)

                serializer = self.get_serializer(product)
                return Response({
                    'message': 'Product updated successfully',
                    'data': serializer.data
                })

        except Exception as e:
            print(e)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            product = self.get_object()
            product.delete()
            return Response(
                {'message': 'Product deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProductDetailedAdminView(APIView):
    permission_classes = [IsSuperUser]
    
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductDetailedAdminSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


