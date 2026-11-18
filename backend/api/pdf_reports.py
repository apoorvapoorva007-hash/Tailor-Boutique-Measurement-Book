import io
import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch

# Boutique Brand Palette (Cream, Blush pink, Muted brown, Navy)
COLOR_PRIMARY = colors.HexColor("#7B3F38")      # Deep boutique rust/brown
COLOR_SECONDARY = colors.HexColor("#D98880")    # Blush pink
COLOR_ACCENT = colors.HexColor("#FADBD8")       # Soft blush cream
COLOR_DARK = colors.HexColor("#2C3E50")         # Charcoal / Navy
COLOR_LIGHT_BG = colors.HexColor("#FDFBF7")     # Warm boutique ivory
COLOR_MUTED = colors.HexColor("#7F8C8D")        # Neutral gray

def generate_order_invoice_pdf(order):
    """
    Generates a professional Boutique Measurement Job Card & Invoice PDF for an order.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'BoutiqueTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=COLOR_PRIMARY,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'BoutiqueSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=COLOR_MUTED,
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=COLOR_PRIMARY,
        spaceBefore=10,
        spaceAfter=6
    )
    normal_style = ParagraphStyle(
        'NormalText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=COLOR_DARK
    )
    bold_style = ParagraphStyle(
        'BoldText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=COLOR_DARK
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>TAILOR & BOUTIQUE MEASUREMENT BOOK</b><br/><font size=8 color='#7F8C8D'>Haute Couture & Custom Designer Tailoring</font>", title_style),
            Paragraph(f"<b>ORDER JOB CARD & INVOICE</b><br/><b>Order #:</b> {order.order_id}<br/><b>Date:</b> {order.order_date.strftime('%d-%b-%Y') if order.order_date else ''}", normal_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[4.2 * inch, 3.0 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY, spaceAfter=14))

    # 2. Customer & Delivery Overview
    cust_data = [
        [Paragraph("<b>Customer Name:</b>", bold_style), Paragraph(order.customer_name, normal_style),
         Paragraph("<b>Garment Type:</b>", bold_style), Paragraph(f"<b>{order.garment_type}</b>", bold_style)],
        [Paragraph("<b>Customer ID:</b>", bold_style), Paragraph(order.customer_id, normal_style),
         Paragraph("<b>Order Status:</b>", bold_style), Paragraph(order.status, bold_style)],
        [Paragraph("<b>Phone Number:</b>", bold_style), Paragraph(order.customer_phone, normal_style),
         Paragraph("<b>Delivery Date:</b>", bold_style), Paragraph(order.delivery_date.strftime('%d-%b-%Y') if order.delivery_date else 'TBD', bold_style)],
        [Paragraph("<b>Fitting Trial Date:</b>", bold_style), Paragraph(order.fitting_date.strftime('%d-%b-%Y') if order.fitting_date else 'None scheduled', normal_style),
         Paragraph("<b>Priority:</b>", bold_style), Paragraph(order.priority, normal_style)],
    ]
    cust_table = Table(cust_data, colWidths=[1.4 * inch, 2.2 * inch, 1.4 * inch, 2.2 * inch])
    cust_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, COLOR_SECONDARY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#EAECEE")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(cust_table)
    story.append(Spacer(1, 12))

    # 3. Dynamic Measurement Table
    story.append(Paragraph(f"MEASUREMENT RECORD (Unit: {order.measurement_unit.upper()})", heading_style))
    measurements = order.measurements or {}
    
    # Chunk measurements into 2-column or 3-column key-value grid
    meas_rows = []
    items = list(measurements.items())
    for i in range(0, len(items), 3):
        chunk = items[i:i+3]
        row = []
        for k, v in chunk:
            label = k.replace('_', ' ').title()
            val_str = f"{v} {order.measurement_unit}"
            row.extend([Paragraph(f"<b>{label}:</b>", bold_style), Paragraph(val_str, normal_style)])
        while len(row) < 6:
            row.extend([Paragraph("", normal_style), Paragraph("", normal_style)])
        meas_rows.append(row)

    if not meas_rows:
        meas_rows = [[Paragraph("No measurements recorded", normal_style)] * 6]

    meas_table = Table(meas_rows, colWidths=[1.3 * inch, 1.1 * inch, 1.3 * inch, 1.1 * inch, 1.3 * inch, 1.1 * inch])
    meas_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, COLOR_SECONDARY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F2D7D5")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meas_table)
    story.append(Spacer(1, 12))

    # 4. Fabric Details & Stitching Instructions
    story.append(Paragraph("FABRIC DETAILS & TAILORING SPECIFICATIONS", heading_style))
    fabric = order.fabric_details or {}
    spec_data = [
        [Paragraph("<b>Fabric Type:</b>", bold_style), Paragraph(fabric.get("fabric_type", "Standard Fabric"), normal_style),
         Paragraph("<b>Color / Pattern:</b>", bold_style), Paragraph(fabric.get("color", "Self Pattern"), normal_style)],
        [Paragraph("<b>Lining:</b>", bold_style), Paragraph(fabric.get("lining", "Cotton lining"), normal_style),
         Paragraph("<b>Source:</b>", bold_style), Paragraph(fabric.get("source", "Customer Provided"), normal_style)],
        [Paragraph("<b>Stitching Instructions:</b>", bold_style), Paragraph(order.stitching_instructions or "Standard boutique cut & stitching", normal_style), "", ""]
    ]
    spec_table = Table(spec_data, colWidths=[1.4 * inch, 2.2 * inch, 1.4 * inch, 2.2 * inch])
    spec_table.setStyle(TableStyle([
        ('SPAN', (1,2), (3,2)),
        ('BACKGROUND', (0,0), (-1,-1), COLOR_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, COLOR_SECONDARY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#EAECEE")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(spec_table)
    story.append(Spacer(1, 14))

    # 5. Financial Summary Box
    story.append(Paragraph("PAYMENT & BILLING SUMMARY", heading_style))
    fin_data = [
        [Paragraph("<b>Total Stitching & Fabric Amount:</b>", bold_style), Paragraph(f"Rs. {order.total_amount:.2f}", bold_style)],
        [Paragraph("Advance Payment Received:", normal_style), Paragraph(f"Rs. {order.advance_payment:.2f}", normal_style)],
        [Paragraph("<b>Balance Due on Delivery:</b>", bold_style), Paragraph(f"<b>Rs. {order.balance_payment:.2f}</b>", bold_style)],
    ]
    fin_table = Table(fin_data, colWidths=[4.8 * inch, 2.4 * inch])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ACCENT),
        ('BACKGROUND', (0,2), (-1,2), COLOR_ACCENT),
        ('BOX', (0,0), (-1,-1), 1, COLOR_PRIMARY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#EAECEE")),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(fin_table)

    # 6. Signature line
    story.append(Spacer(1, 25))
    sig_data = [
        [Paragraph("Customer Signature: _______________________", normal_style),
         Paragraph("Master Tailor Signature: _______________________", normal_style)]
    ]
    sig_table = Table(sig_data, colWidths=[3.6 * inch, 3.6 * inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(sig_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_business_summary_pdf(data):
    """
    Generates complete summary report for boutique management.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'BoutiqueTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=COLOR_PRIMARY
    )
    normal_style = ParagraphStyle('NormalText', parent=styles['Normal'], fontSize=9, textColor=COLOR_DARK)
    bold_style = ParagraphStyle('BoldText', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=COLOR_DARK)

    story = [
        Paragraph("<b>TAILOR & BOUTIQUE MANAGEMENT REPORT</b>", title_style),
        Paragraph(f"Generated on: {datetime.datetime.now().strftime('%d-%b-%Y %I:%M %p')}", normal_style),
        Spacer(1, 10),
        HRFlowable(width="100%", thickness=1.5, color=COLOR_SECONDARY, spaceAfter=12)
    ]

    # Metrics Grid
    stats = data.get("stats", {})
    metric_rows = [
        [
            Paragraph("<b>Total Customers:</b>", bold_style), Paragraph(str(stats.get("total_customers", 0)), normal_style),
            Paragraph("<b>Total Orders:</b>", bold_style), Paragraph(str(stats.get("total_orders", 0)), normal_style)
        ],
        [
            Paragraph("<b>Pending Orders:</b>", bold_style), Paragraph(str(stats.get("pending_orders", 0)), normal_style),
            Paragraph("<b>Orders In Progress:</b>", bold_style), Paragraph(str(stats.get("in_progress_orders", 0)), normal_style)
        ],
        [
            Paragraph("<b>Completed Orders:</b>", bold_style), Paragraph(str(stats.get("completed_orders", 0)), normal_style),
            Paragraph("<b>Delivered Orders:</b>", bold_style), Paragraph(str(stats.get("delivered_orders", 0)), normal_style)
        ],
        [
            Paragraph("<b>Upcoming Deliveries:</b>", bold_style), Paragraph(str(stats.get("upcoming_deliveries", 0)), normal_style),
            Paragraph("<b>Overdue Deliveries:</b>", bold_style), Paragraph(f"<font color='red'><b>{stats.get('overdue_deliveries', 0)}</b></font>", normal_style)
        ],
        [
            Paragraph("<b>Total Revenue:</b>", bold_style), Paragraph(f"<b>Rs. {stats.get('total_revenue', 0):,.2f}</b>", bold_style),
            Paragraph("<b>Balance Outstanding:</b>", bold_style), Paragraph(f"Rs. {stats.get('total_balance_due', 0):,.2f}", normal_style)
        ]
    ]
    metric_table = Table(metric_rows, colWidths=[1.8 * inch, 1.8 * inch, 1.8 * inch, 1.8 * inch])
    metric_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, COLOR_PRIMARY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#EAECEE")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 15))

    # Recent Orders Table
    story.append(Paragraph("<b>RECENT BOUTIQUE ORDERS</b>", styles['Heading2']))
    orders = data.get("recent_orders", [])
    order_rows = [[
        Paragraph("<b>Order ID</b>", bold_style),
        Paragraph("<b>Customer</b>", bold_style),
        Paragraph("<b>Garment</b>", bold_style),
        Paragraph("<b>Status</b>", bold_style),
        Paragraph("<b>Delivery</b>", bold_style),
        Paragraph("<b>Total</b>", bold_style)
    ]]
    for o in orders[:10]:
        order_rows.append([
            Paragraph(o.get("order_id", ""), normal_style),
            Paragraph(o.get("customer_name", ""), normal_style),
            Paragraph(o.get("garment_type", ""), normal_style),
            Paragraph(o.get("status", ""), normal_style),
            Paragraph(o.get("delivery_date", ""), normal_style),
            Paragraph(f"Rs. {o.get('total_amount', 0):.2f}", normal_style)
        ])
    if len(order_rows) == 1:
        order_rows.append([Paragraph("No orders found", normal_style)] * 6)

    order_table = Table(order_rows, colWidths=[1.2 * inch, 1.5 * inch, 1.4 * inch, 1.3 * inch, 1.0 * inch, 0.8 * inch])
    order_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ACCENT),
        ('BOX', (0,0), (-1,-1), 1, COLOR_SECONDARY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#EAECEE")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(order_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
