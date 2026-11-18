import datetime
import os
from .models import AdminUser, Customer, GarmentProfile, Order, FittingNote, DeliveryDate

def seed_boutique_data(force=False):
    """
    Populates sample data if the collections are empty or if force=True.
    """
    admin_count = AdminUser.objects.count()
    if admin_count > 0 and not force:
        return {"status": "already_seeded", "message": "Database already contains data."}

    now = datetime.datetime.utcnow()

    # 1. Seed Admin
    username = os.getenv("ADMIN_USERNAME", "admin")
    email = os.getenv("ADMIN_EMAIL", "admin@tailorboutique.com")
    password = os.getenv("ADMIN_PASSWORD", "admin123")

    admin = AdminUser.objects(username=username).first()
    if not admin:
        admin = AdminUser(
            username=username,
            email=email,
            full_name="Master Tailor Admin",
            role="Admin"
        )
        admin.set_password(password)
        admin.save()

    # If customers exist and not forcing, return
    if Customer.objects.count() > 0 and not force:
        return {"status": "success", "message": "Admin verified, customers already present."}

    # 2. Seed Customers
    customers_data = [
        {
            "customer_id": "CUST-1001",
            "full_name": "Ananya Sharma",
            "phone": "9876543210",
            "email": "ananya.sharma@example.com",
            "address": "402, Lotus Enclave, Linking Road, Bandra West, Mumbai",
            "gender": "Female",
            "notes": "Prefers premium silk lining, deep back necks, and 2-inch inner seam margin.",
            "registration_date": now - datetime.timedelta(days=45)
        },
        {
            "customer_id": "CUST-1002",
            "full_name": "Priya Patel",
            "phone": "9823456781",
            "email": "priya.patel@example.com",
            "address": "12, Shanti Heights, Bodakdev, Ahmedabad",
            "gender": "Female",
            "notes": "Regular customer for festive lehengas and wedding chudidar suits.",
            "registration_date": now - datetime.timedelta(days=30)
        },
        {
            "customer_id": "CUST-1003",
            "full_name": "Deepika Iyer",
            "phone": "9711223344",
            "email": "deepika.iyer@example.com",
            "address": "78, 4th Cross, Indiranagar, Bengaluru",
            "gender": "Female",
            "notes": "Prefers boat necks, elbow-length sleeves, and eco-friendly cotton lining.",
            "registration_date": now - datetime.timedelta(days=20)
        },
        {
            "customer_id": "CUST-1004",
            "full_name": "Radhika Kapoor",
            "phone": "9988776655",
            "email": "radhika.k@example.com",
            "address": "B-14, Greater Kailash 1, New Delhi",
            "gender": "Female",
            "notes": "Prefers designer gowns with padding and concealed side zippers.",
            "registration_date": now - datetime.timedelta(days=15)
        },
        {
            "customer_id": "CUST-1005",
            "full_name": "Meera Nambiar",
            "phone": "9845012345",
            "email": "meera.nambiar@example.com",
            "address": "25, Poes Garden, Alwarpet, Chennai",
            "gender": "Female",
            "notes": "Kasavu sarees and silk blouses specialist customer.",
            "registration_date": now - datetime.timedelta(days=8)
        }
    ]

    for c in customers_data:
        if not Customer.objects(customer_id=c["customer_id"]).first():
            Customer(**c).save()

    # 3. Seed Garment Profiles (Dynamic Measurement Storage)
    profiles_data = [
        {
            "profile_id": "GMP-1001",
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "garment_type": "Saree Blouse",
            "profile_name": "Bridal Kanjivaram Silk Blouse",
            "unit": "inches",
            "measurements": {
                "bust": 34.0,
                "waist": 28.0,
                "shoulder": 14.0,
                "blouse_length": 14.5,
                "sleeve_length": 10.5,
                "armhole": 16.0,
                "front_neck_depth": 6.5,
                "back_neck_depth": 9.0
            },
            "custom_fields": [
                {"key": "cross_back", "label": "Cross Back", "value": 13.5, "unit": "inches"},
                {"key": "apex_point", "label": "Shoulder to Apex", "value": 9.5, "unit": "inches"}
            ],
            "neck_design": "Sweetheart Front / Deep U Back with Tassels",
            "sleeve_style": "Elbow length with gold zari border",
            "notes": "Princess cut with double cups padding, back open with heavy dori."
        },
        {
            "profile_id": "GMP-1002",
            "customer_id": "CUST-1002",
            "customer_name": "Priya Patel",
            "garment_type": "Lehenga",
            "profile_name": "Sangeet Velvet Lehenga Set",
            "unit": "inches",
            "measurements": {
                "waist": 30.0,
                "hip": 40.0,
                "lehenga_length": 42.0,
                "waistband": 2.0,
                "blouse_bust": 35.0,
                "blouse_length": 15.0,
                "shoulder": 14.0,
                "sleeve_length": 11.0
            },
            "custom_fields": [
                {"key": "can_can_layers", "label": "Can-Can Net Layers", "value": 3, "unit": "layers"}
            ],
            "neck_design": "Scoop Neck",
            "sleeve_style": "Cap sleeves",
            "notes": "Full flare 16-kali skirt, double can-can attachment for volume."
        },
        {
            "profile_id": "GMP-1003",
            "customer_id": "CUST-1003",
            "customer_name": "Deepika Iyer",
            "garment_type": "Kurti",
            "profile_name": "Office Straight Fit Kurti",
            "unit": "inches",
            "measurements": {
                "bust": 36.0,
                "waist": 31.0,
                "hip": 39.0,
                "shoulder": 14.0,
                "kurti_length": 43.0,
                "sleeve_length": 16.5,
                "armhole": 16.5,
                "neck_depth": 6.0
            },
            "custom_fields": [
                {"key": "slit_opening", "label": "Side Slit Opening", "value": 21.0, "unit": "inches"}
            ],
            "neck_design": "Mandarin Collar with V-slit",
            "sleeve_style": "3/4th Sleeve with turn-up cuff",
            "notes": "Pure Chanderi silk fabric with soft mulmul lining."
        },
        {
            "profile_id": "GMP-1004",
            "customer_id": "CUST-1004",
            "customer_name": "Radhika Kapoor",
            "garment_type": "Gown",
            "profile_name": "Cocktail Georgette Gown",
            "unit": "inches",
            "measurements": {
                "bust": 35.0,
                "waist": 29.0,
                "hip": 38.0,
                "shoulder": 14.0,
                "gown_length": 56.5,
                "sleeve_length": 21.0,
                "neck_depth": 7.0
            },
            "custom_fields": [
                {"key": "trail_length", "label": "Back Trail Extension", "value": 8.0, "unit": "inches"}
            ],
            "neck_design": "Surplice V-Neck",
            "sleeve_style": "Sheer bishop sleeves with buttoned cuffs",
            "notes": "Built-in boning at waist bodice, cups size 34B."
        },
        {
            "profile_id": "GMP-1005",
            "customer_id": "CUST-1005",
            "customer_name": "Meera Nambiar",
            "garment_type": "Chudidar",
            "profile_name": "Traditional Onam Suit",
            "unit": "inches",
            "measurements": {
                "chest": 37.0,
                "waist": 31.0,
                "hip": 39.5,
                "shoulder": 14.5,
                "top_length": 40.0,
                "sleeve_length": 16.0,
                "pant_length": 43.0,
                "ankle": 9.5,
                "neck_depth": 6.5
            },
            "custom_fields": [],
            "neck_design": "Round with Gold Kasavu Piping",
            "sleeve_style": "Regular 3/4th",
            "notes": "Extra gathers at ankle for rich traditional look."
        }
    ]

    for p in profiles_data:
        if not GarmentProfile.objects(profile_id=p["profile_id"]).first():
            GarmentProfile(**p).save()

    # 4. Seed Orders across all workflow stages
    orders_data = [
        {
            "order_id": "ORD-2026-1001",
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "customer_phone": "9876543210",
            "garment_type": "Saree Blouse",
            "garment_profile_id": "GMP-1001",
            "measurements": profiles_data[0]["measurements"],
            "measurement_unit": "inches",
            "fabric_details": {
                "fabric_type": "Pure Kanjivaram Raw Silk",
                "color": "Royal Crimson Red & Gold Zari",
                "source": "Provided by Customer",
                "lining": "Pure Cotton Butter Crepe"
            },
            "stitching_instructions": "Princess cut with padding. Deep back with heavy latkan tassels. Hand embroidery around sleeve hem.",
            "order_date": now - datetime.timedelta(days=7),
            "fitting_date": now - datetime.timedelta(days=1),
            "delivery_date": now + datetime.timedelta(days=3),
            "total_amount": 2800.0,
            "advance_payment": 1500.0,
            "balance_payment": 1300.0,
            "status": "Stitching in Progress",
            "priority": "Bridal",
            "status_history": [
                {"status": "Order Received", "date": (now - datetime.timedelta(days=7)).strftime("%Y-%m-%d"), "notes": "Order placed with silk fabric"},
                {"status": "Measurement Taken", "date": (now - datetime.timedelta(days=6)).strftime("%Y-%m-%d"), "notes": "Measurements recorded and verified"},
                {"status": "Stitching in Progress", "date": (now - datetime.timedelta(days=3)).strftime("%Y-%m-%d"), "notes": "Hand embroidery in progress on sleeves"}
            ]
        },
        {
            "order_id": "ORD-2026-1002",
            "customer_id": "CUST-1004",
            "customer_name": "Radhika Kapoor",
            "customer_phone": "9988776655",
            "garment_type": "Gown",
            "garment_profile_id": "GMP-1004",
            "measurements": profiles_data[3]["measurements"],
            "measurement_unit": "inches",
            "fabric_details": {
                "fabric_type": "Emerald Green Heavy Georgette",
                "color": "Emerald Green",
                "source": "Sourced by Boutique",
                "lining": "Satin & Crepe Dual Layer"
            },
            "stitching_instructions": "Floor-length evening gown with bodice boning and flare. Sheer bishop sleeves.",
            "order_date": now - datetime.timedelta(days=10),
            "fitting_date": now,
            "delivery_date": now + datetime.timedelta(days=4),
            "total_amount": 5400.0,
            "advance_payment": 3000.0,
            "balance_payment": 2400.0,
            "status": "Ready for Trial",
            "priority": "Urgent",
            "status_history": [
                {"status": "Order Received", "date": (now - datetime.timedelta(days=10)).strftime("%Y-%m-%d"), "notes": "Fabric approved by client"},
                {"status": "Measurement Taken", "date": (now - datetime.timedelta(days=9)).strftime("%Y-%m-%d"), "notes": "Custom measurements recorded"},
                {"status": "Stitching in Progress", "date": (now - datetime.timedelta(days=5)).strftime("%Y-%m-%d"), "notes": "Bodice assembled"},
                {"status": "Ready for Trial", "date": now.strftime("%Y-%m-%d"), "notes": "Ready for first trial fitting"}
            ]
        },
        {
            "order_id": "ORD-2026-1003",
            "customer_id": "CUST-1002",
            "customer_name": "Priya Patel",
            "customer_phone": "9823456781",
            "garment_type": "Lehenga",
            "garment_profile_id": "GMP-1002",
            "measurements": profiles_data[1]["measurements"],
            "measurement_unit": "inches",
            "fabric_details": {
                "fabric_type": "Micro Velvet with Zardozi Work",
                "color": "Wine Burgundy",
                "source": "Customer Provided",
                "lining": "Triple Satin + Stiff Can-Can"
            },
            "stitching_instructions": "16-Kali skirt stitching with 3 layers of can-can. Blouse with sweetheart neck and concealed zip.",
            "order_date": now - datetime.timedelta(days=14),
            "fitting_date": now + datetime.timedelta(days=2),
            "delivery_date": now + datetime.timedelta(days=8),
            "total_amount": 9200.0,
            "advance_payment": 5000.0,
            "balance_payment": 4200.0,
            "status": "Order Received",
            "priority": "Bridal",
            "status_history": [
                {"status": "Order Received", "date": (now - datetime.timedelta(days=14)).strftime("%Y-%m-%d"), "notes": "Bridal order confirmed with advance payment"}
            ]
        },
        {
            "order_id": "ORD-2026-1004",
            "customer_id": "CUST-1003",
            "customer_name": "Deepika Iyer",
            "customer_phone": "9711223344",
            "garment_type": "Kurti",
            "garment_profile_id": "GMP-1003",
            "measurements": profiles_data[2]["measurements"],
            "measurement_unit": "inches",
            "fabric_details": {
                "fabric_type": "Pure Chanderi Silk",
                "color": "Mustard Yellow & Indigo print",
                "source": "Customer Provided",
                "lining": "Mulmul Cotton"
            },
            "stitching_instructions": "Straight kurti with side slits and potli button detailing along the front placket.",
            "order_date": now - datetime.timedelta(days=12),
            "fitting_date": now - datetime.timedelta(days=4),
            "delivery_date": now + datetime.timedelta(days=1),
            "total_amount": 1600.0,
            "advance_payment": 1600.0,
            "balance_payment": 0.0,
            "status": "Completed",
            "priority": "Normal",
            "status_history": [
                {"status": "Order Received", "date": (now - datetime.timedelta(days=12)).strftime("%Y-%m-%d"), "notes": "Order placed"},
                {"status": "Completed", "date": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d"), "notes": "Ironed, tagged, and packed"}
            ]
        },
        {
            "order_id": "ORD-2026-1005",
            "customer_id": "CUST-1005",
            "customer_name": "Meera Nambiar",
            "customer_phone": "9845012345",
            "garment_type": "Chudidar",
            "garment_profile_id": "GMP-1005",
            "measurements": profiles_data[4]["measurements"],
            "measurement_unit": "inches",
            "fabric_details": {
                "fabric_type": "Kerala Kasavu Cotton Silk",
                "color": "Off-White & Gold Zari",
                "source": "Customer Provided",
                "lining": "Cotton Voile"
            },
            "stitching_instructions": "Kameez with round neck and gold piping. Chudidar pant with extra gathers at ankle.",
            "order_date": now - datetime.timedelta(days=9),
            "fitting_date": now - datetime.timedelta(days=2),
            "delivery_date": now - datetime.timedelta(days=1), # OVERDUE delivery to demo highlight!
            "total_amount": 2600.0,
            "advance_payment": 1500.0,
            "balance_payment": 1100.0,
            "status": "Alteration Required",
            "priority": "Urgent",
            "status_history": [
                {"status": "Order Received", "date": (now - datetime.timedelta(days=9)).strftime("%Y-%m-%d"), "notes": "Order placed"},
                {"status": "Alteration Required", "date": (now - datetime.timedelta(days=2)).strftime("%Y-%m-%d"), "notes": "Hem length shortening requested"}
            ]
        },
        {
            "order_id": "ORD-2026-1006",
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "customer_phone": "9876543210",
            "garment_type": "Salwar Suit",
            "measurements": {
                "chest": 35.0,
                "waist": 29.0,
                "hip": 38.0,
                "shoulder": 14.0,
                "top_length": 38.0,
                "sleeve_length": 16.0,
                "salwar_length": 39.0
            },
            "measurement_unit": "inches",
            "fabric_details": {
                "fabric_type": "Tussar Silk with Floral Print",
                "color": "Pastel Peach",
                "source": "Sourced by Boutique",
                "lining": "Soft Crepe"
            },
            "stitching_instructions": "Patiala salwar suit with lace borders along dupatta and hem.",
            "order_date": now - datetime.timedelta(days=25),
            "fitting_date": now - datetime.timedelta(days=15),
            "delivery_date": now - datetime.timedelta(days=10),
            "total_amount": 3400.0,
            "advance_payment": 3400.0,
            "balance_payment": 0.0,
            "status": "Delivered",
            "priority": "Normal",
            "status_history": [
                {"status": "Order Received", "date": (now - datetime.timedelta(days=25)).strftime("%Y-%m-%d"), "notes": "Order accepted"},
                {"status": "Completed", "date": (now - datetime.timedelta(days=11)).strftime("%Y-%m-%d"), "notes": "Finished and checked"},
                {"status": "Delivered", "date": (now - datetime.timedelta(days=10)).strftime("%Y-%m-%d"), "notes": "Handed over to customer. Balance cleared."}
            ]
        }
    ]

    for o in orders_data:
        if not Order.objects(order_id=o["order_id"]).first():
            Order(**o).save()

    # 5. Seed Fitting Notes
    notes_data = [
        {
            "note_id": "FIT-1001",
            "order_id": "ORD-2026-1002",
            "customer_id": "CUST-1004",
            "customer_name": "Radhika Kapoor",
            "garment_type": "Gown",
            "fitting_date": now,
            "trial_stage": "First Trial",
            "trial_status": "Minor Alteration",
            "alteration_details": "Chest fit is spot on. Take in 0.5 inch at the high waist and release 0.25 inch at armhole curve.",
            "tailor_notes": "Pins placed at side seams. Hand stitching adjustment in progress.",
            "customer_feedback": "Customer loved the neckline and flare. Wants slight snugness at waist.",
            "resolved": False
        },
        {
            "note_id": "FIT-1002",
            "order_id": "ORD-2026-1005",
            "customer_id": "CUST-1005",
            "customer_name": "Meera Nambiar",
            "garment_type": "Chudidar",
            "fitting_date": now - datetime.timedelta(days=2),
            "trial_stage": "First Trial",
            "trial_status": "Minor Alteration",
            "alteration_details": "Pant length 1 inch too long. Fold and re-hem with hand finish.",
            "tailor_notes": "Altering today for urgent delivery.",
            "customer_feedback": "Color and neck finish are beautiful.",
            "resolved": False
        },
        {
            "note_id": "FIT-1003",
            "order_id": "ORD-2026-1001",
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "garment_type": "Saree Blouse",
            "fitting_date": now - datetime.timedelta(days=1),
            "trial_stage": "Final Fitting",
            "trial_status": "Approved",
            "alteration_details": "Perfect fit. Hook and eye line confirmed.",
            "tailor_notes": "Latkan tassels stitched to back dori.",
            "customer_feedback": "Extremely satisfied with the padded finish.",
            "resolved": True
        }
    ]

    for n in notes_data:
        if not FittingNote.objects(note_id=n["note_id"]).first():
            FittingNote(**n).save()

    # 6. Seed Delivery Dates
    deliveries_data = [
        {
            "delivery_id": "DEL-1001",
            "order_id": "ORD-2026-1005",
            "customer_id": "CUST-1005",
            "customer_name": "Meera Nambiar",
            "customer_phone": "9845012345",
            "garment_type": "Chudidar",
            "scheduled_date": now - datetime.timedelta(days=1), # OVERDUE!
            "actual_delivery_date": None,
            "status": "Overdue",
            "delivery_type": "Store Pickup",
            "notes": "Urgent reminder sent for alteration pickup."
        },
        {
            "delivery_id": "DEL-1002",
            "order_id": "ORD-2026-1004",
            "customer_id": "CUST-1003",
            "customer_name": "Deepika Iyer",
            "customer_phone": "9711223344",
            "garment_type": "Kurti",
            "scheduled_date": now + datetime.timedelta(days=1),
            "actual_delivery_date": None,
            "status": "Ready for Pickup",
            "delivery_type": "Store Pickup",
            "notes": "Garment pressed and bagged. WhatsApp notification sent."
        },
        {
            "delivery_id": "DEL-1003",
            "order_id": "ORD-2026-1001",
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "customer_phone": "9876543210",
            "garment_type": "Saree Blouse",
            "scheduled_date": now + datetime.timedelta(days=3),
            "actual_delivery_date": None,
            "status": "Scheduled",
            "delivery_type": "Store Pickup",
            "notes": "Scheduled for Saturday evening boutique pickup."
        },
        {
            "delivery_id": "DEL-1004",
            "order_id": "ORD-2026-1002",
            "customer_id": "CUST-1004",
            "customer_name": "Radhika Kapoor",
            "customer_phone": "9988776655",
            "garment_type": "Gown",
            "scheduled_date": now + datetime.timedelta(days=4),
            "actual_delivery_date": None,
            "status": "Scheduled",
            "delivery_type": "Courier / Home Delivery",
            "notes": "Special garment box packing requested."
        },
        {
            "delivery_id": "DEL-1005",
            "order_id": "ORD-2026-1003",
            "customer_id": "CUST-1002",
            "customer_name": "Priya Patel",
            "customer_phone": "9823456781",
            "garment_type": "Lehenga",
            "scheduled_date": now + datetime.timedelta(days=8),
            "actual_delivery_date": None,
            "status": "Scheduled",
            "delivery_type": "Store Pickup",
            "notes": "Bridal trial scheduled 2 days prior to delivery."
        },
        {
            "delivery_id": "DEL-1006",
            "order_id": "ORD-2026-1006",
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "customer_phone": "9876543210",
            "garment_type": "Salwar Suit",
            "scheduled_date": now - datetime.timedelta(days=10),
            "actual_delivery_date": now - datetime.timedelta(days=10),
            "status": "Delivered",
            "delivery_type": "Store Pickup",
            "notes": "Collected in person. Fully paid."
        }
    ]

    for d in deliveries_data:
        if not DeliveryDate.objects(delivery_id=d["delivery_id"]).first():
            DeliveryDate(**d).save()

    return {"status": "success", "message": "Boutique database seeded with realistic sample records!"}
