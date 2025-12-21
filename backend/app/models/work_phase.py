from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class WorkPhase(Base):
    __tablename__ = "work_phases"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    code = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    display_order = Column(Integer)
    is_active = Column(Boolean, default=True)

    # Relationships
    department = relationship("Department", back_populates="work_phases")
    order_phase_values = relationship("OrderPhaseValue", back_populates="work_phase")
    production_tasks = relationship("ProductionTask", back_populates="work_phase")

    __table_args__ = (
        UniqueConstraint("department_id", "code", name="uq_department_phase"),
    )
