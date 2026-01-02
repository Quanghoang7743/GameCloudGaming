from sqlalchemy import Column, String, DateTime, Integer
import uuid
from apps.config.database import Base

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    code = Column(String(255), unique=True, index=True)
    discount_percentage = Column(Integer, nullable=False)
    