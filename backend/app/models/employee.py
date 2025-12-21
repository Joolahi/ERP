from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    ForeignKey,
    TIMESTAMP,
    Computed,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String(50), unique=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    full_name = Column(String(255), Computed("first_name || ' ' || last_name"))

    primary_department_id = Column(Integer, ForeignKey("departments.id"))

    hire_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    primary_department = relationship("Department")
    production_tasks = relationship("ProductionTask", back_populates="employee")
