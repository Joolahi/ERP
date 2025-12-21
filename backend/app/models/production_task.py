from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    TIMESTAMP,
    DECIMAL,
    Computed,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


class ProductionTask(Base):
    __tablename__ = "production_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_uuid = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4, index=True)

    production_order_id = Column(
        Integer, ForeignKey("production_orders.id", ondelete="CASCADE"), nullable=False
    )
    employee_id = Column(Integer, ForeignKey("employees.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    work_phase_id = Column(Integer, ForeignKey("work_phases.id"))

    batch_uuid = Column(UUID(as_uuid=True), index=True)  # group_id

    started_at = Column(TIMESTAMP(timezone=True), nullable=False)
    ended_at = Column(TIMESTAMP(timezone=True))
    duration_minutes = Column(
        Integer, Computed("EXTRACT(EPOCH FROM (ended_at - started_at)) / 60")
    )

    quantity_completed = Column(DECIMAL(10, 2), default=0)
    comment = Column(Text)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    production_order = relationship(
        "ProductionOrder", back_populates="production_tasks"
    )
    employee = relationship("Employee", back_populates="production_tasks")
    department = relationship("Department", back_populates="production_tasks")
    work_phase = relationship("WorkPhase", back_populates="production_tasks")
