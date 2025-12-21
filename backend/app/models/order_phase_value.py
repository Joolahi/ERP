from sqlalchemy import Column, Integer, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class OrderPhaseValue(Base):
    __tablename__ = "order_phase_values"

    id = Column(Integer, primary_key=True, index=True)
    production_order_id = Column(
        Integer, ForeignKey("production_orders.id", ondelete="CASCADE"), nullable=False
    )
    work_phase_id = Column(Integer, ForeignKey("work_phases.id"), nullable=False)

    value = Column(Text)

    # Relationships
    production_order = relationship("ProductionOrder", back_populates="phase_values")
    work_phase = relationship("WorkPhase", back_populates="order_phase_values")

    __table_args__ = (
        UniqueConstraint("production_order_id", "work_phase_id", name="uq_order_phase"),
    )
