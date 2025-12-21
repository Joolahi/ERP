from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from app.db.base import Base


class BOMItem(Base):
    __tablename__ = "bom_items"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    material_code = Column(String(100), nullable=False)
    material_name = Column(String(255))
    quantity = Column(DECIMAL(10, 2), nullable=False)
    unit = Column(String(50))

    # Relationships
    product = relationship("Product", back_populates="bom_items")
