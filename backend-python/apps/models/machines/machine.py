from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from apps.config.database import Base
import uuid

class Machine(Base):
    __tablename__ = "machines"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    nameMachine = Column(String(255), nullable=False)
    ipMachine = Column(String(255), nullable=False)
    portMachine = Column(Integer, nullable=False, default=47990)
    statusMachine = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)