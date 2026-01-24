from rest_framework import serializers
from .models import Company, Branch

class CompanySerializerUser(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']
        

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'credit', 'period', 'register_number', 'address']
        read_only_fields = ['name', 'register_number', 'address']


class CompanyNameUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']
        
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name']  # Include only the id and name fields in the response

class BranchSerializerCompany(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone']


# serializers.py
from rest_framework import serializers
from .models import Branch
from product.utils import price   # import your util here
from cart.models import Product
class BranchWithProductSerializer(serializers.ModelSerializer):
    product_exist = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone', 'product_exist', 'price']

    def get_product_exist(self, obj):
        product_id = self.context.get('product_id')
        if not product_id:
            return False
        contract = getattr(obj, 'branch_contract', None)
        if contract and contract.all().filter(product_id=product_id).exists():
            return True
        return False

    def get_price(self, obj):
        product_id = self.context.get('product_id')
        if not product_id:
            return None
        print(product_id)
        product = Product.objects.get(id=product_id)
        return price( obj,product)

        




