from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.crud import department as crud_department
from app.schemas.department_schema import (
    Department,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentListResponse,
    DepartmentWithStats,
)

router = APIRouter()


@router.get("/", response_model=DepartmentListResponse)
def get_departments(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Sivutuksen offset"),
    limit: int = Query(100, ge=1, le=500, description="Osastojen määrä per sivu"),
    search: Optional[str] = Query(None, description="Haku koodista tai nimestä"),
    is_active: Optional[bool] = Query(None, description="Suodata aktiivisuuden mukaan"),
):
    """
    Hae osastoja suodattimilla ja paginaatiolla.

    - **skip**: Montako tulosta ohitetaan (paginaatio)
    - **limit**: Montako tulosta palautetaan
    - **search**: Hae koodista tai nimestä
    - **is_active**: Näytä vain aktiiviset tai ei-aktiiviset
    """
    departments, total = crud_department.get_multi(
        db,
        skip=skip,
        limit=limit,
        search=search,
        is_active=is_active,
    )

    page = (skip // limit) + 1 if limit > 0 else 1

    return DepartmentListResponse(
        items=departments,
        total=total,
        page=page,
        page_size=limit,
    )


@router.get("/active", response_model=List[Department])
def get_active_departments(
    db: Session = Depends(get_db),
):
    """
    Hae kaikki aktiiviset osastot oikeassa järjestyksessä.
    Hyödyllinen esim. dropdown-listoihin ja navigaatioon.
    """
    departments = crud_department.get_all_active_ordered(db)
    return departments


@router.get("/stats")
def get_department_stats(db: Session = Depends(get_db)):
    """
    Hae osastotilastot.
    """
    return crud_department.get_stats(db)


@router.get("/{department_id}", response_model=Department)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    """
    Hae yksittäinen osasto ID:llä.
    """
    department = crud_department.get(db, id=department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa ID:llä {department_id} ei löytynyt",
        )
    return department


@router.get("/{department_id}/with-stats", response_model=DepartmentWithStats)
def get_department_with_stats(
    department_id: int,
    db: Session = Depends(get_db),
):
    """
    Hae osasto tilastotietojen kera (työvaiheiden määrä, aktiiviset tilaukset).
    """
    result = crud_department.get_with_stats(db, id=department_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa ID:llä {department_id} ei löytynyt",
        )

    dept = result["department"]
    return DepartmentWithStats(
        id=dept.id,
        code=dept.code,
        name=dept.name,
        display_order=dept.display_order,
        color=dept.color,
        is_active=dept.is_active,
        work_phase_count=result["work_phase_count"],
        active_orders_count=result["active_orders_count"],
    )


@router.get("/by-code/{code}", response_model=Department)
def get_department_by_code(
    code: str,
    db: Session = Depends(get_db),
):
    """
    Hae osasto koodilla.
    """
    department = crud_department.get_by_code(db, code=code)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa koodilla '{code}' ei löytynyt",
        )
    return department


@router.post("/", response_model=Department, status_code=status.HTTP_201_CREATED)
def create_department(
    department_in: DepartmentCreate,
    db: Session = Depends(get_db),
):
    """
    Luo uusi osasto.
    """
    # Tarkista ettei koodi ole jo käytössä
    existing = crud_department.get_by_code(db, code=department_in.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Osaston koodi '{department_in.code}' on jo käytössä",
        )

    department = crud_department.create(db, obj_in=department_in)
    return department


@router.put("/{department_id}", response_model=Department)
def update_department(
    department_id: int,
    department_in: DepartmentUpdate,
    db: Session = Depends(get_db),
):
    """
    Päivitä olemassa oleva osasto.
    """
    department = crud_department.get(db, id=department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa ID:llä {department_id} ei löytynyt",
        )

    # Tarkista koodin uniiккius jos päivitetään
    if department_in.code and department_in.code != department.code:
        existing = crud_department.get_by_code(db, code=department_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Osaston koodi '{department_in.code}' on jo käytössä",
            )

    department = crud_department.update(db, db_obj=department, obj_in=department_in)
    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    """
    Poista osasto (hard delete).
    Huom: Suositellaan käyttämään deactivate-endpointia sen sijaan!
    """
    department = crud_department.get(db, id=department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa ID:llä {department_id} ei löytynyt",
        )

    crud_department.delete(db, id=department_id)
    return None


@router.post("/{department_id}/deactivate", response_model=Department)
def deactivate_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    """
    Deaktivoi osasto (soft delete).
    Suositeltu tapa "poistaa" osastoja.
    """
    department = crud_department.get(db, id=department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa ID:llä {department_id} ei löytynyt",
        )

    department = crud_department.deactivate(db, id=department_id)
    return department


@router.post("/{department_id}/activate", response_model=Department)
def activate_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    """
    Aktivoi osasto uudelleen.
    """
    department = crud_department.get(db, id=department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Osastoa ID:llä {department_id} ei löytynyt",
        )

    department = crud_department.activate(db, id=department_id)
    return department


@router.post("/reorder", response_model=List[Department])
def reorder_departments(
    order_mapping: dict[int, int],
    db: Session = Depends(get_db),
):
    """
    Päivitä osastojen järjestys.

    Body: {"1": 0, "2": 1, "3": 2}
    (department_id: new_display_order)
    """
    departments = crud_department.reorder(db, department_orders=order_mapping)
    return departments
