"""
URL configuration for b2b_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from b2busers.views import *
from company.views import FilterCompanyByNameAPIView,UserBranchListAPIView
from company.views import *
from navigation.views import NavigationLinksAPIView
from cart.views import *

from company.views import *
from b2busers.adminview import *
from b2busers.adminvieworders import *
from rest_framework.routers import DefaultRouter
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
from product.views import *
from company.urls import urlpatterns as cmp_urls
router = DefaultRouter()
router.register(r'product-groups', ProductGroupViewSet, basename='productgroup')
router.register(r'products', ProductAdminViewSet, basename='product-admin')

import os
urlpatterns = [
    path('administrator/', admin.site.urls),
    path('api/request/resetpassword/' , requestResetPassword ),
    path('api/company-management/', CompanyManagementView.as_view(), name='company-management'),
    path('api/reset_password/' , reset_password),
    path('api/', include('company.urls')),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('api/register_staff/', RegisterStaffView.as_view(), name='register_staff'),
    path('register/' ,CompanyUserRegistrationAPIView.as_view(),name='register_company_admin'),
    path('filter-companies/', FilterCompanyByNameAPIView.as_view(), name='filter-companies'),
    path('branches/create/', CreateBranchView.as_view(), name='create_branch'),
    path('branches/update/<int:pk>/', UpdateBranchView.as_view(), name='update_branch'),
    path('companies/create/', CreateCompanyView.as_view(), name='create_company'),
    path('api/login/', LoginAPIView.as_view(), name='login_api'),
    path('api/user/', UserDetailAPIView.as_view(), name='user-detail'),
    path("api/user/<int:user_id>/", StaffUserDetailView.as_view(), name="staffuser-detail"),
    path('api/users/', UsersListView.as_view(), name='users'),
    path('api/branches/', UserBranchListAPIView.as_view(), name='user-branches'),
    path("api/navigation/", NavigationLinksAPIView.as_view(), name="navigation-links"),
    path("branches/delete/<int:pk>/", DeleteBranchView.as_view(), name="delete-branch"),
    path("api/user/<str:email>/", CheckEmailExistsView.as_view(), name="check-email"),
    path("api/categories/", CategoryListView.as_view(), name="category-list"), 
    path("api/category/move/<int:categoryId>/<str:productId>/", moveProductToCatefory, name="moveProductToCatefory"), 
    path("api/products/", ProductListView.as_view(), name="product-list"),
    path("api/companies/products/<int:company_id>", ProductsPrices.as_view(), name="product-company-list"),
    path("api/products/category/<int:category_id>/", ProductListByCategoryView.as_view(), name="product-list-by-category"), 
    path("api/product_groups/<int:category_id>/", ProductGroupListView.as_view(), name="product-groups-list"), 
    path("api/filter_products/<int:category_id>/", FilterProductsBySubgroups.as_view(), name="filter-products"),  
    path("api/product/<str:part_id>/", GetProductByPartID.as_view(), name="get-product"),    # ✅ API route    # ✅ API endpoint
    path("api/category_hierarchy/<int:category_id>/", CategoryHierarchyAPIView.as_view(), name="category-hierarchy"),
    path("api/users/update/<int:user_id>/",UpdateUserAPIView.as_view()),
    path('api/search_text', WideSearch.as_view(), name='search_text'),
    path('api/add-item/<int:branchid>/', addItem, name='add-item'),
    path('api/download_invoice/<int:order_id>/', OrderInvoiceDownloadView.as_view(), name='download_invoice'),
    path('api/cart/', cart, name='cart'),
    path('api/cart_details/',cartdetails),
    path('api/purchase_request/',purchaseRequest),
    path('api/reorder/<int:order_id>/', reorder, name='reorder'),
    path('api/update_item/<int:id>/' , updateItem),
    path('api/delete_item/<int:id>/' , delete),
    path('api/orders/', OrderListView.as_view(), name='order-list'),
    path('api/admin/update_user/<int:user_id>', AdminUpdateUser.as_view(), name='admin-update_users'),    
    path('api/admin/user/<int:user_id>', AdminUserRow.as_view(), name='admin-user'), 
    path('api/admin/search/', SearchUsers.as_view(), name='admin-search'), 
    path('api/updatelanguage/' , UpdateUserLanguage.as_view()) ,
    path('api/admin/updateorder/<int:order_id>/' , AdminUpdateOrder.as_view())  ,
    path('api/admin/resend_invoice_mail/<int:invoice_id>/' ,AdminResendAdmin.as_view()) ,
    path('api/refresh/',RefreshTokenView.as_view()),
    path('api/admin/orders/',SearchOrders.as_view()),
    path('api/admin/order/<int:order_id>/',AdminOrder.as_view()),
    path('api/products/<str:partId>/similar/', similar_products, name='similar-products'),
    path('api/delete_categories/<str:category_id>/', delete_category, name='delete-category'),
    path('api/admin/categories/',CategoryAdminListView.as_view()),
    path('api/admin/subgroups/<int:group_id>/',savesubgroup, name='savesubgroup'),
    path('api/admin/category/<int:category_id>/',CategoryAdminDetail.as_view()),
    path('api/admin/groups/',AdminProductGroupListView.as_view()),
    path('api/admin/', include(router.urls) ),
    path('api/admin/group/<int:groupid>/' , deleteGroup),
    path('api/admin/categories_admin/',CategorySaveView.as_view()),
    path('api/admin/move/<int:categoryId>/<int:categoryIdParent>/', move_category, name='move-category'),
    path('api/admin/product-detail/<int:product_id>/', ProductDetailedAdminView.as_view(), name='product-detail-admin'),
    path('api/admin/paid-orders/', PaidOrdersView.as_view(), name='paid-orders'),
    path('api/admin/execute-paid/<int:order_id>/', ExecutePaidOrderView.as_view(), name='execute-paid'),
    path('api/admin/processing-orders/', ProcessingOrdersView.as_view(), name='processing-orders'),
    path('api/admin/ready-to-deliver/<int:order_id>/', ReadyToDeliverView.as_view(), name='ready-to-deliver'),
    path('api/admin/undelivered-orders/', UndeliveredOrdersView.as_view(), name='undelivered-orders'),
    path('api/admin/execute-delivery/<int:order_id>/', ExecuteDeliveryView.as_view(), name='execute-delivery'),
    path('api/admin/orders/report/', AdminOrderReportView.as_view(), name='order_report'),
    path('api/admin/orders/items/<int:order_id>/', AdminOrderDetailsReportView.as_view(), name='order_details_report'),
    path('api/admin/companies/', CompanyViewSet.as_view(), name='company-admin'),
    path('api/admin/requests/',AdminDetailsReportPeriodView.as_view()),
    path('api/order/details/<int:order_id>/' , OrderItemDetails.as_view()),
    path('api/contract/',contracts),
    path('api/admin/product_instance/update/<int:productinstance_id>/',AdminUpdateProductInstance.as_view()),
    path('api/companies/<int:company_id>/branches/', get_company_branches, name='company-branches'),
    path('api/company/<int:company_id>/product/<int:product_id>/branches/', get_company_branches_with_product),
  
    path('api/product/<int:product_id>/branches/<int:branch_id>/', ProductBranchDeleteView.as_view(), name='delete-product-branch'),


    # Catch-all route for SPA

]
from django.urls import re_path
from django.views.static import serve as static_serve
from django.views.generic import TemplateView
import re

# This is a safer fallback only for frontend routes that don't start with /api/, /admin/, etc.
def frontend_view(request, path=None):
    return static_serve(request, path='index.html', document_root=os.path.join(settings.BASE_DIR, 'react/dist'))

urlpatterns += [
    # React asset files
    re_path(r'^assets/(?P<path>.*)$', static_serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'react/dist/assets'),
    }),
    
    # React index.html only for non-API/admin routes
    re_path(r'^(?!api/|media/|static/).*$' , frontend_view),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    urlpatterns += [
    path("__debug__/", include(debug_toolbar.urls)),
]