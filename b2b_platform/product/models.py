from django.db import models
from company.models import Company
from django.db import models
CURRENCY_CHOICES = [
        ("USD", "United States Dollar"),
        ("EUR", "Euro"),
        ("GBP", "British Pound"),
        ("JPY", "Japanese Yen"),
        ("SAR", "Saudi Arabian Riyal"),
        ("AED", "United Arab Emirates Dirham"),
        ("INR", "Indian Rupee"),
        ("CNY", "Chinese Yuan"),
        ("AUD", "Australian Dollar"),
        ("CAD", "Canadian Dollar"),
        # ✅ Add more currencies as needed
    ]
LOCALES_CHOICES=[('en', 'English'), ('ar', 'Arabic')]


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)  # ✅ Unique category name
    file = models.FileField(upload_to="product_media/")
    parent = models.ForeignKey('Category', blank=True, on_delete=models.SET_NULL, null=True, related_name="children") 
    groups = models.ManyToManyField('ProductGroup', related_name="categories_groups")  # ✅ One-to-Many Relationship
    def __str__(self):
        return self.name
class CategoryTranslation(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="translations")
    language = models.CharField(max_length=10, choices=LOCALES_CHOICES)
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ('category', 'language')
    def __str__(self):
        return f"{self.category} ({self.language}) ({self.name})"

class ProductGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name
class ProductGroupTranslation(models.Model):
    productgroup = models.ForeignKey(ProductGroup, on_delete=models.CASCADE, related_name="translations")
    language = models.CharField(max_length=10, choices=LOCALES_CHOICES)
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ('productgroup', 'language')
    def __str__(self):
        return f"{self.productgroup} ({self.language}) ({self.name})"

class ProductSubGroup(models.Model):
    name = models.CharField(max_length=255)
    group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE, related_name="subgroups")  # ✅ One-to-Many Relationship

    def __str__(self):
        return f"{self.group.name}, {self.name}"  # ✅ Presents as "Group Name, SubGroup Name"
class ProductSubgroupTranslation(models.Model):
    productsubgroup = models.ForeignKey(ProductSubGroup, on_delete=models.CASCADE, related_name="translations")
    language = models.CharField(max_length=10, choices=LOCALES_CHOICES)
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ('productsubgroup', 'language')
    def __str__(self):
        return f"{self.productsubgroup} ({self.language}) ({self.name})"

class Product(models.Model):
    name = models.CharField(max_length=255)
    part_id = models.CharField(max_length=50, unique=True)
    stock_quantity = models.IntegerField(default=0)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(
    max_digits=5, 
    decimal_places=2, 
    null=True, 
    blank=True, 
    help_text="Enter discount as a percentage (e.g., 10.00 for 10%)."

    
)
    

    description = models.TextField()
    subgroups = models.ManyToManyField(ProductSubGroup, related_name="products")
    categories = models.ManyToManyField(Category, related_name="products") 
    attributs = models.JSONField(blank=True, null=True)
    closest_category = models.ForeignKey('Category', blank=True, null=True, related_name='children_products', on_delete=models.CASCADE)
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="SAR"  # ✅ Default to Saudi Arabian Riyal
    )

    def __str__(self):
        return f"{self.name}, {self.part_id}, {self.currency}"
class ProductTranslation(models.Model):
    name = models.CharField(max_length=255)
 
    description = models.TextField()
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="translations")
  
    attributs = models.JSONField(blank=True, null=True)
    language = models.CharField(max_length=10, choices=LOCALES_CHOICES)
  

    def __str__(self):
        return f"{self.name}, {self.language}"
        
class Attribute(models.Model):
    name = models.CharField(max_length=100)  # e.g. Color, Size

    def __str__(self):
        return self.name

class AttributeValue(models.Model):
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE, related_name='values')
    value = models.CharField(max_length=100)  # e.g. Red, Large
    image = models.ImageField(upload_to='attribute_values/', null=True, blank=True)
    
    # Optional: sub-options that belong to this attribute value
    sub_values = models.ForeignKey('Attribute', blank=True, null=True, on_delete=models.CASCADE, related_name='parent_attribute')

    # Optional: link to a destination product
    destination_product = models.ForeignKey('Product', null=True, blank=True, on_delete=models.SET_NULL, related_name='linked_attribute_values')

    def clean(self):
        from django.core.exceptions import ValidationError

        # Check if there are sub-values and avoid circular reference
        
        if not self.destination_product and not self.sub_values:
            raise ValidationError("AttributeValue must have either a destination product or sub-values.")





    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class ProductMedia(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="media")
    file = models.FileField(upload_to="product_media/")
    media_type = models.CharField(max_length=10, choices=[("image", "Image"), ("video", "Video")])
    def __str__(self):
        return f"{self.product, self.file}"

class ProductPrice(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="prices")
    purchaser = models.ForeignKey(Company, on_delete=models.CASCADE)
    percentage_discount = models.DecimalField(
    max_digits=5, 
    decimal_places=2, 
    null=True, 
    blank=True, 
    help_text="Enter percentage discount (e.g., 10.00 for 10%)."
    )
    flat_discount = models.DecimalField(
    max_digits=10, 
    decimal_places=2, 
    null=True, 
    blank=True, 
    help_text="Enter flat discount amount (e.g., 50.00)."
)
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="SAR")  # ✅ Default to Saudi Arabian Riyal

    class Meta:
        unique_together = ("product", "purchaser")

class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="attributes")
    key = models.CharField(max_length=255)
    value = models.CharField(max_length=255)

    class Meta:
        unique_together = ("product", "key")
    def __str__(self):
        return str((self.key,self.value,self.product)) 