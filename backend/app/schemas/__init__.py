from app.schemas.product_schema import (
    ProductCategoryBase,
    ProductCategoryCreate,
    ProductCategoryUpdate,
    ProductCategory,
    ProductBase,
    ProductCreate,
    ProductUpdate,
    Product,
    ProductWithBOM,
    ProductListResponse,
)

from app.schemas.department_schema import (
    DepartmentBase,
    DepartmentCreate,
    DepartmentUpdate,
    Department,
    DepartmentWithStats,
    DepartmentListResponse,
)

__all__ = [
    # Product Category
    "ProductCategoryBase",
    "ProductCategoryCreate",
    "ProductCategoryUpdate",
    "ProductCategory",
    # Product
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "Product",
    "ProductWithBOM",
    "ProductListResponse",
    # Department
    "DepartmentBase",
    "DepartmentCreate",
    "DepartmentUpdate",
    "Department",
    "DepartmentWithStats",
    "DepartmentListResponse",
]
