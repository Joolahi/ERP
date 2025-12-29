from fastapi import APIRouter
from app.api.endpoints import products_endpoints, department_endpoints

api_router = APIRouter()

# Rekisteröi endpointit
api_router.include_router(
    products_endpoints.router, prefix="/products", tags=["products"]
)

api_router.include_router(
    department_endpoints.router, prefix="/departments", tags=["departments"]
)
