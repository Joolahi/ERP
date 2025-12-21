from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey,
    TIMESTAMP,
    DECIMAL,
    UniqueConstraint,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.sql import func, text
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class EfficiencyPeriodType(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"


class EfficiencySummary(Base):
    __tablename__ = "efficiency_summaries"

    id = Column(Integer, primary_key=True, index=True)

    period_type = Column(SQLEnum(EfficiencyPeriodType), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))

    # Time period fields
    date = Column(Date, index=True)
    week_number = Column(Integer, index=True)
    month = Column(Integer)
    year = Column(Integer, nullable=False, index=True)

    # Work hours
    planned_work_hours = Column(DECIMAL(10, 2), nullable=False)
    actual_work_hours = Column(DECIMAL(10, 2))

    # Efficiency metrics
    total_std_time = Column(DECIMAL(10, 2), default=0)
    total_target_time = Column(DECIMAL(10, 2), default=0)

    efficiency_actual = Column(DECIMAL(5, 2))  # %
    efficiency_target = Column(DECIMAL(5, 2))  # %

    # Metadata
    num_workers = Column(Integer)
    num_work_days = Column(Integer)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    department = relationship("Department", back_populates="efficiency_summaries")
    items = relationship(
        "EfficiencyItem",
        back_populates="efficiency_summary",
        cascade="all, delete-orphan",
    )


# Luodaan partial unique indeksit erikseen taulun luonnin jälkeen
# Nämä lisätään migraatiossa manuaalisesti
__table_args__ = (
    # Ei unique constrainteja tässä, lisätään migraatiossa
)


class EfficiencyItem(Base):
    __tablename__ = "efficiency_items"

    id = Column(Integer, primary_key=True, index=True)
    efficiency_summary_id = Column(
        Integer,
        ForeignKey("efficiency_summaries.id", ondelete="CASCADE"),
        nullable=False,
    )
    production_order_id = Column(Integer, ForeignKey("production_orders.id"))

    quantity_completed = Column(Integer)
    quantity_target = Column(Integer)
    standard_time_minutes = Column(DECIMAL(10, 2))

    actual_std_time = Column(DECIMAL(10, 2))  # completed * std_time
    target_std_time = Column(DECIMAL(10, 2))  # target * std_time

    status = Column(String(50))

    # Relationships
    efficiency_summary = relationship("EfficiencySummary", back_populates="items")
    production_order = relationship(
        "ProductionOrder", back_populates="efficiency_items"
    )
