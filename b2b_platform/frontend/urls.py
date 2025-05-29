from django.urls import re_path
from .views import FrontendAppView

urlpatterns = [
    re_path(r'^', FrontendAppView.as_view(), name='react-app'),
]

