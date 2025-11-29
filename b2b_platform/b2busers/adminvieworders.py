from rest_framework.generics import *
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSuperUser
from cart.models import *
from cart.serializers import ProductInstanceAdminSerializer,OrderExtendedSerializer,OrderSerializerAdminHistory, OrderPaidSerializer
from django.shortcuts import get_object_or_404 
from .OrderInvoiceView import OrderViewSet,sendemai
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import datetime
import openpyxl
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
from hijri_converter import Hijri, Gregorian
class OrdersAdminUserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "page": self.page.number,
            "num_pages": self.page.paginator.num_pages,
            "page_size": self.page_size,  # 👈 add this
            "results": data
        })

class SearchOrders(ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperUser]  # Ensure user is logged in and is superuser
    serializer_class = OrderSerializerAdminHistory           # Should be a class, not a list
    pagination_class = OrdersAdminUserPagination         # Optional: if you want pagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = Order.objects.filter(status='PND')

        if query:
            queryset = queryset.filter(purchaser__company__name__icontains=query)

        return queryset

class AdminOrder(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = OrderExtendedSerializer

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        serializer = OrderExtendedSerializer(order,context={'request': request})
        return Response(serializer.data)

hijri_months = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
]

def format_date_arabic(d):
    h = Gregorian(d.year, d.month, d.day).to_hijri()
    monthasstr = hijri_months[h.month - 1]
    return f"{h.year}/{monthasstr}/{h.day}"
class AdminUpdateProductInstance(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]  # Ensure user is logged in and is superuser
    serializer_class = ProductInstanceAdminSerializer           # Should b
    def post(self, request, productinstance_id):
        productinstance = get_object_or_404(ProductInstance, id=productinstance_id)  # or order_id=order_id if that's the field name
        status_value = request.data.get("status")
        rejection_reason = request.data.get("rejection_reason")
        productinstance.status = status_value
        productinstance.rejection_reason = rejection_reason
        productinstance.save()
        
        
        

        return Response({"message": "Order has been rejected."}, status=status.HTTP_201_CREATED)
from django.db.models import Count, F, Value
class AdminUpdateOrder(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]  # Ensure user is logged in and is superuser
    serializer_class = OrderExtendedSerializer           # Should b
    from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .OrderInvoiceView import OrderViewSet

from .permissions import IsSuperUser  # Your custom class


