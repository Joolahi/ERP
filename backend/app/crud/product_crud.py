from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.models.product import Product, ProductCategory
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductCategoryCreate,
    ProductCategoryUpdate,
)


# ============================================================================
# ProductCategory CRUD Operations
# ============================================================================


class CRUDProductCategory:
    """CRUD operaatiot ProductCategory-mallille"""

    def get(self, db: Session, id: int) -> Optional[ProductCategory]:
        """Hae kategoria ID:llä"""
        return db.query(ProductCategory).filter(ProductCategory.id == id).first()

    def get_by_code(self, db: Session, code: str) -> Optional[ProductCategory]:
        """Hae kategoria koodilla"""
        return db.query(ProductCategory).filter(ProductCategory.code == code).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
    ) -> tuple[List[ProductCategory], int]:
        """
        Hae useita kategorioita
        Palauttaa: (kategoriat, total_count)
        """
        query = db.query(ProductCategory)

        # Haku
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    ProductCategory.code.ilike(search_filter),
                    ProductCategory.name.ilike(search_filter),
                )
            )

        # Laske total ennen paginaatiota
        total = query.count()

        # Paginaatio
        categories = (
            query.order_by(ProductCategory.code).offset(skip).limit(limit).all()
        )

        return categories, total

    def create(self, db: Session, *, obj_in: ProductCategoryCreate) -> ProductCategory:
        """Luo uusi kategoria"""
        db_obj = ProductCategory(
            code=obj_in.code,
            name=obj_in.name,
            efficiency_multiplier=obj_in.efficiency_multiplier,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ProductCategory,
        obj_in: ProductCategoryUpdate,
    ) -> ProductCategory:
        """Päivitä olemassa oleva kategoria"""
        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> ProductCategory:
        """Poista kategoria"""
        obj = db.query(ProductCategory).get(id)
        db.delete(obj)
        db.commit()
        return obj


# ============================================================================
# Product CRUD Operations
# ============================================================================


class CRUDProduct:
    """CRUD operaatiot Product-mallille"""

    def get(self, db: Session, id: int) -> Optional[Product]:
        """Hae tuote ID:llä (eager load category)"""
        return (
            db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.id == id)
            .first()
        )

    def get_by_item_number(self, db: Session, item_number: str) -> Optional[Product]:
        """Hae tuote tuotenumerolla"""
        return (
            db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.item_number == item_number)
            .first()
        )

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category_code: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> tuple[List[Product], int]:
        """
        Hae useita tuotteita suodattimilla
        Palauttaa: (tuotteet, total_count)
        """
        query = db.query(Product).options(joinedload(Product.category))

        # Suodattimet
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Product.item_number.ilike(search_filter),
                    Product.description.ilike(search_filter),
                )
            )

        if category_code:
            query = query.filter(Product.category_code == category_code)

        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        # Laske total ennen paginaatiota
        total = query.count()

        # Paginaatio ja järjestys
        products = query.order_by(Product.item_number).offset(skip).limit(limit).all()

        return products, total

    def get_active(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[Product], int]:
        """Hae vain aktiiviset tuotteet"""
        return self.get_multi(db, skip=skip, limit=limit, is_active=True)

    def create(self, db: Session, *, obj_in: ProductCreate) -> Product:
        """Luo uusi tuote"""
        db_obj = Product(
            item_number=obj_in.item_number,
            description=obj_in.description,
            category_code=obj_in.category_code,
            standard_time_minutes=obj_in.standard_time_minutes,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Lataa kategoria
        db.refresh(db_obj, ["category"])
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Product,
        obj_in: ProductUpdate,
    ) -> Product:
        """Päivitä olemassa oleva tuote"""
        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Lataa kategoria
        db.refresh(db_obj, ["category"])
        return db_obj

    def delete(self, db: Session, *, id: int) -> Product:
        """Poista tuote (soft delete suositeltavaa!)"""
        obj = db.query(Product).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def deactivate(self, db: Session, *, id: int) -> Product:
        """Deaktivoi tuote (soft delete)"""
        obj = db.query(Product).get(id)
        obj.is_active = False
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def activate(self, db: Session, *, id: int) -> Product:
        """Aktivoi tuote"""
        obj = db.query(Product).get(id)
        obj.is_active = True
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def search_by_number(
        self,
        db: Session,
        *,
        search_term: str,
        limit: int = 10,
    ) -> List[Product]:
        """
        Etsi tuotteita tuotenumerolla (autocomplete-tyylinen)
        Esim. "ABC" löytää "ABC-001", "ABC-002", jne.
        """
        search_filter = f"{search_term}%"
        return (
            db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.item_number.ilike(search_filter))
            .filter(Product.is_active == True)
            .order_by(Product.item_number)
            .limit(limit)
            .all()
        )

    def get_stats(self, db: Session) -> dict:
        """Hae tuotetilastot"""
        total = db.query(func.count(Product.id)).scalar()
        active = (
            db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
        )

        return {
            "total": total,
            "active": active,
            "inactive": total - active,
        }


# Luo singleton-instanssit
product_category = CRUDProductCategory()
product = CRUDProduct()
