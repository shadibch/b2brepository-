from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.core.mail import EmailMessage
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from io import BytesIO
from cart.models import Order, Invoice, ProductInstance
from datetime import datetime, timedelta
import arabic_reshaper
from bidi.algorithm import get_display
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

# Register the custom Arabic font
import os
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from pathlib import Path
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from babel import Locale
from hijri_converter import Hijri, Gregorian
FONT_PATH = str( os.path.join(settings.FONT_FOLDER , "NotoNaskhArabic-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoNaskhArabic-Regular", FONT_PATH))

print("Font registered successfully!")


# Register the font
#pdfmetrics.registerFont(TTFont("NotoNaskhArabic-Regular", FONT_PATH))


class OrderViewSet():

    def generate_invoice(self,order):
       
        print("Sending emial")
        if hasattr(order, 'order'):
            return Response({"detail": "Invoice already exists."}, status=status.HTTP_400_BAD_REQUEST)

        

        invoice = Invoice.objects.create(
            purchaser=order.purchaser,
            order=order,
            expirePaymentDate=datetime.now() + timedelta(days=order.purchaser.company.period)
        )

        return sendemai(order,invoice)
      

def sendemai(order,invoice):
    buffer = generate_invoice_pdf(order,invoice)
    instances = order.items.all()
    total_price = sum([item.price * item.quantity for item in instances])
    currency = instances.first().currency if instances else 'SAR'
        # Compose email

    purchaser = order.purchaser
    expiry_date = (datetime.now() + timedelta(days=purchaser.company.period))
    print(expiry_date)
    html_body = f"""
<html lang="ar" dir="rtl">
  <body style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
    <p>عزيزي {purchaser.first_name} {purchaser.last_name},</p>
    <p>يسعدنا إبلاغك بأن طلبك رقم #{order.id} قد تم قبوله.</p>
    <p>يرجى العثور على الفاتورة المرفقة رقم #{invoice.id} بمبلغ إجمالي {total_price} {currency}.</p>
    <p>نرجو منك إتمام الدفع قبل تاريخ {format_date_arabic(expiry_date)}.</p>
    <p>مع أطيب التحيات،<br/>فريق B2B</p>
  </body>
</html>
"""

# Create the multipart email
    message = MIMEMultipart()
    message["Subject"] = f"فاتورة رقم {invoice.id}"
    
    print("EMAIL_HOST =", settings.EMAIL_HOST , "EMAIL_HOST_USER " , settings.EMAIL_HOST_USER , "EMAIL_HOST_PASSWORD  " , settings.EMAIL_HOST_PASSWORD)
        
    sender_email = settings.EMAIL_HOST_EMAIL
    receiver_email = order.purchaser.email
    message["From"] = sender_email
    message["To"] = receiver_email
    body = html_body
    # Create the multipart email
      

    # Attach the text part
    message.attach(MIMEText(body, "html"))
    pdf_attachment = MIMEApplication(buffer.read(), _subtype="pdf")
    pdf_attachment.add_header('Content-Disposition', 'attachment', filename=f"invoice_{invoice.id}.pdf")
    message.attach(pdf_attachment)
      
    with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
        server.starttls()  # Secure the connection
        server.login(settings.EMAIL_HOST_USER , settings.EMAIL_HOST_PASSWORD )
        server.sendmail( settings.EMAIL_HOST_EMAIL, order.purchaser.email ,message.as_string())


    return Response({"message": "Invoice generated and emailed successfully."}, status=status.HTTP_201_CREATED)


from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

import arabic_reshaper
from bidi.algorithm import get_display

from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

# Register an Arabic font



from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib.enums import *
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import Table, TableStyle
from reportlab.pdfgen import canvas
from io import BytesIO
from django.http import FileResponse
from decimal import Decimal
from babel.dates import format_date
from babel.numbers import format_currency, format_decimal
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT


def format_arabic_number(value):
    return get_display(arabic_reshaper.reshape(format_decimal(value, locale='ar_SA')))

def format_arabic_currency(value, currency="SAR"):
    return get_display(arabic_reshaper.reshape(format_currency(value, currency, locale='ar_SA')))
locale = Locale('ar', 'SA')
from hijri_converter import Gregorian

# Example list of Hijri month names in Arabic
hijri_months = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
]

def format_date_arabic(d):
    h = Gregorian(d.year, d.month, d.day).to_hijri()
    monthasstr = hijri_months[h.month - 1]
    return f"{h.year}/{monthasstr}/{h.day}"



