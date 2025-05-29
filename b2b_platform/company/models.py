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

class Contract(models.Model):
    items = models.ManyToManyField(
        'product.Product',
        related_name='contracts',
        blank=True
    )
    branch = models.OneToOneField(
        'Branch',
        on_delete=models.CASCADE,
        related_name='contract',
        null=True,
        blank=True
    )

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



