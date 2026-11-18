import datetime
import calendar
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .db import get_db_status, init_mongodb
from .models import AdminUser, Customer, GarmentProfile, Order, FittingNote, DeliveryDate
from .auth_helpers import generate_token, verify_token, admin_required
from .garment_templates import GARMENT_TEMPLATES
from .seed_data import seed_boutique_data
from .pdf_reports import generate_order_invoice_pdf, generate_business_summary_pdf

# =============================================================
# Health & Database Status
# =============================================================
@api_view(['GET'])
def health_check(request):
    db_info = get_db_status()
    counts = {}
    try:
        counts = {
            "customers": Customer.objects.count(),
            "orders": Order.objects.count(),
            "garment_profiles": GarmentProfile.objects.count(),
            "fitting_notes": FittingNote.objects.count(),
            "deliveries": DeliveryDate.objects.count(),
            "admin_users": AdminUser.objects.count()
        }
    except Exception as e:
        counts = {"error": str(e)}

    return Response({
        "status": "healthy",
        "system": "Tailor & Boutique Measurement Book API",
        "database": db_info,
        "counts": counts,
        "server_time": datetime.datetime.utcnow().isoformat()
    })

@api_view(['POST'])
def seed_database(request):
    force = request.data.get("force", False)
    result = seed_boutique_data(force=force)
    return Response(result)


