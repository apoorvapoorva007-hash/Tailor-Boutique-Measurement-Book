import os
import sys
from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Auto-initialize MongoDB connection and verify seed data on server startup
        from .db import init_mongodb
        from .seed_data import seed_boutique_data
        init_mongodb()
        try:
            seed_boutique_data()
        except Exception:
            pass
