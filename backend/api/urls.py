from django.urls import path
from . import views

urlpatterns = [
    # System & Database
    path('health/', views.health_check, name='health_check'),
    path('seed/', views.seed_database, name='seed_database'),

    # Admin Auth
    path('auth/login/', views.admin_login, name='admin_login'),
    path('auth/profile/', views.admin_profile, name='admin_profile'),

    # Garment Templates
    path('garment-templates/', views.get_garment_templates, name='garment_templates'),

    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),

    # Customers
    path('customers/', views.customer_list_create, name='customer_list_create'),
    path('customers/<str:customer_id>/', views.customer_detail, name='customer_detail'),

    # Dynamic Garment Profiles / Measurements
    path('garment-profiles/', views.garment_profile_list_create, name='garment_profile_list_create'),
    path('garment-profiles/<str:profile_id>/', views.garment_profile_detail, name='garment_profile_detail'),

    # Orders
    path('orders/', views.order_list_create, name='order_list_create'),
    path('orders/<str:order_id>/', views.order_detail, name='order_detail'),
    path('orders/<str:order_id>/status/', views.update_order_status, name='update_order_status'),
    path('orders/<str:order_id>/invoice-pdf/', views.order_pdf_invoice, name='order_pdf_invoice'),

    # Fitting Notes
    path('fitting-notes/', views.fitting_note_list_create, name='fitting_note_list_create'),
    path('fitting-notes/<str:note_id>/', views.fitting_note_detail, name='fitting_note_detail'),

    # Deliveries
    path('deliveries/', views.delivery_list_create, name='delivery_list_create'),
    path('deliveries/<str:delivery_id>/', views.update_delivery_status, name='update_delivery_status'),

    # Reports
    path('reports/', views.reports_data, name='reports_data'),
    path('reports/pdf/', views.download_summary_report_pdf, name='download_summary_report_pdf'),
]
