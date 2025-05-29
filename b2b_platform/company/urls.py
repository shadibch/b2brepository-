from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, ContractItemsView, UpdateCompanyView

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)

urlpatterns = [
    path('branches/<int:branch_id>/contract/items/', ContractItemsView.as_view(), name='contract-items'),
    path('branches/<int:branch_id>/contract/items/<int:item_id>/', ContractItemsView.as_view(), name='contract-item-detail'),
    path('companies/<int:company_id>/', UpdateCompanyView.as_view(), name='update-company'),
] 