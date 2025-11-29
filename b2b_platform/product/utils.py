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
from company.models import ProductContract
def calculateByBranch(branch,obj):
            
    product_contract = ProductContract.objects.filter(product=obj, branch=branch).first()
    if product_contract:      
        return product_contract.price
    company = branch.company
    product_price = ProductPrice.objects.filter(product=obj, purchaser=company).first()

    return ( obj.base_price if not product_price else
        product_price.flat_discount if  product_price.flat_discount and product_price.flat_discount >0
        else obj.base_price * (100 - product_price.percentage_discount) / 100 if product_price and product_price.percentage_discount and product_price.percentage_discount  >0
        else obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount >0 
        else obj.base_price
         )
def calculatesByCompany(company,obj):
     product_price = ProductPrice.objects.filter(product=obj, purchaser=company).first()
     print(str(product_price))
     return ( obj.base_price if not product_price else
        product_price.flat_discount if  product_price.flat_discount and product_price.flat_discount >0
        else obj.base_price * (100 - product_price.percentage_discount) / 100 if product_price and product_price.percentage_discount and product_price.percentage_discount  >0
        else obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount >0 
        else obj.base_price
         )

    
def calculate(user,obj):
    
    if user.is_authenticated and user.company:
        branchs = user.branches.all()
        
        if branchs.count() == 1:
            branch = branchs.first()
            
           
            product_contract = ProductContract.objects.filter(product=obj, branch=branch).first()
              
            if product_contract:
              
                return product_contract.price
        product_price = ProductPrice.objects.filter(product=obj, purchaser=user.company).first()

        return ( obj.base_price if not product_price else
            product_price.flat_discount if  product_price.flat_discount and product_price.flat_discount >0
            else obj.base_price * (100 - product_price.percentage_discount) / 100 if product_price and product_price.percentage_discount and product_price.percentage_discount  >0
            else obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount >0 
            else obj.base_price
            )
    else:
        return  obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount > 0 else 0
def price(branch,obj):
    
    product_contract = ProductContract.objects.filter(product=obj, branch=branch).first()
    if product_contract:
        return product_contract.price
    print(f"******************{branch.company}******************")
    product_price = ProductPrice.objects.filter(product=obj, purchaser=branch.company).first()
       
    return ( obj.base_price if not product_price else
                product_price.flat_discount if 
                product_price.flat_discount and product_price.flat_discount >0
                else obj.base_price * (100 - product_price.percentage_discount) / 100 if product_price and product_price.percentage_discount and product_price.percentage_discount  >0
                else obj.base_price * (100 - obj.discount) / 100 if obj.discount and obj.discount >0 
                else obj.base_price
            )
      
def getProductName(language, obj):
    for t in obj.translations.all():  # uses prefetched results
        if t.language == language:
            return t.name
    return obj.name
