from django.db.models import OuterRef, Subquery
from .models import Product, ProductPrice

def get_filtered_products(user, subgroup_id_lists):
    queryset = Product.objects.all()

    if len(subgroup_id_lists) > 0:
        for subgroup_ids in subgroup_id_lists:
            if len(subgroup_ids) > 0:
                queryset = queryset.filter(subgroups__id__in=subgroup_ids)

    if user.is_authenticated:
        custom_price_subquery = ProductPrice.objects.filter(
            product=OuterRef("id"), company=user.company
        ).values("custom_price")[:1]

        queryset = queryset.annotate(base_priceprice=Subquery(custom_price_subquery))

    return queryset
def calculate(user,obj):
  
    if user.is_authenticated:
        product_price = ProductPrice.objects.filter(product=obj, purchaser=user.company).first()
       
        return ( 0 if not product_price else
            product_price.flat_discount if  product_price.flat_discount and product_price.flat_discount >0
            else obj.base_price * (100 - product_price.percentage_discount) / 100 if product_price and product_price.percentage_discount and product_price.percentage_discount  >0
            else obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount >0 
            else obj.base_price
            )
    else:
        return  obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount > 0 else 0
        
def getProductName(language,obj):
    translation = obj.translations.filter(language=language).first()
    return translation.name if translation else obj.name