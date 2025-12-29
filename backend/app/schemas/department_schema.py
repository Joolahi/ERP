from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


# ============================================================================
# Department Schemas
# ============================================================================


class DepartmentBase(BaseModel):
    """Perus Department schema - yhteiset kentät"""

    code: str = Field(..., max_length=20, description="Osaston yksilöllinen koodi")
    name: str = Field(..., max_length=100, description="Osaston nimi")
    display_order: Optional[int] = Field(None, description="Näyttöjärjestys")
    color: Optional[str] = Field(
        None,
        max_length=7,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Hex värikoodi (esim. #FF5733)",
    )
    is_active: bool = Field(default=True, description="Onko osasto aktiivinen")


class DepartmentCreate(DepartmentBase):
    """Schema osaston luomiseen"""

    pass


class DepartmentUpdate(BaseModel):
    """Schema osaston päivittämiseen - kaikki kentät optionaalisia"""

    code: Optional[str] = Field(None, max_length=20)
    name: Optional[str] = Field(None, max_length=100)
    display_order: Optional[int] = None
    color: Optional[str] = Field(None, max_length=7, pattern="^#[0-9A-Fa-f]{6}$")
    is_active: Optional[bool] = None


class Department(DepartmentBase):
    """Schema osaston palauttamiseen API:sta"""

    id: int

    model_config = ConfigDict(from_attributes=True)


class DepartmentWithStats(Department):
    """Osasto tilastotietojen kera"""

    work_phase_count: Optional[int] = Field(0, description="Työvaiheiden määrä")
    active_orders_count: Optional[int] = Field(
        0, description="Aktiivisten tilausten määrä"
    )

    model_config = ConfigDict(from_attributes=True)


class DepartmentListResponse(BaseModel):
    """Schema osastolistauksen palauttamiseen"""

    items: list[Department]
    total: int
    page: int
    page_size: int

    model_config = ConfigDict(from_attributes=True)
