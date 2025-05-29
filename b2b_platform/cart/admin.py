from django.contrib import admin
from .models import *
from django.apps import apps
app = apps.get_app_config('cart')
for model_name, model in app.models.items():
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
# Register your models here.
