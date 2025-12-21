from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.db.base import Base

# Import all models so Alembic can detect them
from app.models.user import User
from app.models.department import Department
from app.models.work_phase import WorkPhase
from app.models.product import Product, ProductCategory
from app.models.production_order import ProductionOrder
from app.models.order_status import OrderDepartmentStatus, OrderStatusEnum
from app.models.order_phase_value import OrderPhaseValue
from app.models.employee import Employee
from app.models.production_task import ProductionTask
from app.models.bom import BOMItem
from app.models.efficiency import (
    EfficiencySummary,
    EfficiencyItem,
    EfficiencyPeriodType,
)
from app.models.weekly_plan import WeeklyPlan, WeeklyPlanItem

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLAlchemy URL from our settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
