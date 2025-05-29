from django.db import models
from product.models import *
from b2busers.models import *
from company.models import *
from django.utils import timezone
from datetime import timedelta
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

STATUS_CHOICES = [("PND","Pending"), ("ACC","Accepted"),("RJC","Rejected")]
ORDER_STATUS_CHOICES = [("UNP","Unpaid"), ("PRC","Processing"), ("UDL","To be delivered"),("DLV","Delivered")]
class Cart(models.Model):
    purchaser = models.OneToOneField(CustomUser,on_delete=models.CASCADE, null=True,related_name="activecart" )
    creationDate = models.DateTimeField(auto_now_add=True)
   
    
    def __str__(self):
        return f"{self.purchaser},  {self.creationDate}" 
class Order(models.Model):
    purchaser = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,  # or CASCADE if you want orders deleted with users
        null=True,
        related_name="orders"
    )
    purchaseDate = models.DateTimeField(auto_now_add=True)

    status =models.CharField(
        max_length=3,
        choices=STATUS_CHOICES,
        default="PND"  # ✅ Default to Saudi Arabian Riyal
    )
    order_status = models.CharField(
        max_length=3,
        choices=ORDER_STATUS_CHOICES,
        default="UNP"  # ✅ Default to Unpaid
    )
    rejection_reason = models.CharField(null=True,blank=True)

 
    purchaseDate = models.DateField(auto_now_add=True)
    paid_datetime = models.DateTimeField(null=True,blank=True)
    delivered_datetime = models.DateTimeField(null=True,blank=True)

    

class Invoice(models.Model):
    purchaser = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,  # or CASCADE if you want orders deleted with users
        null=True,
        related_name="invoices"
    )
    order = models.OneToOneField(Order ,on_delete=models.SET_NULL,  # or CASCADE if you want orders deleted with users
        null=True,
        related_name="invoice")
    expirePaymentDate = models.DateTimeField()


    
class ProductInstance(models.Model):
    product = models.ForeignKey(Product,on_delete=models.CASCADE, null=True,related_name="instances")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    creationDate = models.DateTimeField()
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="SAR"  # ✅ Default to Saudi Arabian Riyal
    )
    status =models.CharField(
        max_length=3,
        choices=STATUS_CHOICES,
        default="INT"  # ✅ Default to Saudi Arabian Riyal
    ) 
    quantity = models.IntegerField(default=0)
    branch = models.ForeignKey(Branch,on_delete=models.SET_NULL,null=True,related_name="related_items")
    cart = models.ForeignKey('Cart', on_delete=models.SET_NULL, null=True, related_name="instances")
    order = models.ForeignKey('Order',on_delete=models.SET_NULL, null=True, related_name="items")


    def __str__(self):
        return f"{self.product}, {self.price}, {self.quantity}"
# Create your models here.
