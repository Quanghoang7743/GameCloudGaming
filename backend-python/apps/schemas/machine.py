from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MachineBase(BaseModel):
    nameMachine: str

class MachineCreate(MachineBase):
    ipMachine: str
    portMachine: int = 47990
    statusMachine: bool = True

class MachineUpdate(BaseModel):
    nameMachine: Optional[str] = None
    ipMachine: Optional[str] = None
    portMachine: Optional[int] = None
    statusMachine: Optional[bool] = None

class MachineResponse(MachineBase):
    id: str
    ipMachine: str
    portMachine: int
    statusMachine: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True