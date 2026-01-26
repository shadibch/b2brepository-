from rest_framework import serializers
from company.models import Branch
from .models import CustomUser


from company.models import Company
from .models import CustomUser
from company.serializers import BranchSerializer

class CompanyUserRegistrationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(required=True)  # Expect a company name
    company_address = serializers.CharField(required=True)
    register_number = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirmation', 'company_name','company_address', 'register_number']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, data):
        # Ensure passwords match
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        if password != password_confirmation:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirmation', None)

        # Get or create the company
        company_name = validated_data.pop('company_name').strip()
        register_number = validated_data.pop('register_number')
        if Company.objects.filter(register_number=register_number).exists():
            raise serializers.ValidationError({
            "register_number": "Register number already exists."
        })
        if Company.objects.filter(name=company_name).exists():
            raise serializers.ValidationError({
            "company_name": "Company name already exists."
        })
        company_address = validated_data.pop('company_address')
        company, _ = Company.objects.get_or_create(name=company_name,register_number=register_number,address=company_address)

        # Create user with the assigned company
        user = CustomUser.objects.create_user(
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            password=validated_data.get('password'),
            company=company  # Assign company
        )

        return user


class UserRegistrationSerializer(serializers.ModelSerializer):
    branches = serializers.ListField(
        child=serializers.IntegerField(),  # Expect a list of branch IDs
        required=False
    )
    
    password = serializers.CharField(write_only=True)  # Ensure password is not readable
    password_confirmation = serializers.CharField(write_only=True)  # Confirm password

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirmation', 'branches']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_branches(self, value):
        """ Validate that all provided branch IDs exist """
        branches = Branch.objects.filter (id__in=value)
        if len(branches) != len(value):
            raise serializers.ValidationError("One or more branch IDs are invalid.")
        return branches  # Return the actual Branch instances

    def validate(self, data):
        # Ensure passwords match
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        if password != password_confirmation:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # Remove password_confirmation from validated_data
        validated_data.pop('password_confirmation', None)

        # Extract branches (actual instances) before creating the user
        branches = validated_data.pop('branches', [])

        # Create user
        user = CustomUser.objects.create_user(
            email=validated_data.get('email').lower(),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            password=validated_data.get('password'),
            role = 'staff' ,
            status=CustomUser.STATUS_ACTIVE
        )

        # Assign branches to the user
        user.branches.set(branches)
        
        return user

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'branches']

    def update(self, instance, validated_data):
        # Update the user instance with validated data
        instance.email = validated_data.get('email', instance.email).lower()
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.branches.set(validated_data.get('branches', instance.branches.all()))  # Update branches (many-to-many field)
        
        # Save changes to the instance
        instance.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'company', 'role', 'status', 'reason']
        
class StaffUserSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name']





class StaffUserDetailSerializer(serializers.ModelSerializer):
    branches = BranchSerializer(many=True)  # ✅ Include branch details

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'branches']
class UserSerializerActivation(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    company_register_number = serializers.SerializerMethodField()
    company_credit = serializers.SerializerMethodField()
    company_period = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'company_name', 'company_register_number',
            'role', 'status', 'reason',
            'company_credit', 'company_period'
        ]
    def get_company_name(self,obj):
        return obj.company.name if obj.company else None
    def get_company_register_number(self,obj):
        return obj.company.register_number if obj.company else None
    def get_company_credit(self,obj):
        return obj.company.credit if obj.company else None
    def get_company_period(self,obj):
        return obj.company.period if obj.company else None

