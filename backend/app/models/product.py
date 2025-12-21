from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DECIMAL,
    TIMESTAMP,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100))
    efficiency_multiplier = Column(DECIMAL(5, 2), default=1.00)

    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    item_number = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    category_code = Column(String(50), ForeignKey("product_categories.code"))
    standard_time_minutes = Column(DECIMAL(10, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    category = relationship("ProductCategory", back_populates="products")
    production_orders = relationship("ProductionOrder", back_populates="product")
    bom_items = relationship(
        "BOMItem", back_populates="product", cascade="all, delete-orphan"
    )
