import datetime
from mongoengine import (
    Document, StringField, DateTimeField, FloatField, BooleanField,
    DictField, ListField, EmailField, IntField
)
from django.contrib.auth.hashers import make_password, check_password

# -------------------------------------------------------------
# 1. AdminUser Collection
# -------------------------------------------------------------
class AdminUser(Document):
    meta = {
        'collection': 'admin_users',
        'indexes': ['username', 'email']
    }

    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    full_name = StringField(default="Master Tailor Admin")
    role = StringField(default="Admin", choices=['Admin', 'Master Tailor', 'Staff'])
    is_active = BooleanField(default=True)
    last_login = DateTimeField()
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# -------------------------------------------------------------
# 2. Customer Collection
# -------------------------------------------------------------
class Customer(Document):
    meta = {
        'collection': 'customers',
        'indexes': ['customer_id', 'phone', 'full_name']
    }

    customer_id = StringField(required=True, unique=True)
    full_name = StringField(required=True, max_length=150)
    phone = StringField(required=True, max_length=25)
    email = StringField(default="", max_length=150)
    address = StringField(default="")
    gender = StringField(default="Female")
    notes = StringField(default="")
    registration_date = DateTimeField(default=datetime.datetime.utcnow)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def generate_next_id(cls):
        try:
            count = cls.objects.count()
            return f"CUST-{1001 + count}"
        except Exception:
            return f"CUST-{datetime.datetime.now().strftime('%y%m%d%H%M')}"

    def to_dict(self, include_stats=False):
        data = {
            "id": str(self.id),
            "customer_id": self.customer_id,
            "full_name": self.full_name,
            "phone": self.phone,
            "email": self.email or "",
            "address": self.address or "",
            "gender": self.gender,
            "notes": self.notes or "",
            "registration_date": self.registration_date.strftime("%Y-%m-%d") if self.registration_date else "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_stats:
            try:
                data["total_orders"] = Order.objects(customer_id=self.customer_id).count()
                data["measurement_profiles"] = GarmentProfile.objects(customer_id=self.customer_id).count()
            except Exception:
                data["total_orders"] = 0
                data["measurement_profiles"] = 0
        return data


# -------------------------------------------------------------
# 3. GarmentProfile Collection (Dynamic Measurement Storage)
# -------------------------------------------------------------
class GarmentProfile(Document):
    meta = {
        'collection': 'garment_profiles',
        'indexes': ['profile_id', 'customer_id', 'garment_type']
    }

    profile_id = StringField(required=True, unique=True)
    customer_id = StringField(required=True)
    customer_name = StringField(required=True)
    garment_type = StringField(required=True)  # Saree Blouse, Chudidar, Kurti, Gown, Lehenga, Salwar Suit, Custom Garment
    profile_name = StringField(default="")    # e.g., "Festive Brocade Blouse"
    unit = StringField(default="inches", choices=['inches', 'cm'])
    measurements = DictField(default=dict)    # Flexible key-value pairs
    custom_fields = ListField(DictField(), default=list) # [{key, label, value, unit}]
    neck_design = StringField(default="")
    sleeve_style = StringField(default="")
    notes = StringField(default="")
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def generate_next_id(cls):
        try:
            count = cls.objects.count()
            return f"GMP-{1001 + count}"
        except Exception:
            return f"GMP-{datetime.datetime.now().strftime('%y%m%d%H%M')}"

    def to_dict(self):
        return {
            "id": str(self.id),
            "profile_id": self.profile_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "garment_type": self.garment_type,
            "profile_name": self.profile_name or f"{self.garment_type} Measurement",
            "unit": self.unit,
            "measurements": self.measurements or {},
            "custom_fields": self.custom_fields or [],
            "neck_design": self.neck_design or "",
            "sleeve_style": self.sleeve_style or "",
            "notes": self.notes or "",
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else "",
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M") if self.updated_at else "",
        }


# -------------------------------------------------------------
# 4. Order Collection
# -------------------------------------------------------------
class Order(Document):
    meta = {
        'collection': 'orders',
        'indexes': ['order_id', 'customer_id', 'status', 'delivery_date']
    }

    STATUS_CHOICES = [
        'Order Received',
        'Measurement Taken',
        'Stitching in Progress',
        'Ready for Trial',
        'Alteration Required',
        'Completed',
        'Delivered',
        'Cancelled'
    ]

    order_id = StringField(required=True, unique=True)
    customer_id = StringField(required=True)
    customer_name = StringField(required=True)
    customer_phone = StringField(required=True)
    garment_type = StringField(required=True)
    garment_profile_id = StringField(default="")
    measurements = DictField(default=dict)
    measurement_unit = StringField(default="inches")
    
    # Fabric details
    fabric_details = DictField(default=dict)  # {fabric_type, color, source, lining, notes}
    stitching_instructions = StringField(default="")
    
    # Dates
    order_date = DateTimeField(default=datetime.datetime.utcnow)
    fitting_date = DateTimeField(null=True)
    delivery_date = DateTimeField(required=True)
    
    # Financials
    total_amount = FloatField(default=0.0)
    advance_payment = FloatField(default=0.0)
    balance_payment = FloatField(default=0.0)
    
    # Status & Progress
    status = StringField(default="Order Received", choices=STATUS_CHOICES)
    priority = StringField(default="Normal", choices=['Normal', 'Urgent', 'Bridal', 'Express'])
    status_history = ListField(DictField(), default=list) # [{status, date, notes, updated_by}]
    
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def generate_next_id(cls):
        try:
            year = datetime.datetime.now().year
            count = cls.objects.count()
            return f"ORD-{year}-{1001 + count}"
        except Exception:
            return f"ORD-{datetime.datetime.now().strftime('%Y%m%d%H%M')}"

    def save(self, *args, **kwargs):
        # Auto calculate balance
        self.balance_payment = round(max(0.0, float(self.total_amount or 0.0) - float(self.advance_payment or 0.0)), 2)
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    def to_dict(self):
        now = datetime.datetime.utcnow()
        is_overdue = False
        if self.delivery_date and self.status not in ['Delivered', 'Cancelled']:
            is_overdue = self.delivery_date < now

        return {
            "id": str(self.id),
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "customer_phone": self.customer_phone,
            "garment_type": self.garment_type,
            "garment_profile_id": self.garment_profile_id or "",
            "measurements": self.measurements or {},
            "measurement_unit": self.measurement_unit or "inches",
            "fabric_details": self.fabric_details or {},
            "stitching_instructions": self.stitching_instructions or "",
            "order_date": self.order_date.strftime("%Y-%m-%d") if self.order_date else "",
            "fitting_date": self.fitting_date.strftime("%Y-%m-%d") if self.fitting_date else "",
            "delivery_date": self.delivery_date.strftime("%Y-%m-%d") if self.delivery_date else "",
            "total_amount": float(self.total_amount or 0.0),
            "advance_payment": float(self.advance_payment or 0.0),
            "balance_payment": float(self.balance_payment or 0.0),
            "status": self.status,
            "priority": self.priority or "Normal",
            "status_history": self.status_history or [],
            "is_overdue": is_overdue,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# -------------------------------------------------------------
# 5. FittingNote Collection
# -------------------------------------------------------------
class FittingNote(Document):
    meta = {
        'collection': 'fitting_notes',
        'indexes': ['note_id', 'order_id', 'customer_id']
    }

    note_id = StringField(required=True, unique=True)
    order_id = StringField(required=True)
    customer_id = StringField(required=True)
    customer_name = StringField(required=True)
    garment_type = StringField(default="")
    fitting_date = DateTimeField(default=datetime.datetime.utcnow)
    trial_stage = StringField(default="First Trial", choices=['First Trial', 'Second Trial', 'Final Fitting', 'Post-Delivery'])
    trial_status = StringField(default="Minor Alteration", choices=['Perfect Fit', 'Minor Alteration', 'Major Alteration', 'Approved'])
    alteration_details = StringField(required=True)
    tailor_notes = StringField(default="")
    customer_feedback = StringField(default="")
    resolved = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def generate_next_id(cls):
        try:
            count = cls.objects.count()
            return f"FIT-{1001 + count}"
        except Exception:
            return f"FIT-{datetime.datetime.now().strftime('%y%m%d%H%M')}"

    def to_dict(self):
        return {
            "id": str(self.id),
            "note_id": self.note_id,
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "garment_type": self.garment_type or "",
            "fitting_date": self.fitting_date.strftime("%Y-%m-%d") if self.fitting_date else "",
            "trial_stage": self.trial_stage or "First Trial",
            "trial_status": self.trial_status or "Minor Alteration",
            "alteration_details": self.alteration_details or "",
            "tailor_notes": self.tailor_notes or "",
            "customer_feedback": self.customer_feedback or "",
            "resolved": bool(self.resolved),
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else ""
        }


# -------------------------------------------------------------
# 6. DeliveryDate Collection
# -------------------------------------------------------------
class DeliveryDate(Document):
    meta = {
        'collection': 'delivery_dates',
        'indexes': ['delivery_id', 'order_id', 'scheduled_date', 'status']
    }

    delivery_id = StringField(required=True, unique=True)
    order_id = StringField(required=True)
    customer_id = StringField(required=True)
    customer_name = StringField(required=True)
    customer_phone = StringField(default="")
    garment_type = StringField(default="")
    scheduled_date = DateTimeField(required=True)
    actual_delivery_date = DateTimeField(null=True)
    status = StringField(default="Scheduled", choices=['Scheduled', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Delayed', 'Overdue'])
    delivery_type = StringField(default="Store Pickup", choices=['Store Pickup', 'Courier / Home Delivery'])
    notes = StringField(default="")
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    @classmethod
    def generate_next_id(cls):
        try:
            count = cls.objects.count()
            return f"DEL-{1001 + count}"
        except Exception:
            return f"DEL-{datetime.datetime.now().strftime('%y%m%d%H%M')}"

    def to_dict(self):
        now = datetime.datetime.utcnow()
        is_overdue = False
        if self.scheduled_date and self.status not in ['Delivered']:
            is_overdue = self.scheduled_date < now

        return {
            "id": str(self.id),
            "delivery_id": self.delivery_id,
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "customer_phone": self.customer_phone or "",
            "garment_type": self.garment_type or "",
            "scheduled_date": self.scheduled_date.strftime("%Y-%m-%d") if self.scheduled_date else "",
            "actual_delivery_date": self.actual_delivery_date.strftime("%Y-%m-%d") if self.actual_delivery_date else "",
            "status": "Overdue" if is_overdue and self.status != "Delivered" else self.status,
            "delivery_type": self.delivery_type or "Store Pickup",
            "notes": self.notes or "",
            "is_overdue": is_overdue,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else ""
        }
