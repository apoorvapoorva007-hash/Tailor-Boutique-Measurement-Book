import os
import logging
from mongoengine import connect, disconnect
from pymongo import MongoClient

logger = logging.getLogger(__name__)

_mongo_client = None
_db_status = {
    "connected": False,
    "mode": "uninitialized",
    "db_name": "tailor_boutique_db",
    "error": None,
    "host": None
}

def get_db_status():
    global _db_status
    return _db_status

def init_mongodb():
    global _mongo_client, _db_status
    uri = os.getenv("MONGODB_URI", "").strip()
    db_name = os.getenv("MONGODB_DB_NAME", "tailor_boutique_db").strip()

    # 1. If Atlas URI provided, attempt connecting to MongoDB Atlas
    if uri:
        try:
            logger.info("Connecting to MongoDB Atlas...")
            # Test direct pymongo client first with 5s timeout
            client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
            client.admin.command('ping')
            
            # Connect mongoengine
            disconnect(alias='default')
            connect(
                db=db_name,
                host=uri,
                alias='default'
            )
            _mongo_client = client
            host_preview = uri.split('@')[-1].split('/')[0] if '@' in uri else 'MongoDB Atlas'
            _db_status = {
                "connected": True,
                "mode": "MongoDB Atlas (Cloud)",
                "db_name": db_name,
                "host": host_preview,
                "error": None
            }
            logger.info("Successfully connected to MongoDB Atlas!")
            return True
        except Exception as e:
            logger.warning("MongoDB Atlas connection failed: %s. Using in-memory MongoMock for continuous operation.", str(e))
            _db_status["error"] = str(e)

    # 2. Seamless in-memory fallback using mongomock so app never crashes
    try:
        import mongomock
        disconnect(alias='default')
        connect(
            db=db_name,
            host='mongodb://localhost',
            mongo_client_class=mongomock.MongoClient,
            alias='default'
        )
        _db_status = {
            "connected": True,
            "mode": "In-Memory MongoDB (Ready for Atlas URI)",
            "db_name": db_name,
            "host": "localhost (mock)",
            "error": _db_status.get("error"),
            "notice": "To connect your live MongoDB Atlas cluster, set MONGODB_URI in backend/.env"
        }
        logger.info("Initialized In-Memory MongoDB via MongoMock successfully.")
        return True
    except Exception as e:
        logger.error("Failed to initialize database: %s", str(e))
        _db_status = {
            "connected": False,
            "mode": "failed",
            "db_name": db_name,
            "host": None,
            "error": str(e)
        }
        return False
