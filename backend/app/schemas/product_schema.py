from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ProductCategoryBase(BaseModel):
    """Product category shcema - common fields"""

    code: str = Field(..., max_length=50, description="Categorys code")
    name: Optional[str] = Field(None, max_length=100, description="Categorys name")
    efficiency_multiplier: Decimal = Field(
        default=Decimal("1.00"), ge=0, description="Efficiency multiplier value"
    )


class ProductCategoryCreate(ProductCategoryBase):
    """Schema for creating product category"""

    pass


class ProductCategoryUpdate(BaseModel):
    """Updating product kategory all fields optional"""

    code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=100)
    efficiency_multiplier: Optional[Decimal] = Field(None, ge=0)


class ProductCategory(ProductCategoryBase):
    """Schema productcategory returing from api"""

    id: int
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    """Schema for product"""

    item_number: str = Field(..., max_length=100, description="Unique product name")
    description: Optional[str] = Field(None, description="Product description")
    category_code: Optional[str] = Field(
        None, max_length=50, description="Category code"
    )
    standard_time_minutes: Optional[Decimal] = Field(
        None, ge=0, description="Standard time per minute"
    )
    is_active: bool = Field(default=True, description="Is product active")


class ProductCreate(ProductBase):
    """Schema creating product"""

    pass


class ProductUpdate(BaseModel):
    """Schema updating product"""

    item_number: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    category_code: Optional[str] = Field(None, max_length=50)
    standard_time_minutes: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


class Product(ProductBase):
    """Schema returing product form api"""

    id: int
    created_at: datetime
    updated_at: datetime

    # Liitetty kategoria (jos olemassa)
    category: Optional[ProductCategory] = None

    model_config = ConfigDict(from_attributes=True)


class ProductWithBOM(Product):
    """Tuote BOM-tietojen kera (tulee myöhemmin kun BOM schemas on tehty)"""

    # bom_items: List[BOMItem] = []
    pass


class ProductListResponse(BaseModel):
    """Schema tuotelistauksen palauttamiseen"""

    items: list[Product]
    total: int
    page: int
    page_size: int

    model_config = ConfigDict(from_attributes=True)
