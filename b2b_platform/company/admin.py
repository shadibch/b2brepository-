from django.contrib import admin
from .models import Company, Branch, Contract
from product.models import Product

class ContractInline(admin.TabularInline):
    model = Contract
    extra = 0
    verbose_name = "Contract"
    verbose_name_plural = "Contracts"
    fields = ('id',)

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
    inlines = [ContractInline]

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_items_count')
    search_fields = ('items__name', 'items__part_id')
    filter_horizontal = ('items',)

    def get_items_count(self, obj):
        return obj.items.count()
    get_items_count.short_description = 'Number of Items'
