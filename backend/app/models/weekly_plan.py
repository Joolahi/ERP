from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    TIMESTAMP,
    DECIMAL,
    UniqueConstraint,
    Computed,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"

    id = Column(Integer, primary_key=True, index=True)
    week_number = Column(Integer, nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)

    num_workers = Column(Integer)
    work_days_per_week = Column(Integer, default=5)
    hours_per_day = Column(DECIMAL(4, 2), default=7.5)

    total_planned_hours = Column(
        DECIMAL(10, 2), Computed("num_workers * work_days_per_week * hours_per_day")
    )

    notes = Column(Text)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    plan_items = relationship(
        "WeeklyPlanItem", back_populates="weekly_plan", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("week_number", "year", name="uq_weekly_plan"),)


class WeeklyPlanItem(Base):
    __tablename__ = "weekly_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(
        Integer, ForeignKey("weekly_plans.id", ondelete="CASCADE"), nullable=False
    )
    production_order_id = Column(
        Integer, ForeignKey("production_orders.id"), nullable=False
    )

    planned_sequence = Column(Integer)
    estimated_hours = Column(DECIMAL(10, 2))
    priority = Column(Integer, default=0)

    # Relationships
    weekly_plan = relationship("WeeklyPlan", back_populates="plan_items")
    production_order = relationship(
        "ProductionOrder", back_populates="weekly_plan_items"
    )

    __table_args__ = (
        UniqueConstraint("weekly_plan_id", "production_order_id", name="uq_plan_order"),
    )
