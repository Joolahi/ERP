from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    display_order = Column(Integer)
    color = Column(String(7))  # Hex color
    is_active = Column(Boolean, default=True)

    # Relationships
    work_phases = relationship(
        "WorkPhase", back_populates="department", cascade="all, delete-orphan"
    )
    order_statuses = relationship("OrderDepartmentStatus", back_populates="department")
    production_tasks = relationship("ProductionTask", back_populates="department")
    efficiency_summaries = relationship(
        "EfficiencySummary", back_populates="department"
    )
