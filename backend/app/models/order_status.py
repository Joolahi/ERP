from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    TIMESTAMP,
    UniqueConstraint,
    Enum as SQLEnum,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class OrderStatusEnum(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVER_QUANTITY = "OVER_QUANTITY"


class OrderDepartmentStatus(Base):
    __tablename__ = "order_department_status"

    id = Column(Integer, primary_key=True, index=True)
    production_order_id = Column(
        Integer, ForeignKey("production_orders.id", ondelete="CASCADE"), nullable=False
    )
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)

    status = Column(SQLEnum(OrderStatusEnum), default=OrderStatusEnum.NOT_STARTED)
    quantity_completed = Column(Integer, default=0)

    started_at = Column(TIMESTAMP(timezone=True))
    completed_at = Column(TIMESTAMP(timezone=True))

    # Relationships
    production_order = relationship(
        "ProductionOrder", back_populates="department_statuses"
    )
    department = relationship("Department", back_populates="order_statuses")

    __table_args__ = (
        UniqueConstraint(
            "production_order_id", "department_id", name="uq_order_department"
        ),
    )
