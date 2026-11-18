from django.test import TestCase, Client
import json

class BoutiqueAPITests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('database', data)

    def test_admin_login(self):
        response = self.client.post(
            '/api/auth/login/',
            data=json.dumps({'username': 'admin', 'password': 'admin123'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('token', data)
        self.assertIn('user', data)

    def test_garment_templates(self):
        response = self.client.get('/api/garment-templates/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('templates', data)
        self.assertIn('Saree Blouse', data['templates'])
        self.assertIn('Chudidar', data['templates'])
        self.assertIn('Kurti', data['templates'])
        self.assertIn('Gown', data['templates'])
        self.assertIn('Lehenga', data['templates'])
        self.assertIn('Salwar Suit', data['templates'])
        self.assertIn('Custom Garment', data['templates'])

    def test_dashboard_stats(self):
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('metrics', data)
        self.assertIn('charts', data)
        self.assertGreaterEqual(data['metrics']['total_customers'], 5)
        self.assertGreaterEqual(data['metrics']['total_orders'], 6)

    def test_customer_crud(self):
        # 1. Create customer
        new_cust = {
            "full_name": "Test Customer Tanya",
            "phone": "9998887771",
            "email": "tanya@test.com",
            "address": "123 Silk Board, Bangalore",
            "gender": "Female",
            "notes": "Wedding guest customer"
        }
        res_create = self.client.post('/api/customers/', data=json.dumps(new_cust), content_type='application/json')
        self.assertEqual(res_create.status_code, 201)
        created_data = res_create.json()
        cust_id = created_data['customer_id']
        self.assertTrue(cust_id.startswith('CUST-'))

        # 2. Search customer
        res_search = self.client.get(f'/api/customers/?q=Tanya')
        self.assertEqual(res_search.status_code, 200)
        self.assertTrue(len(res_search.json()) >= 1)

        # 3. Get customer detail
        res_detail = self.client.get(f'/api/customers/{cust_id}/')
        self.assertEqual(res_detail.status_code, 200)
        self.assertEqual(res_detail.json()['full_name'], 'Test Customer Tanya')

    def test_dynamic_measurement_profile(self):
        profile_data = {
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "garment_type": "Saree Blouse",
            "profile_name": "Test Royal Saree Blouse",
            "unit": "inches",
            "measurements": {
                "bust": 34.5,
                "waist": 28.5,
                "shoulder": 14.25,
                "blouse_length": 15.0,
                "sleeve_length": 11.0,
                "armhole": 16.5,
                "front_neck_depth": 7.0,
                "back_neck_depth": 9.5
            },
            "custom_fields": [
                {"key": "embroidery_border_width", "label": "Border Width", "value": 2.5, "unit": "inches"}
            ]
        }
        res = self.client.post('/api/garment-profiles/', data=json.dumps(profile_data), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['measurements']['bust'], 34.5)
        self.assertEqual(data['custom_fields'][0]['label'], 'Border Width')

    def test_order_creation_and_status(self):
        order_data = {
            "customer_id": "CUST-1001",
            "customer_name": "Ananya Sharma",
            "customer_phone": "9876543210",
            "garment_type": "Kurti",
            "delivery_date": "2026-12-01",
            "fitting_date": "2026-11-25",
            "total_amount": 2500.0,
            "advance_payment": 1000.0,
            "stitching_instructions": "Contrast piping and front slit",
            "measurements": {
                "bust": 34.0,
                "waist": 28.0,
                "kurti_length": 42.0
            }
        }
        res = self.client.post('/api/orders/', data=json.dumps(order_data), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        ord_data = res.json()
        order_id = ord_data['order_id']
        self.assertEqual(ord_data['balance_payment'], 1500.0)

        # Update status
        res_status = self.client.post(
            f'/api/orders/{order_id}/status/',
            data=json.dumps({'status': 'Stitching in Progress', 'notes': 'Pattern cut and sent to tailor'}),
            content_type='application/json'
        )
        self.assertEqual(res_status.status_code, 200)
        self.assertEqual(res_status.json()['status'], 'Stitching in Progress')

    def test_order_pdf_download(self):
        res = self.client.get('/api/orders/ORD-2026-1001/invoice-pdf/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res['Content-Type'], 'application/pdf')
        self.assertGreater(len(res.content), 500)

    def test_reports_and_pdf(self):
        res = self.client.get('/api/reports/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('summary', data)
        self.assertIn('monthly_revenue', data)

        res_pdf = self.client.get('/api/reports/pdf/')
        self.assertEqual(res_pdf.status_code, 200)
        self.assertEqual(res_pdf['Content-Type'], 'application/pdf')
