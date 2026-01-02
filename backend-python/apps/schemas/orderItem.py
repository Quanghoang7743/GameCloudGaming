from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    order_id: str
    user_id: str
    
class OrderItemCreate(OrderItemBase):
    total_amount: int
    payment_status: str
    purchase_date: datetime
    coupon_id: Optional[str] = None

class OrderItemUpdate(OrderItemBase):
    total_amount: Optional[int] = None
    payment_status: Optional[str] = None
    coupon_id: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: str
    total_amount: int
    
    
    class Config:
        from_attributes = True
