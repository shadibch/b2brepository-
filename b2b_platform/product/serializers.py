from rest_framework import serializers
from .models import *
from decimal import Decimal, ROUND_HALF_UP
from  .utils import *

class CategoryTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryTranslation
        fields = ["id", "language", "name"]

class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()  # Override the `name` field with translated name

    class Meta:
        model = Category
        fields = ["id", "name", "file"]  # Use `name` instead of `translated_name`

    def get_name(self, obj):  # Replace `get_translated_name` with `get_name`
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  # Fallback to default language
        translation = obj.translations.filter(language=language).first()
        return translation.name if translation else obj.name  # Return translated name or fallback

class CategoryAdminCreateUpdateSerializer(serializers.ModelSerializer):
    translations = CategoryTranslationSerializer(many=True, required=False)
    parent = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True, required=False)
    groups = serializers.ListField(child=serializers.IntegerField(), required=False)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'translations', 'parent', 'groups', 'file']

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', [])
        groups = validated_data.pop('groups', [])
        
        category = Category.objects.create(**validated_data)
        
        # Handle translations
        for translation_data in translations_data:
            CategoryTranslation.objects.create(
                category=category,
                **translation_data
            )
        
        # Handle groups
        if groups:
            category.groups.set(groups)
            
        return category

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', [])
        groups = validated_data.pop('groups', None)
        
        # Update category fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update translations
        instance.translations.all().delete()
        for translation_data in translations_data:
            CategoryTranslation.objects.create(
                category=instance,
                **translation_data
            )
        
        # Update groups if provided
        if groups is not None:
            instance.groups.set(groups)
            
        return instance

class CategoryAdminSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'label', 'children', 'file']

    def get_children(self, obj):
        return CategoryAdminSerializer(obj.children.all(), many=True, context=self.context).data

    def get_label(self, obj):
        request = self.context.get("request")
        language = request.LANGUAGE_CODE if request else "en"
        translation = obj.translations.filter(language=language).first()
        return translation.name if translation else obj.name

class CategoryAdminItemSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'translations', 'file', 'groups']
        
    def get_translations(self, obj):
        trans = obj.translations.all()
        return {t.language: {'name': t.name} for t in trans}

class CategoryCreateAdminItemSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'translations', 'file', 'groups']
        
    def get_translations(self, obj):
        trans = obj.translations.all()
        return {t.language: {'name': t.name} for t in trans}

from .models import Product, ProductPrice, ProductMedia

class ProductSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()  # ✅ Dynamically retrieve price
    media_list = serializers.SerializerMethodField()  # ✅ Get list of media
    name = serializers.SerializerMethodField() 
    description = serializers.SerializerMethodField()
    attributs = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ["id", "name", "part_id", "stock_quantity", "base_price", "description", "subgroups", "categories", "attributs", "currency", "price", "media_list","closest_category","discount","availibility"]  # ✅ Ensure 'price' is included
    def get_name(self,obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  # Fallback to default language
        translation = obj.translations.filter(language=language).first()
        return translation.name if translation and translation.name else obj.name  # Return translated name or fallback
    def get_description(self,obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  # Fallback to default language
        translation = obj.translations.filter(language=language).first()
        return translation.description if translation and translation.description else obj.description  # Return translated name or fallback
    def get_attributs(self,obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  # Fallback to default language
        translation = obj.translations.filter(language=language).first()
        return translation.attributs if translation and translation.attributs else obj.attributs  # Return translated name or fallback
    def get_price(self, obj):
        user = self.context["request"].user
       
        price = calculate(user,obj)
        
        # ✅ Ensure price is rounded to two decimal places
        return Decimal(price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        
      

    def get_media_list(self, obj):
        return [media.file.url for media in obj.media.all()]  # ✅ Returns URLs of media files
 # ✅ Returns URLs of media files

from .models import ProductGroup, ProductSubGroup

from rest_framework import serializers

class ProductSubGroupSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()  # ✅ Use SerializerMethodField for dynamic name

    class Meta:
        model = ProductSubGroup
        fields = ["id", "name"]  # Ensure 'name' is dynamically resolved

    def get_name(self, obj):
        request = self.context.get("request")  # Access the request from serializer context
        language = request.LANGUAGE_CODE if request else "en"  # Fallback to default language
       
        translation = obj.translations.filter(language=language).first()
        return translation.name if translation else obj.name  # Return translated name or fallback


class ProductGroupSerializer(serializers.ModelSerializer):
    subgroups = ProductSubGroupSerializer(many=True)
 # Nested serialization
    name = serializers.SerializerMethodField()  # ✅ Use SerializerMethodField for dynamic name
    
    class Meta:
        model = ProductGroup
        fields = ["id", "name", "subgroups"]

    def get_name(self, obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "ar"  # Fallback to default language
        return getProductName(language,obj)
class AdminProductGroupSerializer(serializers.ModelSerializer):
 # Nested serialization
    name = serializers.SerializerMethodField()  # ✅ Use SerializerMethodField for dynamic name

    class Meta:
        model = ProductGroup
        fields = ["id", "name"]

    def get_name(self, obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "ar"  # Fallback to default language
        return getProductName(language,obj)
 # Return translated name or fallback

# serializers.py
from rest_framework import serializers
from .models import ProductGroup, ProductGroupTranslation, ProductSubGroup, ProductSubgroupTranslation

class ProductGroupTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductGroupTranslation
        fields = ('language', 'name')

class ProductSubgroupTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubgroupTranslation
        fields = ('language', 'name')
    

class ProductSubGroupSerializer(serializers.ModelSerializer):
    translations = ProductSubgroupTranslationSerializer(many=True)
    name = serializers.SerializerMethodField()  # ✅ Use SerializerMethodField for dynamic name
    base_name = serializers.CharField(source="name")
    class Meta:
        model = ProductSubGroup
        fields = ('id', 'name', 'translations','base_name')
    def get_name(self, obj):
        request = self.context.get("request")  # Access request from serializer context
        language = request.LANGUAGE_CODE if request else "ar"  # Fallback to default language
        return getProductName(language,obj)

class ProductAdminGroupSerializer(serializers.ModelSerializer):
    translations = ProductGroupTranslationSerializer(many=True)
    subgroups = ProductSubGroupSerializer(many=True)
    name = serializers.SerializerMethodField()
    base_name = serializers.CharField(source="name")
    class Meta:
        model = ProductGroup
        fields = ('id', 'name', 'translations', 'subgroups', 'base_name')

    def get_name(self, obj):
        request = self.context.get("request")
        language = request.LANGUAGE_CODE if request else "ar"
        return getProductName(language,obj)

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name is required")
        return value

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', [])
        subgroups_data = validated_data.pop('subgroups', [])

        # Create the main group
        group = ProductGroup.objects.create(name=validated_data.get('name', ''))

        # Create translations for the group
        for trans_data in translations_data:
            if trans_data.get('name'):  # Only create if name is provided
                ProductGroupTranslation.objects.create(
                    productgroup=group,
                    language=trans_data['language'],
                    name=trans_data['name']
                )

        # Create subgroups and their translations
        for subgroup_data in subgroups_data:
            subgroup_translations = subgroup_data.pop('translations', [])
            subgroup = ProductSubGroup.objects.create(
                group=group,
                name=subgroup_data.get('name', '')
            )
            
            for trans_data in subgroup_translations:
                if trans_data.get('name'):  # Only create if name is provided
                    ProductSubgroupTranslation.objects.create(
                        productsubgroup=subgroup,
                        language=trans_data['language'],
                        name=trans_data['name']
                    )

        return group

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', [])
        subgroups_data = validated_data.pop('subgroups', [])

        # Update main group
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        # Update translations
        instance.translations.all().delete()
        for trans_data in translations_data:
            if trans_data.get('name'):
                ProductGroupTranslation.objects.create(
                    productgroup=instance,
                    language=trans_data['language'],
                    name=trans_data['name']
                )

        # Update subgroups
        instance.subgroups.all().delete()
        for subgroup_data in subgroups_data:
            subgroup_translations = subgroup_data.pop('translations', [])
            subgroup = ProductSubGroup.objects.create(
                group=instance,
                name=subgroup_data.get('name', '')
            )
            
            for trans_data in subgroup_translations:
                if trans_data.get('name'):
                    ProductSubgroupTranslation.objects.create(
                        productsubgroup=subgroup,
                        language=trans_data['language'],
                        name=trans_data['name']
                    )

        return instance


class ProductSubgroupCreateSerializer(serializers.ModelSerializer):
    translations = ProductSubgroupTranslationSerializer(many=True)
    name = serializers.CharField(required=True)

    class Meta:
        model = ProductSubGroup
        fields = ('name', 'translations')

class ProductGroupCreateSerializer(serializers.ModelSerializer):
    translations = ProductGroupTranslationSerializer(many=True)
    subgroups = ProductSubgroupCreateSerializer(many=True)
    name = serializers.CharField(required=True)

    class Meta:
        model = ProductGroup
        fields = ('name', 'translations', 'subgroups')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations')
        subgroups_data = validated_data.pop('subgroups')

        # Create the main group
        group = ProductGroup.objects.create(**validated_data)

        # Create translations for the group
        for trans_data in translations_data:
            ProductGroupTranslation.objects.create(
                productgroup=group,
                **trans_data
            )

        # Create subgroups and their translations
        for subgroup_data in subgroups_data:
            subgroup_translations = subgroup_data.pop('translations')
            subgroup = ProductSubGroup.objects.create(
                group=group,
                **subgroup_data
            )
            
            for trans_data in subgroup_translations:
                ProductSubgroupTranslation.objects.create(
                    productsubgroup=subgroup,
                    **trans_data
                )

        return group

class ProductAdminSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()
    media_list = serializers.SerializerMethodField()
    

    class Meta:
        model = Product
        fields = ['id', 'name', 'part_id', 'base_price', 
                  'closest_category', 'stock_quantity',
              'subgroups', 'translations', 'media_list',"availibility"]

    def get_translations(self, obj):
        translations = obj.translations.all()
        return {
            trans.language: {
                'name': trans.name,
                'description': trans.description
            }
            for trans in translations
        }

    def get_media_list(self, obj):
        request = self.context.get('request')
        return [request.build_absolute_uri(media.file.url) for media in obj.media.all()] if request else []

class ProductDetailedAdminSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()
    media_list = serializers.SerializerMethodField()
    category_hierarchy = serializers.SerializerMethodField()
    groups = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    subgroups = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'part_id', 'base_price', 'translations',
                   'media_list','stock_quantity', 
                 'category_hierarchy', 'groups', 'subgroups','description','availibility']

    def get_translations(self, obj):
        translations = {}
        for trans in obj.translations.all():
            translations[trans.language] = {
                'name': trans.name,
                'description': trans.description
            }
        return translations

    def get_media_list(self, obj):
        return [media.file.url for media in obj.media.all()]

    def get_category_hierarchy(self, obj):
        hierarchy = []
        category = obj.closest_category
        while category:
            hierarchy.insert(0, {
                'id': category.id,
                'name': category.name,
                'parent_id': category.parent_id if category.parent else None
            })
            category = category.parent
        return hierarchy

class ProductPriceSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductPrice
        fields = ['id', 'purchaser', 'percentage_discount', 'flat_discount', 'company_name']
        
    def get_company_name(self, obj):
        return obj.purchaser.name if obj.purchaser else None



   