from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, nullable=False, index=True)
    reference_number = Column(String(100), index=True)
    product_id = Column(Integer, ForeignKey("products.id"))

    quantity = Column(Integer, nullable=False)
    ship_date = Column(Date)
    week_number = Column(Integer, index=True)
    year = Column(Integer, index=True)

    current_department_id = Column(Integer, ForeignKey("departments.id"))
    queue_position = Column(Integer, default=0)

    notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    product = relationship("Product", back_populates="production_orders")
    current_department = relationship("Department")
    department_statuses = relationship(
        "OrderDepartmentStatus",
        back_populates="production_order",
        cascade="all, delete-orphan",
    )
    phase_values = relationship(
        "OrderPhaseValue",
        back_populates="production_order",
        cascade="all, delete-orphan",
    )
    production_tasks = relationship(
        "ProductionTask",
        back_populates="production_order",
        cascade="all, delete-orphan",
    )
    weekly_plan_items = relationship(
        "WeeklyPlanItem", back_populates="production_order"
    )
    efficiency_items = relationship("EfficiencyItem", back_populates="production_order")
