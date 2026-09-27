import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.models import SessionLocal
from api.main import get_analytics

db = SessionLocal()
try:
    result = get_analytics(db)
    print("Analytics Success:")
    print(result)
except Exception as e:
    print(f"Analytics Error: {e}")
finally:
    db.close()
