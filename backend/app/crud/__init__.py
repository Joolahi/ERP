"""
CRUD operations for database models
"""

from app.crud.product_crud import product, product_category
from app.crud.department_crud import department

__all__ = [
    "product",
    "product_category",
    "department",
]