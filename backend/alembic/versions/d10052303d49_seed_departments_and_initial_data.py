"""Seed departments and initial data

Revision ID: d10052303d49
Revises: 56bb1bbb1636
Create Date: 2025-12-21 15:39:05.128228

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d10052303d49"
down_revision: Union[str, Sequence[str], None] = "56bb1bbb1636"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ==========================================
    # OSASTOT
    # ==========================================
    op.execute(
        """
        INSERT INTO departments (code, name, display_order, color, is_active) VALUES
        ('LEIKKAUS', 'Leikkaus', 1, '#FF6B6B', true),
        ('REMMIT', 'Remmit', 2, '#4ECDC4', true),
        ('ESIVALMISTELU', 'Esivalmistelu', 3, '#45B7D1', true),
        ('HYGIENIA', 'Hygienia', 4, '#96CEB4', true),
        ('ERIKOISPUOLI', 'Erikoispuoli', 5, '#FFEAA7', true),
        ('PAKKAUS', 'Pakkaus', 6, '#DFE6E9', true),
        ('PAINATUS', 'Painatus', 7, '#A29BFE', true)
    """
    )

    # ==========================================
    # TYÖVAIHEET
    # ==========================================
    op.execute(
        """
        INSERT INTO work_phases (department_id, code, name, display_order, is_active) VALUES
        -- Leikkaus (id=1)
        (1, 'PHASE_1', 'Leikkaus 1', 1, true),
        (1, 'PHASE_2', 'Leikkaus 2', 2, true),
        (1, 'PHASE_3', 'Leikkaus 3', 3, true),
        (1, 'PHASE_4', 'Leikkaus 4', 4, true),
        (1, 'PHASE_5', 'Leikkaus 5', 5, true),
        (1, 'PHASE_6', 'Leikkaus 6', 6, true),
        
        -- Remmit (id=2)
        (2, 'PHASE_1', 'Remmit 1', 1, true),
        (2, 'PHASE_2', 'Remmit 2', 2, true),
        (2, 'PHASE_3', 'Remmit 3', 3, true),
        (2, 'PHASE_4', 'Remmit 4', 4, true),
        (2, 'PHASE_5', 'Remmit 5', 5, true),
        (2, 'PHASE_6', 'Remmit 6', 6, true),
        
        -- Esivalmistelu (id=3)
        (3, 'PHASE_1', 'Esivalmistelu 1', 1, true),
        (3, 'PHASE_2', 'Esivalmistelu 2', 2, true),
        (3, 'PHASE_3', 'Esivalmistelu 3', 3, true),
        (3, 'PHASE_4', 'Esivalmistelu 4', 4, true),
        (3, 'PHASE_5', 'Esivalmistelu 5', 5, true),
        (3, 'PHASE_6', 'Esivalmistelu 6', 6, true),
        
        -- Hygienia (id=4)
        (4, 'PHASE_1', 'Hygienia 1', 1, true),
        (4, 'PHASE_2', 'Hygienia 2', 2, true),
        (4, 'PHASE_3', 'Hygienia 3', 3, true),
        (4, 'PHASE_4', 'Hygienia 4', 4, true),
        (4, 'PHASE_5', 'Hygienia 5', 5, true),
        (4, 'PHASE_6', 'Hygienia 6', 6, true),
        
        -- Erikoispuoli (id=5)
        (5, 'PHASE_1', 'Erikoispuoli 1', 1, true),
        (5, 'PHASE_2', 'Erikoispuoli 2', 2, true),
        (5, 'PHASE_3', 'Erikoispuoli 3', 3, true),
        (5, 'PHASE_4', 'Erikoispuoli 4', 4, true),
        (5, 'PHASE_5', 'Erikoispuoli 5', 5, true),
        (5, 'PHASE_6', 'Erikoispuoli 6', 6, true),
        
        -- Pakkaus (id=6)
        (6, 'PHASE_1', 'Pakkaus 1', 1, true),
        (6, 'PHASE_2', 'Pakkaus 2', 2, true),
        (6, 'PHASE_3', 'Pakkaus 3', 3, true),
        (6, 'PHASE_4', 'Pakkaus 4', 4, true),
        (6, 'PHASE_5', 'Pakkaus 5', 5, true),
        (6, 'PHASE_6', 'Pakkaus 6', 6, true),
        
        -- Painatus (id=7)
        (7, 'PHASE_1', 'Painatus 1', 1, true),
        (7, 'PHASE_2', 'Painatus 2', 2, true),
        (7, 'PHASE_3', 'Painatus 3', 3, true),
        (7, 'PHASE_4', 'Painatus 4', 4, true),
        (7, 'PHASE_5', 'Painatus 5', 5, true),
        (7, 'PHASE_6', 'Painatus 6', 6, true)
    """
    )

    # ==========================================
    # TUOTEKATEGORIAT
    # ==========================================
    op.execute(
        """
        INSERT INTO product_categories (code, name, efficiency_multiplier) VALUES
        ('A', 'Kategoria A', 1.00),
        ('B', 'Kategoria B', 1.10),
        ('C', 'Kategoria C', 1.20),
        ('D', 'Kategoria D', 1.30),
        ('E', 'Kategoria E', 1.40),
        ('F', 'Kategoria F', 1.50)
    """
    )

    # ==========================================
    # KÄYTTÄJÄT (Admin)
    # ==========================================
    # Salasana: admin123
    # Hashattu bcrypt: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYvXq0q0W4u
    op.execute(
        """
        INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser) VALUES
        ('admin@erp.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYvXq0q0W4u', 'Admin User', true, true)
    """
    )

    # ==========================================
    # ESIMERKKITYÖNTEKIJÄT
    # ==========================================
    op.execute(
        """
        INSERT INTO employees (employee_number, first_name, last_name, primary_department_id, is_active) VALUES
        ('EMP001', 'Matti', 'Meikäläinen', 1, true),
        ('EMP002', 'Maija', 'Virtanen', 2, true),
        ('EMP003', 'Pekka', 'Pouta', 4, true),
        ('EMP004', 'Liisa', 'Lahtinen', 3, true),
        ('EMP005', 'Kalle', 'Korhonen', 5, true),
        ('EMP006', 'Anna', 'Anttila', 6, true)
    """
    )


def downgrade() -> None:
    # Poista seed data käänteisessä järjestyksessä (foreign key constraints)
    op.execute("DELETE FROM employees")
    op.execute("DELETE FROM users")
    op.execute("DELETE FROM work_phases")
    op.execute("DELETE FROM product_categories")
    op.execute("DELETE FROM departments")
