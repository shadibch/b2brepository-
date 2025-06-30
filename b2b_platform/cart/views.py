# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, ProductInstance, Product
from .serializers import *
from django.utils import timezone
from company.models import *
from django.shortcuts import get_object_or_404
from product.utils import calculate
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addItem(request, branchid):
    user = request.user

    # 1. Check if the user has a cart
    cart, created = Cart.objects.get_or_create(purchaser=user)

    # 2. Get product info from request
    product_id = request.data.get('product')
    quantity = request.data.get('quantity', 1)

    if not product_id:
        return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    product = get_object_or_404(Product, id=product_id)  # Fetch the product by its ID
    branch = get_object_or_404(Branch, id=branchid)  # Fetch the branch by its ID
    
    # 3. Check if the product already exists in the cart
    existing_instance = ProductInstance.objects.filter(cart=cart, product=product,branch = branch).first()
    
    if existing_instance:
        # If the product instance exists, update the quantity
        existing_instance.quantity += quantity
        existing_instance.save()  # Save the updated instance

        serializer = ProductInstanceSerializer(existing_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        # If the product instance doesn't exist, create a new instance
        price = calculate(request.user,product)
        if(price == 0):
            price = product.base_price
        product_instance = ProductInstance.objects.create(
            product=product,
            price=price,  # assuming Product has a price
            creationDate=timezone.now(),
            quantity=quantity,
            cart=cart,
            currency='SAR',  # or you can fetch dynamically
            status='INT',
            branch=branch  # You might want to pass branch in future
        )

        serializer = ProductInstanceUpdateSerializer(product_instance)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder(request,order_id):
    order = get_object_or_404(Order, id=order_id)  # Fetch the product by its ID
    itens = order.items.all()
    user = request.user

    # 1. Check if the user has a cart
    cart, created = Cart.objects.get_or_create(purchaser=user)
    for item in itens:
        existing_instance = ProductInstance.objects.filter(cart=cart, product=item.product,
                                                           branch = item.branch).first()
    
        if existing_instance:
        # If the product instance exists, update the quantity
            existing_instance.quantity += item.quantity
            existing_instance.save()  # Save the updated instance

        
        else:
        # If the product instance doesn't exist, create a new instance
            price = calculate(request.user,item.product)
            if(price == 0):
                price = item.product.base_price
            product_instance = ProductInstance.objects.create(
                product=item.product,
                price=price,  # assuming Product has a price
                creationDate=timezone.now(),
                quantity=item.quantity,
                cart=cart,
                currency='SAR',  # or you can fetch dynamically
                status='INT',
                branch=item.branch  # You might want to pass branch in future
            )
    return Response(status=status.HTTP_201_CREATED)        
from datetime import datetime
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contracts(request):
    for branch in request.user.branches.all():
        if(branch.contract):
            data = ContractSerializer(branch.contract,context={'request': request}).data
            return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart(request):
    cart = Cart.objects.filter(purchaser=request.user).first()
    if cart is None:
        cart = Cart.objects.create(purchaser=request.user)
        for branch in request.user.branches.all():
        
            if branch.contract:
                for product in branch.contract.items.all():
                    print("Number of items ******" +  str(len(branch.contract.items.all())))
                    ProductInstance.objects.create(
                        product=product,
                        price=calculate(request.user,product),
                        quantity=0,
                        branch=branch,
                        cart=cart,
                        creationDate=timezone.now() 
                )
   
    serialized_cart = CartSerializer(cart, context={'request': request}).data
    return Response(serialized_cart)
from product.utils import calculate
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cartdetails(request):
    cart = Cart.objects.filter(purchaser=request.user).first()
    if cart is None:
        cart = Cart.objects.create(purchaser=request.user)
        for branch in request.user.branches.all():
            print(branch.contract)
            if branch.contract:
                for product in branch.contract.items.all():
                    
                    ProductInstance.objects.create(
                        product=product,
                        price=calculate(request.user,product),
                        quantity=0,
                        branch=branch,
                        cart=cart,
                        creationDate=timezone.now() 
                )
    serialized_cart = CartDetailsSerializer(cart, context={'request': request}).data
    return Response(serialized_cart)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchaseRequest(request):
    user = request.user
    cart = user.activecart

    # Step 1: Calculate cart total
    cart_total = sum(instance.price*instance.quantity for instance in cart.instances.all())

    # Step 2: Get user's pending orders
    pending_orders = Order.objects.filter(purchaser=user, status='PND')

    # Step 3: Sum all items' prices in pending orders
    pending_total = 0
    for order in pending_orders:
        pending_total += sum(item.price*item.quantity for item in order.items.all())

    # Step 4: Validate against company credit
    total = cart_total + pending_total

    if total > user.company.credit:
        return Response(
            {"detail": "PURCHASE_LIMIT_EXCEED"},
            status=status.HTTP_400_BAD_REQUEST
        )
    latest = user.orders.filter(
    Q(status='ACC') | Q(status='PRJ'),
    order_status='UNP'
).order_by('-invoice__expirePaymentDate'
).values_list('invoice__expirePaymentDate', flat=True).first()

    if(latest and latest < timezone.now()):
        return Response(
            {"detail": "PURCHASE_DATETIME_EXCEED"},
            status=status.HTTP_400_BAD_REQUEST
        )


    # Step 5: Proceed with order creation
    order = Order.objects.create(
        purchaser=cart.purchaser,
        purchaseDate=timezone.now(),
    )
    order.items.set(cart.instances.all())
    order_serializer = OrderSerializer(order, context={'request': request}).data
    cart.delete()
    
    return Response(order_serializer)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ProductInstance  # Adjust import as needed
from .serializers import CartDetailsSerializer  # Adjust import as needed

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateItem(request, id):
    quantity = request.data.get('quantity')
    if quantity is None:
        return Response({'error': 'Quantity is required.'}, status=400)

    try:
        quantity = int(quantity)
    except ValueError:
        return Response({'error': 'Quantity must be an integer.'}, status=400)

    product_instance = get_object_or_404(ProductInstance, pk=id)
    instanceUser = product_instance.cart.purchaser
    currentUser = request.user
    if(currentUser !=instanceUser):
        return Response({'error': 'Authorization Error.'}, status=403)

    product_instance.quantity = quantity
    product_instance.save()

    cart = request.user.activecart
    serialized_cart = CartDetailsSerializer(cart, context={'request': request}).data
    return Response(serialized_cart)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete(request, id):
    product_instance = get_object_or_404(ProductInstance, pk=id)
    instanceUser = product_instance.cart.purchaser
    currentUser = request.user
    if(currentUser !=instanceUser):
        return Response({'error': 'Authorization Error.'}, status=403)
    product_instance.delete()
    cart = request.user.activecart
    serialized_cart = CartDetailsSerializer(cart, context={'request': request}).data
    return Response(serialized_cart)
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from .models import Order
from .serializers import OrderSerializer
from b2busers.OrderInvoiceView import *
from django.http import FileResponse, Http404
# Define Pagination
class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
class OrderInvoiceDownloadView(APIView):
    def get(self, request, order_id):
        # Reuse your invoice creation logic here
        try:
            order = Order.objects.get(id=order_id)
            # This should be your function that returns a file-like object (PDF)
            pdf_file = generate_invoice_pdf(order,order.invoice)  # <-- You need to extract this from your email logic
            pdf_file.seek(0)
            return FileResponse(pdf_file, as_attachment=True, filename=f"invoice_{order.id}.pdf")
        except Order.DoesNotExist:
            raise Http404("Order not found")
# Define API View
class OrderListView(ListAPIView):
    permission_classes = [IsAuthenticated]  # Require authentication
    serializer_class = OrderSerializerHistory
    pagination_class = OrderPagination

    def get_queryset(self):
        # Filter orders by the logged-in user
        return Order.objects.filter(purchaser__company=self.request.user.company).order_by('-purchaseDate') if self.request.user.role == 'company_admin' else Order.objects.filter(purchaser=self.request.user).order_by('-purchaseDate') 



from rest_framework.exceptions import NotFound


class OrderItemDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            raise NotFound("Order not found.")
        serializer = OrderSerializer(order)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder(request, order_id):
    """
    Reorder API - Add items from a previous order to user's cart
    """
    try:
        # Get the order and verify ownership
        order = get_object_or_404(Order, id=order_id)
        
        # Check if the user owns this order
        if order.purchaser != request.user:
            return Response(
                {"detail": "You can only reorder your own orders."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create user's cart
        cart, created = Cart.objects.get_or_create(purchaser=request.user)
        
        # Get all items from the order (excluding rejected items)
        order_items = order.items.filter(status__in=['ACC', 'INT']).select_related('product', 'branch')
        
        if not order_items.exists():
            return Response(
                {"detail": "No valid items found in this order to reorder."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add items to cart
        added_items = []
        for order_item in order_items:
            # Check if item already exists in cart for this product and branch
            existing_cart_item = cart.instances.filter(
                product=order_item.product,
                branch=order_item.branch
            ).first()
            
            if existing_cart_item:
                # Update quantity if item already exists
                existing_cart_item.quantity += order_item.quantity
                existing_cart_item.save()
                added_items.append({
                    'product': order_item.product.name,
                    'branch': order_item.branch.name,
                    'quantity': order_item.quantity,
                    'action': 'updated'
                })
            else:
                # Create new cart item
                ProductInstance.objects.create(
                    cart=cart,
                    product=order_item.product,
                    branch=order_item.branch,
                    price=order_item.price,
                    quantity=order_item.quantity,
                    currency=order_item.currency,
                    creationDate=timezone.now()
                )
                added_items.append({
                    'product': order_item.product.name,
                    'branch': order_item.branch.name,
                    'quantity': order_item.quantity,
                    'action': 'added'
                })
        
        # Return updated cart data
        cart_serializer = CartDetailsSerializer(cart, context={'request': request})
        
        return Response({
            "message": f"Successfully reordered {len(added_items)} items from order #{order_id}",
            "added_items": added_items,
            "cart": cart_serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"detail": f"Error processing reorder: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
