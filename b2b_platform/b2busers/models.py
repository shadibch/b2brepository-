from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', CustomUser.STATUS_ACTIVE)
        extra_fields.setdefault('role', 'super_user')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    reset_token = models.CharField(max_length=50, blank=True, null=True, unique=True)
    reset_expiary_date=models.DateTimeField(blank=True, null=True)
    branches = models.ManyToManyField(
        'company.Branch',
        related_name="users",
        blank=True
    )

    company = models.ForeignKey(
        'company.Company',
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True
    )

    ROLE_CHOICES = [
        ('company_admin', 'Company Admin'),
        ('staff', 'Staff'),
        ('super_user', 'Super User'),
    ]
    LANGUAGE_CHOICES = [('ar_SA' , 'Arabic'),('en_US','English')]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='company_admin'  # Default role for new users
    )
    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default='ar_SA'  # Default role for new users
    )

    STATUS_PENDING = "Pending"
    STATUS_ACTIVE = "Active"
    STATUS_FIX_ISSUES = "FixIssues"
    STATUS_BLOCKED = "Blocked"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_FIX_ISSUES, "Fix Issues"),
        (STATUS_BLOCKED, "Blocked"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    reason = models.TextField(blank=True, default="")
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.company.name if self.company else 'No Company'}) - {self.role}"

    @property
    def is_active(self):
        """
        Django auth expects an `is_active` attribute.
        - Active and FixIssues users can log in
        - Pending and Blocked users cannot
        """
        return self.status in {self.STATUS_ACTIVE, self.STATUS_FIX_ISSUES}

