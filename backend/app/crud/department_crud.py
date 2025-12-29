from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.department import Department
from app.models.work_phase import WorkPhase
from app.models.production_order import ProductionOrder
from app.schemas.department_schema import (
    DepartmentCreate,
    DepartmentUpdate,
)


# ============================================================================
# Department CRUD Operations
# ============================================================================


class CRUDDepartment:
    """CRUD operaatiot Department-mallille"""

    def get(self, db: Session, id: int) -> Optional[Department]:
        """Hae osasto ID:llä"""
        return db.query(Department).filter(Department.id == id).first()

    def get_by_code(self, db: Session, code: str) -> Optional[Department]:
        """Hae osasto koodilla"""
        return db.query(Department).filter(Department.code == code).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> tuple[List[Department], int]:
        """
        Hae useita osastoja
        Palauttaa: (osastot, total_count)
        """
        query = db.query(Department)

        # Suodattimet
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Department.code.ilike(search_filter),
                    Department.name.ilike(search_filter),
                )
            )

        if is_active is not None:
            query = query.filter(Department.is_active == is_active)

        # Laske total ennen paginaatiota
        total = query.count()

        # Paginaatio ja järjestys (display_order, sitten nimi)
        departments = (
            query.order_by(Department.display_order.nullslast(), Department.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

        return departments, total

    def get_active(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[Department], int]:
        """Hae vain aktiiviset osastot"""
        return self.get_multi(db, skip=skip, limit=limit, is_active=True)

    def get_all_active_ordered(self, db: Session) -> List[Department]:
        """
        Hae kaikki aktiiviset osastot oikeassa järjestyksessä
        (Käyttöön esim. dropdown-listoihin)
        """
        return (
            db.query(Department)
            .filter(Department.is_active == True)
            .order_by(Department.display_order.nullslast(), Department.name)
            .all()
        )

    def create(self, db: Session, *, obj_in: DepartmentCreate) -> Department:
        """Luo uusi osasto"""
        db_obj = Department(
            code=obj_in.code,
            name=obj_in.name,
            display_order=obj_in.display_order,
            color=obj_in.color,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Department,
        obj_in: DepartmentUpdate,
    ) -> Department:
        """Päivitä olemassa oleva osasto"""
        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> Department:
        """Poista osasto"""
        obj = db.query(Department).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def deactivate(self, db: Session, *, id: int) -> Department:
        """Deaktivoi osasto (soft delete)"""
        obj = db.query(Department).get(id)
        obj.is_active = False
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def activate(self, db: Session, *, id: int) -> Department:
        """Aktivoi osasto"""
        obj = db.query(Department).get(id)
        obj.is_active = True
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def get_with_stats(self, db: Session, id: int) -> Optional[dict]:
        """
        Hae osasto tilastotietojen kera
        Palauttaa: dict jossa department + stats
        """
        dept = self.get(db, id)
        if not dept:
            return None

        # Laske työvaiheiden määrä
        work_phase_count = (
            db.query(func.count(WorkPhase.id))
            .filter(WorkPhase.department_id == id)
            .scalar()
        )

        # Laske aktiivisten tilausten määrä tässä osastossa
        active_orders_count = (
            db.query(func.count(ProductionOrder.id))
            .filter(ProductionOrder.current_department_id == id)
            .scalar()
        )

        return {
            "department": dept,
            "work_phase_count": work_phase_count,
            "active_orders_count": active_orders_count,
        }

    def reorder(
        self, db: Session, *, department_orders: dict[int, int]
    ) -> List[Department]:
        """
        Päivitä osastojen järjestys
        department_orders: {department_id: new_display_order}
        """
        updated_departments = []

        for dept_id, new_order in department_orders.items():
            dept = self.get(db, dept_id)
            if dept:
                dept.display_order = new_order
                db.add(dept)
                updated_departments.append(dept)

        db.commit()

        for dept in updated_departments:
            db.refresh(dept)

        return updated_departments

    def get_stats(self, db: Session) -> dict:
        """Hae osastotilastot"""
        total = db.query(func.count(Department.id)).scalar()
        active = (
            db.query(func.count(Department.id))
            .filter(Department.is_active == True)
            .scalar()
        )

        return {
            "total": total,
            "active": active,
            "inactive": total - active,
        }


# Luo singleton-instanssi
department = CRUDDepartment()
