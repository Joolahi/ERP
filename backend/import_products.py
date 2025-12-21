#!/usr/bin/env python3
"""
Import products from Accon.Koodit.json to PostgreSQL database
"""
import json
import sys
from decimal import Decimal
from sqlalchemy.orm import Session
from app.db.base import engine, SessionLocal
from app.models.product import Product


def clean_decimal(value):
    """Convert Finnish decimal format to standard decimal"""
    if value is None or value == 0 or value == "":
        return None

    # Convert to string if not already
    str_value = str(value)

    # Replace comma with dot for decimal separator
    str_value = str_value.replace(",", ".")

    # Remove any whitespace
    str_value = str_value.strip()

    # Convert to Decimal
    try:
        return Decimal(str_value)
    except:
        print(f"Warning: Could not convert '{value}' to decimal, using None")
        return None


def clean_category(category):
    """Clean and validate category code"""
    if not category:
        return None

    # Remove whitespace and convert to uppercase
    category = str(category).strip().upper()

    # Skip only truly invalid categories
    if not category or category == "?":
        return None

    # Handle special cases
    if category == "AAA?":
        return "AAA"
    if category == "E?":
        return "E"

    # Accept all valid categories: AA, AAA, A-H
    valid_categories = ["AA", "AAA", "A", "B", "C", "D", "E", "F", "G", "H"]
    if category in valid_categories:
        return category

    # Log unknown categories
    print(f"Warning: Unknown category '{category}', skipping")
    return None


def import_products(json_file_path: str):
    """Import products from JSON file"""

    print(f"Reading products from {json_file_path}...")

    # Read JSON file
    with open(json_file_path, "r", encoding="utf-8") as f:
        products_data = json.load(f)

    print(f"Found {len(products_data)} products in JSON")

    # Create database session
    db: Session = SessionLocal()

    try:
        imported_count = 0
        skipped_count = 0
        updated_count = 0
        json_duplicates = 0
        category_stats = {}

        # Track seen item numbers in JSON to handle duplicates
        seen_items = {}

        for idx, item in enumerate(products_data):
            # Extract data
            item_number = item.get("Item number", "").strip()
            category = clean_category(item.get("Category"))
            standard_time = clean_decimal(item.get("Standardiaika"))

            # Skip if no item number
            if not item_number:
                print(f"Skipping index {idx}: No item number")
                skipped_count += 1
                continue

            # Skip if no valid category
            if not category:
                print(
                    f"Skipping {item_number}: Invalid category '{item.get('Category')}'"
                )
                skipped_count += 1
                continue

            # Check for duplicates in JSON data itself
            if item_number in seen_items:
                json_duplicates += 1
                print(
                    f"Duplicate in JSON: {item_number} (index {idx}), using first occurrence"
                )
                continue

            # Mark as seen
            seen_items[item_number] = True

            # Track category statistics
            category_stats[category] = category_stats.get(category, 0) + 1

            # Check if product already exists in database
            existing_product = (
                db.query(Product).filter(Product.item_number == item_number).first()
            )

            if existing_product:
                # Update existing product
                existing_product.category_code = category
                existing_product.standard_time_minutes = standard_time
                existing_product.is_active = True
                updated_count += 1
                if updated_count <= 5:  # Show first 5
                    print(f"Updated: {item_number} ({category}, {standard_time} min)")
            else:
                # Create new product
                product = Product(
                    item_number=item_number,
                    category_code=category,
                    standard_time_minutes=standard_time,
                    description=None,  # No description in source data
                    is_active=True,
                )
                db.add(product)
                imported_count += 1
                if imported_count <= 5:  # Show first 5
                    print(f"Imported: {item_number} ({category}, {standard_time} min)")

            # Commit in batches to avoid huge transactions
            if (imported_count + updated_count) % 100 == 0:
                db.commit()
                print(
                    f"Progress: {imported_count + updated_count} products processed..."
                )

        # Final commit
        db.commit()

        print("\n" + "=" * 70)
        print(f"✅ Import completed!")
        print(f"   New products imported: {imported_count}")
        print(f"   Existing products updated: {updated_count}")
        print(f"   Products skipped (invalid): {skipped_count}")
        print(f"   Duplicates in JSON: {json_duplicates}")
        print(f"   Total unique products: {imported_count + updated_count}")
        print("\n📊 Category breakdown:")
        for cat in sorted(category_stats.keys()):
            print(f"   {cat}: {category_stats[cat]} products")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during import: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    # Path to your JSON file
    json_file = "/home/joonas/ERP/backend/Accon.Koodit.json"

    import_products(json_file)
