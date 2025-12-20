from django.urls import path, include
from rest_framework.routers import DefaultRouter
from product.views import *
from .views import (
    ProductViewSet,
    ProductGroupViewSet,
    CategoryAdminViewSet,
    CategoryMoveAPIView,
    CategoryAdminListView,
    CategoryAdminDetail,
    CategoryListView,
    CategorySaveView,
    CategoryViewSet,
    PublicCategoryViewSet,
    AdminOrderReportView,
    # ... other views
)

router = DefaultRouter()
router.register(r'admin/product-groups', ProductGroupViewSet, basename='admin-product-group')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories_admin', CategoryViewSet, basename='category-admin')
router.register(r'categories', PublicCategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
     
    # Category Admin CRUD endpoints
    path('admin/save_category/', CategorySaveView.as_view(), name='category-save'),
    path('admin/category/', CategoryAdminViewSet.as_view(), name='category-admin-create-list'),
    path('admin/category/<int:category_id>/', CategoryAdminViewSet.as_view(), name='category-admin-detail'),
    path('admin/category/<int:category_id>/move/', CategoryMoveAPIView.as_view(), name='category-move'),
    
    # Category list endpoints
    path('admin/categories/', CategoryAdminListView.as_view(), name='category-admin-list'),
    path('admin/category/<int:category_id>/detail/', CategoryAdminDetail.as_view(), name='category-admin-get-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('api/admin/orders/report/', AdminOrderReportView.as_view(), name='admin-order-report'),
] 