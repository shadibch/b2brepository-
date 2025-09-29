from django.db import models

# Create your models here.
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)  # Name is the only field here
    credit = models.IntegerField(null=True,blank=True)
    period = models.IntegerField(null=True,blank=True)
    register_number = models.CharField(max_length=255, unique=True)
    address = models.CharField(max_length=255)
    def __str__(self):
        return self.name
class ProductContract(models.Model):
    CURRENCY_CHOICES = [
        ("SAR", "Saudi Riyal"),
        ("USD", "US Dollar"),
    ]
    product = models.ForeignKey(
        "product.Product",
        on_delete=models.CASCADE,
        related_name="branch_prices"
    )
    branch = models.ForeignKey(
        "company.Branch",
        on_delete=models.CASCADE,
        related_name="branch_contract"
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES)

    class Meta:
        unique_together = ("product", "branch")  # Ensures uniqueness
        verbose_name = "Product Branch Price"
        verbose_name_plural = "Product Branch Prices"

    def __str__(self):
        return f"{self.product} @ {self.branch} - {self.price} {self.currency}"



class Branch(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=False, null=False)
    phone = models.CharField(max_length=255, blank=False, null=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,  # Set the company field to NULL when the branch is deleted
        related_name='branches',
        null=True,  # Allow NULL values
        blank=True  # Allow the field to be blank
    )

    def __str__(self):
        return f"{self.name} ({self.company.name if self.company else 'No Company'})"



