from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.crud import product as crud_product
from app.crud import product_category as crud_product_category
from app.schemas.product_schema import (
    Product,
    ProductCreate,
    ProductUpdate,
    ProductListResponse,
)

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Sivutuksen offset"),
    limit: int = Query(100, ge=1, le=500, description="Tuotteiden määrä per sivu"),
    search: Optional[str] = Query(
        None, description="Haku tuotenumerosta tai kuvauksesta"
    ),
    category_code: Optional[str] = Query(None, description="Suodata kategorian mukaan"),
    is_active: Optional[bool] = Query(None, description="Suodata aktiivisuuden mukaan"),
):
    """
    Hae tuotteita suodattimilla ja paginaatiolla.

    - **skip**: Montako tulosta ohitetaan (paginaatio)
    - **limit**: Montako tulosta palautetaan
    - **search**: Hae tuotenumerosta tai kuvauksesta
    - **category_code**: Näytä vain tietyn kategorian tuotteet
    - **is_active**: Näytä vain aktiiviset tai ei-aktiiviset
    """
    products, total = crud_product.get_multi(
        db,
        skip=skip,
        limit=limit,
        search=search,
        category_code=category_code,
        is_active=is_active,
    )

    page = (skip // limit) + 1 if limit > 0 else 1

    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=limit,
    )


@router.get("/active", response_model=List[Product])
def get_active_products(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
):
    """
    Hae kaikki aktiiviset tuotteet.
    Hyödyllinen esim. dropdown-listoihin.
    """
    products, _ = crud_product.get_active(db, skip=0, limit=limit)
    return products


@router.get("/search", response_model=List[Product])
def search_products(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1, description="Hakutermi"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Pikahaku tuotteille (autocomplete).
    Hakee tuotenumeroista alkaen hakutermillä.
    """
    products = crud_product.search_by_number(
        db,
        search_term=q,
        limit=limit,
    )
    return products


@router.get("/stats")
def get_product_stats(db: Session = Depends(get_db)):
    """
    Hae tuotetilastot.
    """
    return crud_product.get_stats(db)


@router.get("/{product_id}", response_model=Product)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Hae yksittäinen tuote ID:llä.
    """
    product = crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tuotetta ID:llä {product_id} ei löytynyt",
        )
    return product


@router.get("/by-number/{item_number}", response_model=Product)
def get_product_by_number(
    item_number: str,
    db: Session = Depends(get_db),
):
    """
    Hae tuote tuotenumerolla.
    """
    product = crud_product.get_by_item_number(db, item_number=item_number)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tuotetta numerolla '{item_number}' ei löytynyt",
        )
    return product


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
):
    """
    Luo uusi tuote.
    """
    # Tarkista ettei tuotenumero ole jo käytössä
    existing = crud_product.get_by_item_number(db, item_number=product_in.item_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tuotenumero '{product_in.item_number}' on jo käytössä",
        )

    # Tarkista että kategoria on olemassa jos määritelty
    if product_in.category_code:
        category = crud_product_category.get_by_code(
            db, code=product_in.category_code
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kategoriaa koodilla '{product_in.category_code}' ei löytynyt",
            )

    product = crud_product.create(db, obj_in=product_in)
    return product


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
):
    """
    Päivitä olemassa oleva tuote.
    """
    product = crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tuotetta ID:llä {product_id} ei löytynyt",
        )

    # Tarkista tuotenumeron uniiккius jos päivitetään
    if product_in.item_number and product_in.item_number != product.item_number:
        existing = crud_product.get_by_item_number(
            db, item_number=product_in.item_number
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tuotenumero '{product_in.item_number}' on jo käytössä",
            )

    # Tarkista kategoria jos päivitetään
    if product_in.category_code:
        category = crud_product_category.get_by_code(db, code=product_in.category_code)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kategoriaa koodilla '{product_in.category_code}' ei löytynyt",
            )

    product = crud_product.update(db, db_obj=product, obj_in=product_in)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Poista tuote (hard delete).
    Huom: Suositellaan käyttämään deactivate-endpointia sen sijaan!
    """
    product = crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tuotetta ID:llä {product_id} ei löytynyt",
        )

    crud_product.delete(db, id=product_id)
    return None


@router.post("/{product_id}/deactivate", response_model=Product)
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Deaktivoi tuote (soft delete).
    Suositeltu tapa "poistaa" tuotteita.
    """
    product = crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tuotetta ID:llä {product_id} ei löytynyt",
        )

    product = crud_product.deactivate(db, id=product_id)
    return product


@router.post("/{product_id}/activate", response_model=Product)
def activate_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Aktivoi tuote uudelleen.
    """
    product = crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tuotetta ID:llä {product_id} ei löytynyt",
        )

    product = crud_product.activate(db, id=product_id)
    return product
