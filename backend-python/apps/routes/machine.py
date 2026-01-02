from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from apps.config.database import get_db
from apps.models.machines.machine import Machine
from apps.schemas.machine import MachineCreate, MachineUpdate, MachineResponse

router = APIRouter(
    prefix="/machines",
    tags=["machines"]
)

@router.get("/", response_model=List[MachineResponse])
def get_machines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    machines = db.query(Machine).offset(skip).limit(limit).all()
    return machines

@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with id {machine_id} not found"
        )
    return machine

@router.post("/", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(machine: MachineCreate, db: Session = Depends(get_db)):
    # Check if machine with same IP already exists
    db_machine = db.query(Machine).filter(Machine.ipMachine == machine.ipMachine).first()
    if db_machine:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Machine with this IP already exists"
        )
    
    # Create new machine
    db_machine = Machine(
        nameMachine=machine.nameMachine,
        ipMachine=machine.ipMachine,
        portMachine=machine.portMachine,
        statusMachine=machine.statusMachine
    )
    
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: str, machine_update: MachineUpdate, db: Session = Depends(get_db)):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with id {machine_id} not found"
        )
    
    # Update fields if provided
    if machine_update.nameMachine is not None:
        db_machine.nameMachine = machine_update.nameMachine
    if machine_update.ipMachine is not None:
        db_machine.ipMachine = machine_update.ipMachine
    if machine_update.portMachine is not None:
        db_machine.portMachine = machine_update.portMachine
    if machine_update.statusMachine is not None:
        db_machine.statusMachine = machine_update.statusMachine
    
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine(machine_id: str, db: Session = Depends(get_db)):
    db_machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with id {machine_id} not found"
        )
    
    db.delete(db_machine)
    db.commit()
    return None
