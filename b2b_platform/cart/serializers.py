# serializers.py
from rest_framework import serializers
from .models import *
from product.utils import *
from django.db.models import Q
from product.serializers import ProductSerializer
class CartSerializer(serializers.ModelSerializer):
     cart_items_count = serializers.SerializerMethodField()
     class Meta:
        model = ProductInstance
        fields = ['id', 'cart_items_count']
     def get_cart_items_count(self,obj):
            return obj.instances.count()
class ProductInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInstance
        fields = ['id', 'product', 'price',  'currency', 'quantity', 'branch']

class ProductInstanceUpdateSerializer(serializers.ModelSerializer):
     part_id = serializers.SerializerMethodField()  
     image_path = serializers.SerializerMethodField()
     cart_items_count = serializers.SerializerMethodField()
     project_name = serializers.SerializerMethodField()
     branch_name = serializers.SerializerMethodField()
    
     class Meta:
        model = ProductInstance
        fields = ['branch_name','project_name' , 'id', 'part_id', 'image_path', 'price',  'currency',  'quantity', 'branch','cart' ,'cart_items_count','status','rejection_reason']    


     def get_part_id(self, obj):
        return obj.product.part_id
     def get_image_path(self, obj):
        media = obj.product.media.all()
        return media[0].file if media and media.count() > 0 else None
     def get_cart_items_count(self,obj):
        return obj.cart.instances.count() if obj.cart else obj.order.items.count()
     def get_project_name(self,obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  
        return getProductName(language, obj.product)
     def get_branch_name(self,obj):
         return obj.branch.name
    
class ProductInstanceAdminSerializer(serializers.ModelSerializer):
     part_id = serializers.SerializerMethodField()  
     product_id = serializers.SerializerMethodField()
     image_path = serializers.SerializerMethodField()

     project_name = serializers.SerializerMethodField()
     branch_name = serializers.SerializerMethodField()
    
     class Meta:
        model = ProductInstance
        fields = ['product_id' ,'branch_name','project_name' ,
                   'id', 'part_id', 'image_path', 'price',  'currency',
                       'quantity', 'branch','cart','status','rejection_reason' ]    

     def get_product_id(self, obj):
        return obj.product.id  
     def get_part_id(self, obj):
        return obj.product.part_id
     def get_image_path(self, obj):
        media = obj.product.media.all()
        return media[0].file.url if media and media.count() > 0 else None
    
     def get_project_name(self,obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  
        return getProductName(language, obj.product)
     def get_branch_name(self,obj):
         return obj.branch.name


class CartDetailsSerializer(serializers.ModelSerializer):
    instances = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    class Meta:
        model = Cart
        fields = ['total_price', 'currency', 'instances']  # ✅ Corrected here

    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.instances.all()) 

    def get_currency(self,obj):
        instances =  obj.instances.all()
        return instances[0].currency if instances.count() > 0 else None        
    def get_instances(self, obj):
        sorted_instances = obj.instances.all().order_by('id')
        serializer = ProductInstanceUpdateSerializer(sorted_instances, many=True)
        return serializer.data
class ContractSerializer(serializers.ModelSerializer):
    items = ProductSerializer(many=True)
    class Meta:
        model = Contract
        fields = ["items"]

class OrderSerializer(serializers.ModelSerializer):
    items = ProductInstanceUpdateSerializer(many=True)
    total_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ["items","id","total_price","currency"]

    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else None      
    def get_total_price(self,obj):
        return sum(item.price * item.quantity for item in obj.items.filter( ~Q(status = 'RJC')).all())  


class OrderSerializerHistory(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ['id','order_status','status', 'purchaseDate', 'rejection_reason', 'total_price','currency']
    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else None      
    def get_total_price(self,obj):
       return sum(item.price * item.quantity for item in obj.items.filter( ~Q(status = 'RJC')).all())  
class OrderSerializerAdminHistory(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    company_registered_number = serializers.SerializerMethodField()
    company_credit = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ["id","total_price","currency","company_name","company_registered_number","company_credit"]
    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else None      
    def get_total_price(self,obj):
        return sum(item.price * item.quantity for item in obj.items.filter( ~Q(status = 'RJC')).all())  
    def get_company_name(self,obj):
        return obj.purchaser.company.name
    def get_company_registered_number(elf,obj):
        return obj.purchaser.company.register_number
    def get_company_credit(elf,obj):
        return obj.purchaser.company.credit
    

class OrderExtendedSerializer(serializers.ModelSerializer):
    items = ProductInstanceAdminSerializer(many=True)
    total_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    company_registered_number = serializers.SerializerMethodField()
    company_credit = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = ["items","id","total_price","currency","company_name","company_registered_number","company_credit"]

    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else None      
    def get_total_price(self,obj):
        return sum(item.price * item.quantity for item in obj.items.filter(~Q(status = 'RJC')).all())
    def get_company_name(self,obj):
        return obj.purchaser.company.name
    def get_company_registered_number(elf,obj):
        return obj.purchaser.company.register_number
    def get_company_credit(elf,obj):
        return obj.purchaser.company.credit

class OrderPaidSerializer(OrderExtendedSerializer):
    class Meta(OrderExtendedSerializer.Meta):
        fields = OrderExtendedSerializer.Meta.fields + ["order_status"]

