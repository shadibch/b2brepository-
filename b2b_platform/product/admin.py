from django.contrib import admin
from .models import *
admin.site.register(Product)
admin.site.register(ProductMedia)
admin.site.register(ProductGroup)
admin.site.register(ProductSubGroup)
admin.site.register(Category)
admin.site.register(ProductAttribute)
admin.site.register(ProductPrice)
admin.site.register(CategoryTranslation)
admin.site.register(ProductGroupTranslation)
admin.site.register(ProductSubgroupTranslation)
admin.site.register(ProductTranslation)