# =============================================================
# Admin Authentication Views
# =============================================================
@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response(
            {"error": "Please provide both username and password."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Ensure admin user exists (auto-create default admin if missing)
    admin = AdminUser.objects(username=username).first()
    if not admin and username == 'admin':
        admin = AdminUser(
            username='admin',
            email='admin@tailorboutique.com',
            full_name='Master Tailor Admin',
            role='Admin'
        )
        admin.set_password('admin123')
        admin.save()

    if not admin or not admin.check_password(password):
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    admin.last_login = datetime.datetime.utcnow()
    admin.save()

    token = generate_token(admin.username)
    return Response({
        "message": "Login successful",
        "token": token,
        "user": admin.to_dict()
    })

@api_view(['GET'])
def admin_profile(request):
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split('Bearer ')[1].strip()

    if not token:
        return Response({"error": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

    user = verify_token(token)
    if not user:
        return Response({"error": "Invalid or expired token"}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"user": user.to_dict()})


# =============================================================
# Garment Templates Endpoint
# =============================================================
@api_view(['GET'])
def get_garment_templates(request):
    return Response({
        "templates": GARMENT_TEMPLATES,
        "garment_types": list(GARMENT_TEMPLATES.keys())
    })


# =============================================================
# Dashboard Stats & Interactive Charts
# =============================================================
@api_view(['GET'])
def dashboard_stats(request):
    now = datetime.datetime.utcnow()
    total_customers = Customer.objects.count()
    total_orders = Order.objects.count()

    # Order Status breakdowns
    pending_statuses = ['Order Received', 'Measurement Taken']
    in_progress_statuses = ['Stitching in Progress', 'Ready for Trial', 'Alteration Required']
    
    pending_orders = Order.objects(status__in=pending_statuses).count()
    in_progress_orders = Order.objects(status__in=in_progress_statuses).count()
    completed_orders = Order.objects(status='Completed').count()
    delivered_orders = Order.objects(status='Delivered').count()
    cancelled_orders = Order.objects(status='Cancelled').count()

    # Revenue
    all_orders = list(Order.objects)
    total_revenue = sum(float(o.total_amount or 0.0) for o in all_orders if o.status != 'Cancelled')
    advance_received = sum(float(o.advance_payment or 0.0) for o in all_orders if o.status != 'Cancelled')
    balance_due = sum(float(o.balance_payment or 0.0) for o in all_orders if o.status not in ['Delivered', 'Cancelled'])

    # Deliveries
    next_week = now + datetime.timedelta(days=7)
    upcoming_deliveries = Order.objects(
        delivery_date__gte=now,
        delivery_date__lte=next_week,
        status__nin=['Delivered', 'Cancelled']
    ).count()

    overdue_deliveries = Order.objects(
        delivery_date__lt=now,
        status__nin=['Delivered', 'Cancelled']
    ).count()

    # Chart 1: Order Status Distribution
    status_distribution = [
        {"name": "Order Received", "count": Order.objects(status='Order Received').count(), "color": "#E67E22"},
        {"name": "Measurement Taken", "count": Order.objects(status='Measurement Taken').count(), "color": "#F39C12"},
        {"name": "Stitching in Progress", "count": Order.objects(status='Stitching in Progress').count(), "color": "#3498DB"},
        {"name": "Ready for Trial", "count": Order.objects(status='Ready for Trial').count(), "color": "#9B59B6"},
        {"name": "Alteration Required", "count": Order.objects(status='Alteration Required').count(), "color": "#E74C3C"},
        {"name": "Completed", "count": completed_orders, "color": "#2ECC71"},
        {"name": "Delivered", "count": delivered_orders, "color": "#1ABC9C"},
        {"name": "Cancelled", "count": cancelled_orders, "color": "#95A5A6"},
    ]

    # Chart 2: Garment Type Distribution
    garment_distribution = []
    garment_types = list(GARMENT_TEMPLATES.keys())
    for gtype in garment_types:
        cnt = Order.objects(garment_type=gtype).count()
        if cnt > 0:
            garment_distribution.append({"name": gtype, "count": cnt})

    # Chart 3: Monthly Orders & Revenue (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        target_month_date = now - datetime.timedelta(days=i*30)
        year = target_month_date.year
        month = target_month_date.month
        month_name = calendar.month_abbr[month]
        
        # approximate month boundaries
        start_date = datetime.datetime(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        end_date = datetime.datetime(year, month, last_day, 23, 59, 59)

        m_orders = [o for o in all_orders if o.order_date and start_date <= o.order_date <= end_date]
        m_rev = sum(float(o.total_amount or 0.0) for o in m_orders if o.status != 'Cancelled')
        monthly_data.append({
            "month": f"{month_name} {str(year)[-2:]}",
            "orders": len(m_orders),
            "revenue": round(m_rev, 2)
        })

    # Recent 6 orders
    recent_orders = [o.to_dict() for o in Order.objects.order_by('-order_date')[:6]]

    return Response({
        "metrics": {
            "total_customers": total_customers,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "in_progress_orders": in_progress_orders,
            "completed_orders": completed_orders,
            "delivered_orders": delivered_orders,
            "upcoming_deliveries": upcoming_deliveries,
            "overdue_deliveries": overdue_deliveries,
            "total_revenue": round(total_revenue, 2),
            "advance_received": round(advance_received, 2),
            "balance_due": round(balance_due, 2)
        },
        "charts": {
            "status_distribution": status_distribution,
            "garment_distribution": garment_distribution,
            "monthly_orders": monthly_data
        },
        "recent_orders": recent_orders
    })


# =============================================================
# Customer Management Views
# =============================================================
@api_view(['GET', 'POST'])
def customer_list_create(request):
    if request.method == 'GET':
        query = request.GET.get('q', '').strip()
        customers = Customer.objects.order_by('-created_at')

        if query:
            # Search by name, phone, or customer_id
            customers = Customer.objects.filter(
                __raw__={
                    '$or': [
                        {'full_name': {'$regex': query, '$options': 'i'}},
                        {'phone': {'$regex': query, '$options': 'i'}},
                        {'customer_id': {'$regex': query, '$options': 'i'}},
                        {'email': {'$regex': query, '$options': 'i'}}
                    ]
                }
            )

        data = [c.to_dict(include_stats=True) for c in customers]
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()

        if not full_name or not phone:
            return Response(
                {"error": "Customer full name and phone number are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        customer_id = data.get('customer_id', '').strip() or Customer.generate_next_id()
        
        # Check uniqueness
        if Customer.objects(customer_id=customer_id).first():
            customer_id = Customer.generate_next_id()

        customer = Customer(
            customer_id=customer_id,
            full_name=full_name,
            phone=phone,
            email=data.get('email', '').strip(),
            address=data.get('address', '').strip(),
            gender=data.get('gender', 'Female'),
            notes=data.get('notes', '').strip()
        )
        customer.save()
        return Response(customer.to_dict(include_stats=True), status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def customer_detail(request, customer_id):
    customer = Customer.objects(customer_id=customer_id).first()
    if not customer:
        return Response({"error": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = customer.to_dict(include_stats=True)
        # Fetch order history
        orders = [o.to_dict() for o in Order.objects(customer_id=customer_id).order_by('-order_date')]
        # Fetch measurement profiles
        profiles = [p.to_dict() for p in GarmentProfile.objects(customer_id=customer_id).order_by('-created_at')]
        data["orders"] = orders
        data["measurement_profiles_list"] = profiles
        return Response(data)

    elif request.method == 'PUT':
        data = request.data
        customer.full_name = data.get('full_name', customer.full_name).strip()
        customer.phone = data.get('phone', customer.phone).strip()
        customer.email = data.get('email', customer.email).strip()
        customer.address = data.get('address', customer.address).strip()
        customer.gender = data.get('gender', customer.gender)
        customer.notes = data.get('notes', customer.notes).strip()
        customer.updated_at = datetime.datetime.utcnow()
        customer.save()
        return Response(customer.to_dict(include_stats=True))

    elif request.method == 'DELETE':
        customer.delete()
        return Response({"message": f"Customer {customer_id} deleted successfully."})


# =============================================================
# Dynamic Measurement Management (Garment Profiles)
# =============================================================
@api_view(['GET', 'POST'])
def garment_profile_list_create(request):
    if request.method == 'GET':
        customer_id = request.GET.get('customer_id', '').strip()
        garment_type = request.GET.get('garment_type', '').strip()

        profiles = GarmentProfile.objects.order_by('-updated_at')
        if customer_id:
            profiles = profiles.filter(customer_id=customer_id)
        if garment_type:
            profiles = profiles.filter(garment_type=garment_type)

        return Response([p.to_dict() for p in profiles])

    elif request.method == 'POST':
        data = request.data
        customer_id = data.get('customer_id', '').strip()
        customer_name = data.get('customer_name', '').strip()
        garment_type = data.get('garment_type', '').strip()

        if not customer_id or not garment_type:
            return Response(
                {"error": "Customer ID and Garment Type are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lookup customer name if omitted
        if not customer_name:
            cust = Customer.objects(customer_id=customer_id).first()
            if cust:
                customer_name = cust.full_name

        profile_id = data.get('profile_id', '').strip() or GarmentProfile.generate_next_id()
        if GarmentProfile.objects(profile_id=profile_id).first():
            profile_id = GarmentProfile.generate_next_id()

        profile = GarmentProfile(
            profile_id=profile_id,
            customer_id=customer_id,
            customer_name=customer_name or "Valued Customer",
            garment_type=garment_type,
            profile_name=data.get('profile_name', '').strip() or f"{garment_type} Measurement",
            unit=data.get('unit', 'inches'),
            measurements=data.get('measurements', {}),
            custom_fields=data.get('custom_fields', []),
            neck_design=data.get('neck_design', '').strip(),
            sleeve_style=data.get('sleeve_style', '').strip(),
            notes=data.get('notes', '').strip()
        )
        profile.save()
        return Response(profile.to_dict(), status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def garment_profile_detail(request, profile_id):
    profile = GarmentProfile.objects(profile_id=profile_id).first()
    if not profile:
        return Response({"error": "Garment profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(profile.to_dict())

    elif request.method == 'PUT':
        data = request.data
        profile.profile_name = data.get('profile_name', profile.profile_name)
        profile.unit = data.get('unit', profile.unit)
        profile.measurements = data.get('measurements', profile.measurements)
        profile.custom_fields = data.get('custom_fields', profile.custom_fields)
        profile.neck_design = data.get('neck_design', profile.neck_design)
        profile.sleeve_style = data.get('sleeve_style', profile.sleeve_style)
        profile.notes = data.get('notes', profile.notes)
        profile.updated_at = datetime.datetime.utcnow()
        profile.save()
        return Response(profile.to_dict())

    elif request.method == 'DELETE':
        profile.delete()
        return Response({"message": f"Garment profile {profile_id} deleted successfully."})


# =============================================================
# Order Management Views
# =============================================================
@api_view(['GET', 'POST'])
def order_list_create(request):
    if request.method == 'GET':
        orders = Order.objects.order_by('-order_date')
        status_filter = request.GET.get('status', '').strip()
        customer_id = request.GET.get('customer_id', '').strip()
        priority = request.GET.get('priority', '').strip()
        search = request.GET.get('q', '').strip()

        if status_filter:
            orders = orders.filter(status=status_filter)
        if customer_id:
            orders = orders.filter(customer_id=customer_id)
        if priority:
            orders = orders.filter(priority=priority)
        if search:
            orders = orders.filter(
                __raw__={
                    '$or': [
                        {'order_id': {'$regex': search, '$options': 'i'}},
                        {'customer_name': {'$regex': search, '$options': 'i'}},
                        {'customer_phone': {'$regex': search, '$options': 'i'}},
                        {'garment_type': {'$regex': search, '$options': 'i'}}
                    ]
                }
            )

        return Response([o.to_dict() for o in orders])

    elif request.method == 'POST':
        data = request.data
        customer_id = data.get('customer_id', '').strip()
        garment_type = data.get('garment_type', '').strip()
        delivery_date_str = data.get('delivery_date', '').strip()

        if not customer_id or not garment_type or not delivery_date_str:
            return Response(
                {"error": "Customer ID, Garment Type, and Delivery Date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lookup customer info
        cust = Customer.objects(customer_id=customer_id).first()
        customer_name = data.get('customer_name', '').strip() or (cust.full_name if cust else "Valued Customer")
        customer_phone = data.get('customer_phone', '').strip() or (cust.phone if cust else "")

        # Parse delivery date
        try:
            delivery_date = datetime.datetime.strptime(delivery_date_str, "%Y-%m-%d")
        except ValueError:
            delivery_date = datetime.datetime.utcnow() + datetime.timedelta(days=7)

        # Parse fitting date
        fitting_date = None
        fitting_date_str = data.get('fitting_date', '').strip()
        if fitting_date_str:
            try:
                fitting_date = datetime.datetime.strptime(fitting_date_str, "%Y-%m-%d")
            except ValueError:
                fitting_date = None

        order_id = data.get('order_id', '').strip() or Order.generate_next_id()
        if Order.objects(order_id=order_id).first():
            order_id = Order.generate_next_id()

        total_amount = float(data.get('total_amount', 0.0) or 0.0)
        advance_payment = float(data.get('advance_payment', 0.0) or 0.0)
        order_status_val = data.get('status', 'Order Received')

        order = Order(
            order_id=order_id,
            customer_id=customer_id,
            customer_name=customer_name,
            customer_phone=customer_phone,
            garment_type=garment_type,
            garment_profile_id=data.get('garment_profile_id', '').strip(),
            measurements=data.get('measurements', {}),
            measurement_unit=data.get('measurement_unit', 'inches'),
            fabric_details=data.get('fabric_details', {}),
            stitching_instructions=data.get('stitching_instructions', '').strip(),
            order_date=datetime.datetime.utcnow(),
            fitting_date=fitting_date,
            delivery_date=delivery_date,
            total_amount=total_amount,
            advance_payment=advance_payment,
            status=order_status_val,
            priority=data.get('priority', 'Normal'),
            status_history=[{
                "status": order_status_val,
                "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
                "notes": "Order created in system",
                "updated_by": "Staff"
            }]
        )
        order.save()

        # Automatically create or sync a DeliveryDate document
        delivery = DeliveryDate(
            delivery_id=DeliveryDate.generate_next_id(),
            order_id=order.order_id,
            customer_id=order.customer_id,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            garment_type=order.garment_type,
            scheduled_date=order.delivery_date,
            status="Scheduled",
            delivery_type=data.get('delivery_type', 'Store Pickup'),
            notes=f"Order {order.order_id} delivery record"
        )
        delivery.save()

        return Response(order.to_dict(), status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def order_detail(request, order_id):
    order = Order.objects(order_id=order_id).first()
    if not order:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = order.to_dict()
        # Include associated fitting notes
        fitting_notes = [f.to_dict() for f in FittingNote.objects(order_id=order_id).order_by('-fitting_date')]
        data["fitting_notes"] = fitting_notes
        return Response(data)

    elif request.method == 'PUT':
        data = request.data
        old_status = order.status
        new_status = data.get('status', old_status)

        order.garment_type = data.get('garment_type', order.garment_type)
        order.measurements = data.get('measurements', order.measurements)
        order.measurement_unit = data.get('measurement_unit', order.measurement_unit)
        order.fabric_details = data.get('fabric_details', order.fabric_details)
        order.stitching_instructions = data.get('stitching_instructions', order.stitching_instructions)
        order.priority = data.get('priority', order.priority)
        order.total_amount = float(data.get('total_amount', order.total_amount) or 0.0)
        order.advance_payment = float(data.get('advance_payment', order.advance_payment) or 0.0)

        # Update dates if provided
        if data.get('delivery_date'):
            try:
                order.delivery_date = datetime.datetime.strptime(data['delivery_date'], "%Y-%m-%d")
            except ValueError:
                pass
        if data.get('fitting_date'):
            try:
                order.fitting_date = datetime.datetime.strptime(data['fitting_date'], "%Y-%m-%d")
            except ValueError:
                pass

        if new_status != old_status:
            order.status = new_status
            history = order.status_history or []
            history.append({
                "status": new_status,
                "date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                "notes": data.get('status_notes', f"Status updated to {new_status}"),
                "updated_by": "Staff"
            })
            order.status_history = history

            # Sync delivery status
            delivery = DeliveryDate.objects(order_id=order_id).first()
            if delivery:
                if new_status == 'Delivered':
                    delivery.status = 'Delivered'
                    delivery.actual_delivery_date = datetime.datetime.utcnow()
                elif new_status == 'Completed':
                    delivery.status = 'Ready for Pickup'
                delivery.save()

        order.save()
        return Response(order.to_dict())

    elif request.method == 'DELETE':
        FittingNote.objects(order_id=order_id).delete()
        DeliveryDate.objects(order_id=order_id).delete()
        order.delete()
        return Response({"message": f"Order {order_id} deleted successfully."})


@api_view(['POST'])
def update_order_status(request, order_id):
    order = Order.objects(order_id=order_id).first()
    if not order:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status', '').strip()
    notes = request.data.get('notes', f"Status updated to {new_status}").strip()

    if new_status not in Order.STATUS_CHOICES:
        return Response({"error": f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    history = order.status_history or []
    history.append({
        "status": new_status,
        "date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "notes": notes,
        "updated_by": request.data.get('updated_by', 'Master Tailor')
    })
    order.status_history = history

    if new_status == 'Delivered':
        # Mark delivery record delivered
        delivery = DeliveryDate.objects(order_id=order_id).first()
        if delivery:
            delivery.status = 'Delivered'
            delivery.actual_delivery_date = datetime.datetime.utcnow()
            delivery.save()
    elif new_status == 'Completed':
        delivery = DeliveryDate.objects(order_id=order_id).first()
        if delivery:
            delivery.status = 'Ready for Pickup'
            delivery.save()

    order.save()
    return Response(order.to_dict())


@api_view(['GET'])
def order_pdf_invoice(request, order_id):
    order = Order.objects(order_id=order_id).first()
    if not order:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    pdf_bytes = generate_order_invoice_pdf(order)
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="{order_id}_invoice.pdf"'
    return response


# =============================================================
# Fitting Notes Management Views
# =============================================================
@api_view(['GET', 'POST'])
def fitting_note_list_create(request):
    if request.method == 'GET':
        order_id = request.GET.get('order_id', '').strip()
        customer_id = request.GET.get('customer_id', '').strip()
        notes = FittingNote.objects.order_by('-fitting_date')

        if order_id:
            notes = notes.filter(order_id=order_id)
        if customer_id:
            notes = notes.filter(customer_id=customer_id)

        return Response([n.to_dict() for n in notes])

    elif request.method == 'POST':
        data = request.data
        order_id = data.get('order_id', '').strip()
        alteration_details = data.get('alteration_details', '').strip()

        if not order_id or not alteration_details:
            return Response(
                {"error": "Order ID and alteration details are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects(order_id=order_id).first()
        customer_id = data.get('customer_id', '').strip() or (order.customer_id if order else "")
        customer_name = data.get('customer_name', '').strip() or (order.customer_name if order else "Customer")
        garment_type = data.get('garment_type', '').strip() or (order.garment_type if order else "")

        note = FittingNote(
            note_id=FittingNote.generate_next_id(),
            order_id=order_id,
            customer_id=customer_id,
            customer_name=customer_name,
            garment_type=garment_type,
            fitting_date=datetime.datetime.utcnow(),
            trial_stage=data.get('trial_stage', 'First Trial'),
            trial_status=data.get('trial_status', 'Minor Alteration'),
            alteration_details=alteration_details,
            tailor_notes=data.get('tailor_notes', '').strip(),
            customer_feedback=data.get('customer_feedback', '').strip(),
            resolved=bool(data.get('resolved', False))
        )
        note.save()

        # If note indicates alteration required, automatically update order status
        if order and data.get('trial_status') in ['Minor Alteration', 'Major Alteration']:
            order.status = 'Alteration Required'
            history = order.status_history or []
            history.append({
                "status": "Alteration Required",
                "date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                "notes": f"Trial fitting note: {alteration_details[:80]}",
                "updated_by": "Trial Master"
            })
            order.status_history = history
            order.save()

        return Response(note.to_dict(), status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def fitting_note_detail(request, note_id):
    note = FittingNote.objects(note_id=note_id).first()
    if not note:
        return Response({"error": "Fitting note not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(note.to_dict())

    elif request.method == 'PUT':
        data = request.data
        note.trial_stage = data.get('trial_stage', note.trial_stage)
        note.trial_status = data.get('trial_status', note.trial_status)
        note.alteration_details = data.get('alteration_details', note.alteration_details)
        note.tailor_notes = data.get('tailor_notes', note.tailor_notes)
        note.customer_feedback = data.get('customer_feedback', note.customer_feedback)
        if 'resolved' in data:
            note.resolved = bool(data['resolved'])
        note.save()
        return Response(note.to_dict())

    elif request.method == 'DELETE':
        note.delete()
        return Response({"message": f"Fitting note {note_id} deleted successfully."})


# =============================================================
# Delivery Management Views
# =============================================================
@api_view(['GET', 'POST'])
def delivery_list_create(request):
    if request.method == 'GET':
        now = datetime.datetime.utcnow()
        deliveries = DeliveryDate.objects.order_by('scheduled_date')
        status_filter = request.GET.get('status', '').strip()
        filter_type = request.GET.get('filter', '').strip() # 'upcoming', 'overdue', 'today'

        if filter_type == 'overdue':
            deliveries = deliveries.filter(scheduled_date__lt=now, status__ne='Delivered')
        elif filter_type == 'upcoming':
            deliveries = deliveries.filter(scheduled_date__gte=now, status__ne='Delivered')
        elif filter_type == 'today':
            today_start = datetime.datetime(now.year, now.month, now.day)
            today_end = today_start + datetime.timedelta(days=1)
            deliveries = deliveries.filter(scheduled_date__gte=today_start, scheduled_date__lt=today_end)
        elif status_filter:
            deliveries = deliveries.filter(status=status_filter)

        return Response([d.to_dict() for d in deliveries])

    elif request.method == 'POST':
        data = request.data
        order_id = data.get('order_id', '').strip()
        scheduled_date_str = data.get('scheduled_date', '').strip()

        if not order_id or not scheduled_date_str:
            return Response(
                {"error": "Order ID and scheduled date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects(order_id=order_id).first()
        try:
            scheduled_date = datetime.datetime.strptime(scheduled_date_str, "%Y-%m-%d")
        except ValueError:
            scheduled_date = datetime.datetime.utcnow() + datetime.timedelta(days=7)

        delivery = DeliveryDate(
            delivery_id=DeliveryDate.generate_next_id(),
            order_id=order_id,
            customer_id=order.customer_id if order else data.get('customer_id', ''),
            customer_name=order.customer_name if order else data.get('customer_name', ''),
            customer_phone=order.customer_phone if order else data.get('customer_phone', ''),
            garment_type=order.garment_type if order else data.get('garment_type', ''),
            scheduled_date=scheduled_date,
            status=data.get('status', 'Scheduled'),
            delivery_type=data.get('delivery_type', 'Store Pickup'),
            notes=data.get('notes', '').strip()
        )
        delivery.save()
        return Response(delivery.to_dict(), status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_delivery_status(request, delivery_id):
    delivery = DeliveryDate.objects(delivery_id=delivery_id).first()
    if not delivery:
        return Response({"error": "Delivery record not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status', delivery.status)
    delivery.status = new_status
    if new_status == 'Delivered':
        delivery.actual_delivery_date = datetime.datetime.utcnow()
        # Also sync order status to Delivered
        order = Order.objects(order_id=delivery.order_id).first()
        if order and order.status != 'Delivered':
            order.status = 'Delivered'
            history = order.status_history or []
            history.append({
                "status": "Delivered",
                "date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                "notes": "Delivered to customer via delivery manager",
                "updated_by": "Staff"
            })
            order.status_history = history
            order.save()

    if request.data.get('scheduled_date'):
        try:
            delivery.scheduled_date = datetime.datetime.strptime(request.data['scheduled_date'], "%Y-%m-%d")
        except ValueError:
            pass

    delivery.notes = request.data.get('notes', delivery.notes)
    delivery.save()
    return Response(delivery.to_dict())


# =============================================================
# Reports Views (with PDF & Print Export)
# =============================================================
@api_view(['GET'])
def reports_data(request):
    report_type = request.GET.get('type', 'all').strip()
    now = datetime.datetime.utcnow()

    # Base query sets
    customers = [c.to_dict(include_stats=True) for c in Customer.objects.order_by('-registration_date')]
    all_orders = [o.to_dict() for o in Order.objects.order_by('-order_date')]
    pending_orders = [o for o in all_orders if o['status'] in ['Order Received', 'Measurement Taken', 'Stitching in Progress', 'Ready for Trial', 'Alteration Required']]
    completed_orders = [o for o in all_orders if o['status'] in ['Completed', 'Delivered']]
    deliveries = [d.to_dict() for d in DeliveryDate.objects.order_by('scheduled_date')]

    # Monthly revenue calculation
    monthly_rev = {}
    for o in all_orders:
        if o.get('order_date') and o.get('status') != 'Cancelled':
            month_key = o['order_date'][:7] # YYYY-MM
            monthly_rev[month_key] = monthly_rev.get(month_key, 0.0) + float(o.get('total_amount', 0.0))

    monthly_revenue_list = [
        {"month": k, "revenue": round(v, 2)}
        for k, v in sorted(monthly_rev.items())
    ]

    total_revenue = sum(float(o.get('total_amount', 0.0)) for o in all_orders if o.get('status') != 'Cancelled')
    total_balance = sum(float(o.get('balance_payment', 0.0)) for o in all_orders if o.get('status') not in ['Delivered', 'Cancelled'])

    return Response({
        "summary": {
            "total_customers": len(customers),
            "total_orders": len(all_orders),
            "pending_orders": len(pending_orders),
            "completed_orders": len(completed_orders),
            "total_revenue": round(total_revenue, 2),
            "total_balance_due": round(total_balance, 2)
        },
        "customers": customers,
        "orders": all_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "deliveries": deliveries,
        "monthly_revenue": monthly_revenue_list
    })


@api_view(['GET'])
def download_summary_report_pdf(request):
    all_orders = [o.to_dict() for o in Order.objects.order_by('-order_date')]
    total_rev = sum(float(o.get('total_amount', 0.0)) for o in all_orders if o.get('status') != 'Cancelled')
    total_bal = sum(float(o.get('balance_payment', 0.0)) for o in all_orders if o.get('status') not in ['Delivered', 'Cancelled'])
    
    now = datetime.datetime.utcnow()
    overdue_cnt = Order.objects(delivery_date__lt=now, status__nin=['Delivered', 'Cancelled']).count()
    upcoming_cnt = Order.objects(delivery_date__gte=now, delivery_date__lte=now + datetime.timedelta(days=7), status__nin=['Delivered', 'Cancelled']).count()

    stats = {
        "total_customers": Customer.objects.count(),
        "total_orders": len(all_orders),
        "pending_orders": Order.objects(status__in=['Order Received', 'Measurement Taken']).count(),
        "in_progress_orders": Order.objects(status__in=['Stitching in Progress', 'Ready for Trial', 'Alteration Required']).count(),
        "completed_orders": Order.objects(status='Completed').count(),
        "delivered_orders": Order.objects(status='Delivered').count(),
        "upcoming_deliveries": upcoming_cnt,
        "overdue_deliveries": overdue_cnt,
        "total_revenue": total_rev,
        "total_balance_due": total_bal
    }

    report_payload = {
        "stats": stats,
        "recent_orders": all_orders[:15]
    }

    pdf_bytes = generate_business_summary_pdf(report_payload)
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="Boutique_Business_Report.pdf"'
    return response
