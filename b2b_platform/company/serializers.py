from rest_framework import serializers
from .models import Company, Branch, Contract

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'credit', 'period', 'register_number', 'address']
        read_only_fields = ['name', 'register_number', 'address']
        
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name']  # Include only the id and name fields in the response

class BranchSerializerCompany(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone']

class BranchSerializerContractCompany(serializers.ModelSerializer):
    contract = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone', 'contract']

    def get_contract(self, obj):
        if hasattr(obj, 'contract'):
            return {
                'id': obj.contract.id,
                'items': [item.id for item in obj.contract.items.all()]
            }
        return None