class AdminUpdateOrder(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        status_value = request.data.get("status")
        rejection_reason = request.data.get("rejection_reason")
        
        order.status = status_value
        order.rejection_reason = rejection_reason

        rejected_items = order.items.filter(status='RJC')
        if status_value == 'ACC' and rejected_items.exists():
            order.status = 'PRJ'
        
        order.save()

        if status_value == 'ACC':
            orderview = OrderViewSet()
            orderview.generate_invoice(order)
            return Response({"message": "Invoice generated and emailed successfully."}, status=status.HTTP_201_CREATED)

        return Response({"message": "Order has been rejected."}, status=status.HTTP_200_OK)

class AdminResendAdmin(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in and is superuser
    serializer_class = OrderExtendedSerializer
    def post(self,request,invoice_id):
        invoice = get_object_or_404(Invoice,id=invoice_id)

        return sendemai(invoice.order,invoice)
from django.db.models import Q
class PaidOrdersView(ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = OrderPaidSerializer
    pagination_class = OrdersAdminUserPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = Order.objects.filter( Q(status='ACC') | Q(status='PRJ'), 
                                        order_status='UNP')

        if query:
            queryset = queryset.filter(purchaser__company__name__icontains=query)

        return queryset.order_by('-purchaseDate')

class ExecutePaidOrderView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        if (order.status != 'ACC' and order.status != 'PRJ') or order.order_status != 'UNP' :
            return Response(
                {"error": "Invalid order status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.order_status = 'PRC'
        order.paid_datetime = timezone.now()
        order.save()

        serializer = OrderPaidSerializer(order)
        return Response(serializer.data)
from django.http import JsonResponse



class ProcessingOrdersView(ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = OrderPaidSerializer
    pagination_class = OrdersAdminUserPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = Order.objects.filter( Q(status='ACC')|Q(status = 'PRJ'), order_status='PRC')

        if query:
            queryset = queryset.filter(purchaser__company__name__icontains=query)

        return queryset.order_by('-purchaseDate')
from django.db.models import F
class ReadyToDeliverView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        if (order.status != 'ACC' and order.status != 'PRJ') or order.order_status != 'PRC':
            return Response(
                {"error": "Invalid order status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        unqaequated_items = order.items.filter(~Q(status = 'RJC')).filter(product__stock_quantity__lt=F('quantity')).values_list('product__name', flat=True)
        if(len(unqaequated_items) > 0):
            items_str = ", ".join(unqaequated_items)
            return JsonResponse(
    {'error': _("Not enough items in the stock:  %(items_str)s") % {'items_str': items_str}},
    status=400
)
        items = order.items.filter(~Q(status = 'RJC')).all()
        products_to_update = []

        for item in items:
            product = item.product
            product.stock_quantity -= item.quantity
            products_to_update.append(product)

        Product.objects.bulk_update(products_to_update, ['stock_quantity'])

        order.order_status = 'UDL'
        order.save()

        serializer = OrderPaidSerializer(order)
        return Response(serializer.data)

class UndeliveredOrdersView(ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = OrderPaidSerializer
    pagination_class = OrdersAdminUserPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = Order.objects.filter(status='ACC', order_status='UDL')

        if query:
            queryset = queryset.filter(purchaser__company__name__icontains=query)

        return queryset.order_by('-purchaseDate')

class ExecuteDeliveryView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        if order.status != 'ACC' or order.order_status != 'UDL':
            return Response(
                {"error": "Invalid order status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.order_status = 'DLV'
        order.delivered_datetime = timezone.now()
        order.save()

        serializer = OrderPaidSerializer(order)
        return Response(serializer.data)

from django.utils.translation import gettext as _
from openpyxl.styles import PatternFill, Font, Alignment
from openpyxl.utils import get_column_letter
from decimal import Decimal
from babel.numbers import format_currency

class AdminDetailsReportPeriodView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        language = request.LANGUAGE_CODE
        print(language)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date', datetime.date.today())
        instances = ProductInstance.objects.filter(order__purchaseDate__range=
                                                   (start_date, end_date),order__order_status='PRC' ).select_related('order__purchaser__company').prefetch_related('order__purchaser__company__users__orders').prefetch_related('product')
        
        headers = [
            _("Name"),
            _("Part Id"),
            _("Price"),
            _("Quantity"),
            _("Branch"),
            _("Total Price"),
            _("Quantities In Stock"),
            _("Company"),
            _("Purchase Date"),
            _("Company Credit"),
            _("Credit"),
           
        ]
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"{_('Purchased Items')} - {start_date} - {end_date}"

        # Define styles
        header_fill = PatternFill(start_color="404040", end_color="404040", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)
        alt_row_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
        light_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
        info_font = Font( bold=True)
        for col, header in enumerate(headers,1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center')
        for row, instance in enumerate(instances, 2):
            row_data = [
                instance.product.name,
                instance.product.part_id,
                self.format_currency_localized(instance.price,instance.currency, language),
                instance.quantity,
                getattr(instance.branch, 'name', ''),
                self.format_currency_localized(instance.price*instance.quantity,
                                               instance.currency, language),
                instance.product.stock_quantity,
                instance.order.purchaser.company.name,
                format_date_arabic( 
                    instance.order.purchaseDate) if language == 'ar' else instance.order.purchaseDate
                ,
                self.format_currency_localized(getattr(instance.order.purchaser.company, 'credit', 0), 'SAR', language),
                self.format_currency_localized(
                    self.calculatesRmainsCredit(instance.order.purchaser.company), 
                    instance.currency, language)
            ]
            row_fill = alt_row_fill if row % 2 == 0 else light_row_fill
            
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row, column=col, value=value)
                cell.fill = row_fill
                cell.alignment = Alignment(horizontal='center')

        # Auto-adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(col)].auto_size = True

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=instances_report.xlsx'
        wb.save(response)
        return response
    def format_currency_localized(self, amount, currency_code='SAR', locale='ar_SA'):
        """
        Format currency using Babel based on locale and currency code.

        :param amount: The numeric value to format.
        :param currency_code: The ISO 4217 currency code (e.g., 'USD', 'SAR').
        :param locale: The locale code (e.g., 'en_US', 'ar_SA').
        :return: A localized currency string.
        """
        try:
            return format_currency(amount, currency_code, locale=locale)
        except Exception as e:
        # Fallback in case of formatting failure
            return f"{amount:,.2f} {currency_code}"
    def userOrdersSum(self,user):
        return sum(self.get_total_price(order) for order in user.orders.filter(order_status='UNP').all() )  
    def calculatesRmainsCredit(self,company):
       credit = company.credit
       ordersSum = sum(self.userOrdersSum(user) for user in company.users.all())
       return credit - ordersSum

    def userOrdersSum(self,user):
        return sum(self.get_total_price(order) for order in user.orders.filter(order_status='UNP').all() )   
    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.filter(~Q(status = 'RJC')).all())
class AdminOrderDetailsReportView(APIView):
    def calculatesRmainsCredit(self,company):
       credit = company.credit
       ordersSum = sum(self.userOrdersSum(user) for user in company.users.all())
       return credit - ordersSum
    def userOrdersSum(self,user):
        return sum(self.get_total_price(order) for order in user.orders.filter(order_status='UNP').all() )  
    permission_classes = [IsAdminUser]
    def get(self, request,order_id):
        language = request.LANGUAGE_CODE
        order = Order.objects.get(id=order_id)
        instances =  order.items.all()
        headers = [
            _("Name"),
            _("Part Id"),
            _("Price"),
            _("Quantity"),
            _("Branch"),
            _("Total Price")
           
        ]

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"{_('Products Order')} - {order.id}"

        # Define styles
        header_fill = PatternFill(start_color="404040", end_color="404040", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)
        alt_row_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
        light_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
        info_font = Font(bold=True)

        # Row 1: Headers
        header_labels = [_("Company Name"), _("Company Credit"),_("Credit"),  _("Order ID"), _("Total Price")]
        for col, header in enumerate(header_labels, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal='center')

        # Row 2: Values
        company = getattr(order.purchaser, 'company', None)
        row2_data = [
            getattr(company, 'name', ''),
            self.format_currency_localized(getattr(company, 'credit', 0), 'SAR', language),
            self.format_currency_localized(self.calculatesRmainsCredit(company),'SAR', language),
            order.id,
            self.format_currency_localized(self.get_total_price(order), 'SAR', language)
        ]

        for col, value in enumerate(row2_data, 1):
            cell = ws.cell(row=2, column=col, value=value)
            cell.alignment = Alignment(horizontal='center')

        # Set header row (now at row 3)
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=3, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center')

        # Add data rows with alternating colors (starting from row 4)
        for row, instance in enumerate(instances, 4):
            row_data = [
                instance.product.name,
                instance.product.part_id,
                self.format_currency_localized(instance.price,instance.currency, language),
                instance.quantity,
                getattr(instance.branch, 'name', ''),
                self.format_currency_localized(instance.price*instance.quantity,
                                               instance.currency, language)
            ]

            # Apply alternating row colors
            row_fill = alt_row_fill if row % 2 == 0 else light_row_fill
            cellfont =   Font(strike=True,color = '8B0000') if instance.status == 'RJC' else Font() 
         
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row, column=col, value=value)
                cell.fill = row_fill
                cell.alignment = Alignment(horizontal='center')
                cell.font = cellfont

        # Auto-adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(col)].auto_size = True

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=instances_report.xlsx'
        wb.save(response)
        return response
    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.filter(~Q(status = 'RJC')).all())
    def format_currency_localized(self, amount, currency_code='SAR', locale='ar_SA'):
        """
        Format currency using Babel based on locale and currency code.

        :param amount: The numeric value to format.
        :param currency_code: The ISO 4217 currency code (e.g., 'USD', 'SAR').
        :param locale: The locale code (e.g., 'en_US', 'ar_SA').
        :return: A localized currency string.
        """
        try:
            return format_currency(amount, currency_code, locale=locale)
        except Exception as e:
        # Fallback in case of formatting failure
            return f"{amount:,.2f} {currency_code}"


class AdminOrderReportView(APIView):
    permission_classes = [IsAdminUser]
    def userOrdersSum(self,user):
        return sum(self.get_total_price(order) for order in user.orders.filter(order_status='UNP').all() )  
    def calculatesRmainsCredit(self,company):
       credit = company.credit
       ordersSum = sum(self.userOrdersSum(user) for user in company.users.all())
       return credit - ordersSum
    def format_currency_localized(self, amount, currency_code='SAR', locale='ar_SA'):
        """
        Format currency using Babel based on locale and currency code.

        :param amount: The numeric value to format.
        :param currency_code: The ISO 4217 currency code (e.g., 'USD', 'SAR').
        :param locale: The locale code (e.g., 'en_US', 'ar_SA').
        :return: A localized currency string.
        """
        try:
            return format_currency(amount, currency_code, locale=locale)
        except Exception as e:
        # Fallback in case of formatting failure
            return f"{amount:,.2f} {currency_code}"
    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else 'SAR'      
    def get(self, request):
        
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date', datetime.date.today())
        order_status = request.GET.get('order_status')
        company_id = request.GET.get('company_id')
        orders = Order.objects.filter(
            purchaseDate__range=(start_date, end_date),
            order_status=order_status
        ).select_related('purchaser__company').prefetch_related('items')
        if(company_id ) :
            orders.filter(purchaser__company__id=company_id)
        
        language = request.LANGUAGE_CODE
        print(start_date)
        if not start_date:
            return HttpResponse(_("Missing start_date"), status=400)
        

        

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = _("Orders Report")

        # Define styles
        header_fill = PatternFill(start_color="404040", end_color="404040", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)
        alt_row_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
        light_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

        # Define headers with translations
        headers = [
            _("ID"),
            _("Status"),
            _("Order Status"),
            _("Purchase Date"),
            _("Paid Date"),
            _("Company Name"),
            _("Company Register Number"),
            _("Company Credit"),
            _("Credit"),
            _("Total Price")
        ]

        # Set header row
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center')

        # Add data rows with alternating colors
        for row, order in enumerate(orders, 2):
            company = getattr(order.purchaser, 'company', None)
            date = getattr(order, 'paid_datetime', '')
            row_data = [
                order.id,
                _(order.status) ,
                _(order.order_status),
                 format_date_arabic( 
                   order.purchaseDate) if language == 'ar' else order.purchaseDate
                ,
                '' if date == '' else format_date_arabic(getattr(order, 'paid_datetime', '')) if language == 'ar' else getattr(order, 'paid_datetime', ''),
                getattr(company, 'name', ''),
                getattr(company, 'register_number', ''),
                self.format_currency_localized(getattr(company, 'credit', 0), 'SAR', language),
                self.format_currency_localized(
                    self.calculatesRmainsCredit(company), 
                    'SAR', language),
                self.format_currency_localized(self.get_total_price(order),self.get_currency(order), language)
            ]

            # Apply alternating row colors
            row_fill = alt_row_fill if row % 2 == 0 else light_row_fill
            
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row, column=col, value=value)
                cell.fill = row_fill
                cell.alignment = Alignment(horizontal='center')

        # Auto-adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(col)].auto_size = True

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=orders_report.xlsx'
        wb.save(response)
        return response

    def get_total_price(self, obj):
        return sum(item.price * item.quantity for item in obj.items.filter(~Q(status = 'RJC')).all())



    def format_currency_localized(self, amount, currency_code='SAR', locale='ar_SA'):
        """
        Format currency using Babel based on locale and currency code.

        :param amount: The numeric value to format.
        :param currency_code: The ISO 4217 currency code (e.g., 'USD', 'SAR').
        :param locale: The locale code (e.g., 'en_US', 'ar_SA').
        :return: A localized currency string.
        """
        try:
            return format_currency(amount, currency_code, locale=locale)
        except Exception as e:
        # Fallback in case of formatting failure
            return f"{amount:,.2f} {currency_code}"
  # USD
     
    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else None

       

            

