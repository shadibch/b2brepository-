from rest_framework.generics import *
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from .permissions import IsSuperUser
from cart.models import *
from cart.serializers import OrderExtendedSerializer,OrderSerializerAdminHistory, OrderPaidSerializer
from django.shortcuts import get_object_or_404 
from .OrderInvoiceView import OrderViewSet,sendemai
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import datetime
import openpyxl
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
class OrdersAdminUserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

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


class AdminUpdateOrder(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]  # Ensure user is logged in and is superuser
    serializer_class = OrderExtendedSerializer           # Should b
    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)  # or order_id=order_id if that's the field name
        status_value = request.data.get("status")
        rejection_reason = request.data.get("rejection_reason")
        order.status = status_value
        order.rejection_reason = rejection_reason
        order.save()

        if status_value == 'ACC':
            orderview = OrderViewSet()
            return orderview.generate_invoice(order)

        return Response({"message": "Order has been rejected."}, status=status.HTTP_201_CREATED)
class AdminResendAdmin(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in and is superuser
    serializer_class = OrderExtendedSerializer
    def post(self,request,invoice_id):
        invoice = get_object_or_404(Invoice,id=invoice_id)

        return sendemai(invoice.order,invoice)

class PaidOrdersView(ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = OrderPaidSerializer
    pagination_class = OrdersAdminUserPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = Order.objects.filter(status='ACC', 
                                        order_status='UNP')

        if query:
            queryset = queryset.filter(purchaser__company__name__icontains=query)

        return queryset.order_by('-purchaseDate')

class ExecutePaidOrderView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        if order.status != 'ACC' or order.order_status != 'UNP':
            return Response(
                {"error": "Invalid order status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.order_status = 'PRC'
        order.paid_datetime = timezone.now()
        order.save()

        serializer = OrderPaidSerializer(order)
        return Response(serializer.data)

class ProcessingOrdersView(ListAPIView):
    permission_classes = [IsAuthenticated, IsSuperUser]
    serializer_class = OrderPaidSerializer
    pagination_class = OrdersAdminUserPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        queryset = Order.objects.filter(status='ACC', order_status='PRC')

        if query:
            queryset = queryset.filter(purchaser__company__name__icontains=query)

        return queryset.order_by('-purchaseDate')

class ReadyToDeliverView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        if order.status != 'ACC' or order.order_status != 'PRC':
            return Response(
                {"error": "Invalid order status"},
                status=status.HTTP_400_BAD_REQUEST
            )

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
class AdminOrderDetailsReportView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request,order_id):
        order = Order.objects.get(order_id)
        instances =  order.items.all()
        headers = [
            _("Order ID"),
            _("Status"),
            _("Order Status"),
            _("Purchase Date"),
            _("Paid Date"),
            _("Company Name"),
            _("Company Register Number"),
            _("Company Credit"),
            _("Total Price")
        ]

class AdminOrderReportView(APIView):
    permission_classes = [IsAdminUser]
    def get_currency(self,obj):
        instances =  obj.items.all()
        return instances[0].currency if instances.count() > 0 else 'SAR'      
    def get(self, request):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date', datetime.date.today())
        order_status = request.GET.get('order_status')
        language = request.LANGUAGE_CODE

        if not start_date:
            return HttpResponse(_("Missing start_date"), status=400)
        try:
            start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.datetime.strptime(str(end_date), "%Y-%m-%d").date()
        except Exception:
            return HttpResponse(_("Invalid date format"), status=400)

        orders = Order.objects.filter(
            purchaseDate__range=(start_date, end_date),
            order_status=order_status
        ).select_related('purchaser__company').prefetch_related('items')

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
            row_data = [
                order.id,
                _(order.status) ,
                _(order.order_status),
                order.purchaseDate,
                getattr(order, 'paid_datetime', ''),
                getattr(company, 'name', ''),
                getattr(company, 'register_number', ''),
                getattr(company, 'credit', ''),
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
        return sum(item.price * item.quantity for item in obj.items.all())



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

       

            

