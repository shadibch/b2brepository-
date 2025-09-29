from django.contrib import admin
from .models import Company, Branch
from product.models import Product



class BranchInline(admin.TabularInline):
    model = Branch
    extra = 0
    fields = ('name', 'address', 'phone')

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'register_number', 'credit', 'period', 'address')
    search_fields = ('name', 'register_number', 'address')
    readonly_fields = ('name', 'register_number', 'address')
    fieldsets = (
        ('Company Information', {
            'fields': ('name', 'register_number', 'address')
        }),
        ('Credit Information', {
            'fields': ('credit', 'period')
        }),
    )
    inlines = [BranchInline]

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'phone', 'company')
    search_fields = ('name', 'address', 'phone', 'company__name')
    list_filter = ('company',)