def generate_invoice_pdf(order, invoice):
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_RIGHT
    from reportlab.lib import colors
    from io import BytesIO
    import arabic_reshaper
    from bidi.algorithm import get_display

    def process_arabic(text):
        reshaped = arabic_reshaper.reshape(text)
        return get_display(reshaped)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=40, leftMargin=40,
                            topMargin=40, bottomMargin=40)

    styles = getSampleStyleSheet()
    arabic_style = ParagraphStyle(
        name='ArabicRight',
        parent=styles['Normal'],
        fontName='NotoNaskhArabic-Regular',
        fontSize=10,
        alignment=TA_RIGHT,
        leading=12,
    )

    header_style = ParagraphStyle(
        name='Header',
        parent=arabic_style,
        fontSize=16
    )

    elements = []

    # Header
    elements.append(Paragraph("B2B", styles['Title']))
    elements.append(Paragraph(process_arabic("فاتورة"), header_style))
    elements.append(Spacer(1, 12))

    # Invoice metadata (simplified into paragraphs)
    purchase_date_str = format_date_arabic(invoice.order.purchaseDate)
    expirePaymentDate_str = format_date_arabic(invoice.expirePaymentDate)
    period_days = order.purchaser.company.period
    period_days_ar = format_arabic_number(period_days)

# Prepare invoice info
    invoice_info = [
        Paragraph(f"{get_display(arabic_reshaper.reshape(purchase_date_str))} :{process_arabic('التاريخ')}", arabic_style),
        Paragraph(f"{format_arabic_number(invoice.id)} :{process_arabic('رقم الفاتورة')}", arabic_style),
        Paragraph(f"{format_arabic_number(order.purchaser.id)} :{process_arabic('معرف العميل')}", arabic_style),
        Paragraph(f"{get_display(arabic_reshaper.reshape(expirePaymentDate_str))} :{process_arabic('تاريخ الاستحقاق')}", arabic_style)
    ]


# Prepare bill to info
    bill_to = [
        Paragraph(process_arabic("الفاتورة إلى"), header_style),
        Paragraph(process_arabic(order.purchaser.first_name + " " + order.purchaser.last_name), arabic_style),
        Paragraph(process_arabic(order.purchaser.company.name), arabic_style),
        Paragraph(process_arabic(order.purchaser.company.address), arabic_style)
    ]

# Combine both in a table with two columns (Right: invoice info, Left: bill to)
    info_table = Table(
    [
        [invoice_info[i] if i < len(invoice_info) else '', bill_to[i] if i < len(bill_to) else '']
        for i in range(max(len(invoice_info), len(bill_to)))
    ],
    colWidths=[250, 250],  # Adjust based on your layout needs
    hAlign='RIGHT'
    )

    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'NotoNaskhArabic-Regular'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    elements.append(info_table)
    elements.append(Spacer(1, 20))


    # Item Table
    data = [[
        Paragraph(process_arabic("الإجمالي"), arabic_style),
        Paragraph(process_arabic("سعر الوحدة"), arabic_style),
        Paragraph(process_arabic("الكمية"), arabic_style),
        Paragraph(process_arabic("الوصف"), arabic_style)
    ]]

    for item in order.items.all():
        description = Paragraph(process_arabic(item.branch.name + ': ' + item.product.name), arabic_style)
        quantity = format_arabic_number(item.quantity)
        item_price = format_arabic_currency(item.price, item.currency)
        amount = format_arabic_currency(item.price * item.quantity, item.currency)

        data.append([
            Paragraph(amount, arabic_style),
            Paragraph(item_price, arabic_style),
            Paragraph(quantity, arabic_style),
            description
        ])

    table = Table(data, colWidths=[100, 80, 50, 250])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'NotoNaskhArabic-Regular'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, None])
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # Totals
    subtotal = sum(item.price * item.quantity for item in order.items.all())
    totals_data = [[
        Paragraph(format_arabic_currency(subtotal), arabic_style),
        Paragraph(process_arabic("المجموع الفرعي"), arabic_style)
    ]]

    totals_table = Table(totals_data, colWidths=[100, 100])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'NotoNaskhArabic-Regular'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 30))

    # Comments
    elements.append(Paragraph(process_arabic("ملاحظات أخرى"), arabic_style))
    elements.append(Spacer(1, 10))
    comment_1 = f"١. الدفع خلال {period_days_ar} يومًا من تاريخ الفاتورة."
    elements.append(Paragraph(process_arabic(comment_1), arabic_style))
    elements.append(Paragraph(process_arabic("٢. يرجى تضمين رقم الفاتورة عند الدفع."), arabic_style))
    elements.append(Spacer(1, 40))

    # Footer
    elements.append(Paragraph(process_arabic("يرجى دفع المبلغ إلى اسم الشركة"), arabic_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(process_arabic("للاستفسار، يرجى التواصل مع جون دو، 000-000-0000، email@example.com"), arabic_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(process_arabic("شكرًا لتعاملكم معنا!"), arabic_style))

    # Generate PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer


