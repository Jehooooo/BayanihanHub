import sys
sys.path.append('./backend')
from app.db import SessionLocal
from app.models.item import Item, ItemCategory

db = SessionLocal()
items = db.query(Item).all()
valid_cats = {c.category_id: c.name for c in db.query(ItemCategory).all()}
print('Valid Categories:', valid_cats)
for i in items:
    cat_name = valid_cats.get(i.category_id, "MISSING")
    print(f'Item {i.item_id}: category_id={i.category_id} -> {cat_name}')
