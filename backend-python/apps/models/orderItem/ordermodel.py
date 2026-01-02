from sqlalchemy import Column, Integer, String, DateTime
from apps.config.database import Base

import uuid

class OrderItem(Base):
    __tablename__ = 'order_items'

    order_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(CHAR(36), nullable=False)
    total_amount = Column(Integer, nullable=False)
    payment_status = Column(String(255), nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    coupon_id = Column(CHAR(36), nullable=False)
