from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from . import models

STORE_PICKUP_ADDRESS = "Bank Road, Near Gandhi Chowk, Raxaul, Bihar - 845305"

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Admin User
        admin_phone = "9999999999"
        admin_user = db.query(models.User).filter(models.User.phone == admin_phone).first()
        if not admin_user:
            admin_user = models.User(
                name="AK Store Admin",
                email="admin@akstore.in",
                phone=admin_phone,
                password="admin",
                role="admin",
                street_address="Bank Road, Near Gandhi Chowk",
                city="Raxaul",
                state="Bihar",
                pincode="845305",
                landmark="Near Gandhi Chowk"
            )
            db.add(admin_user)
            print("Admin user created: 9999999999 / admin")
        else:
            admin_user.street_address = "Bank Road, Near Gandhi Chowk"
            admin_user.city = "Raxaul"
            admin_user.state = "Bihar"
            admin_user.pincode = "845305"

        # 2. Executive User
        exec_phone = "8888888888"
        exec_user = db.query(models.User).filter(models.User.phone == exec_phone).first()
        if not exec_user:
            exec_user = models.User(
                name="Executive Lead",
                email="delivery@akstore.in",
                phone=exec_phone,
                password="exec",
                role="executive",
                street_address="Station Road, Raxaul Hub",
                city="Raxaul",
                state="Bihar",
                pincode="845305",
                landmark="Near Railway Station"
            )
            db.add(exec_user)
            print("Executive user created: 8888888888 / exec")

        # 3. Categories with sub-categories
        root_cats = [
            {"name": "Fruits & Vegetables", "icon": "🍎"},
            {"name": "Dairy & Bread",       "icon": "🥛"},
            {"name": "Beverages",           "icon": "☕"},
            {"name": "Snacks & Munchies",   "icon": "🍿"},
            {"name": "Spices & Masala",     "icon": "🌶️"},
            {"name": "Dry Fruits & Nuts",   "icon": "🥜"},
            {"name": "Personal Care",       "icon": "🧴"},
            {"name": "Household",           "icon": "🏠"},
        ]
        for cat_data in root_cats:
            if not db.query(models.Category).filter(models.Category.name == cat_data["name"]).first():
                db.add(models.Category(**cat_data))
        db.commit()

        cats = {c.name: c.id for c in db.query(models.Category).all()}

        # 4. Products (rich dummy data with Unsplash images)
        products_data = [
            # Fruits & Vegetables
            {"name": "Fresh Red Apples",       "price": 120, "mrp": 150, "cost_price": 80,  "discount": 20, "unit": "1 kg",  "stock": 50, "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6bccb?w=400", "category_id": cats["Fruits & Vegetables"], "brand": "Organic India", "description": "Sweet and crispy organic red apples from Shimla hills.", "catch": "Farm Fresh Daily"},
            {"name": "Banana",                 "price": 40,  "mrp": 50,  "cost_price": 30,  "discount": 20, "unit": "1 doz","stock": 80, "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", "category_id": cats["Fruits & Vegetables"], "brand": "Local Farm",    "description": "Ripe, sweet bananas sourced fresh from Bihar."},
            {"name": "Tomatoes",               "price": 30,  "mrp": 40,  "cost_price": 20,  "discount": 25, "unit": "500g", "stock": 100,"image": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400", "category_id": cats["Fruits & Vegetables"], "description": "Farm fresh ripe red tomatoes, perfect for curries and salads."},
            {"name": "Potatoes",               "price": 25,  "mrp": 30,  "cost_price": 18,  "discount": 16, "unit": "1 kg", "stock": 150,"image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", "category_id": cats["Fruits & Vegetables"], "description": "Fresh potatoes, great for sabzi, fries and chips."},
            {"name": "Onions",                 "price": 35,  "mrp": 45,  "cost_price": 25,  "discount": 22, "unit": "1 kg", "stock": 120,"image": "https://images.unsplash.com/photo-1508747703725-719777637510?w=400", "category_id": cats["Fruits & Vegetables"], "description": "Fresh pink onions, essential for every Indian kitchen."},
            # Dairy & Bread
            {"name": "Full Cream Milk",        "price": 60,  "mrp": 66,  "cost_price": 55,  "discount": 9,  "unit": "1 L",  "stock": 60, "image": "https://images.unsplash.com/photo-1563636619-e9107da5a76a?w=400", "category_id": cats["Dairy & Bread"],       "brand": "Sudha",         "description": "Fresh farm pasteurised full cream milk.", "catch": "Pure & Natural"},
            {"name": "Paneer",                 "price": 90,  "mrp": 110, "cost_price": 75,  "discount": 18, "unit": "200g", "stock": 40, "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400", "category_id": cats["Dairy & Bread"],       "brand": "Amul",          "description": "Soft and fresh white paneer. Perfect for tikka, palak paneer and more."},
            {"name": "Whole Wheat Bread",      "price": 45,  "mrp": 50,  "cost_price": 35,  "discount": 10, "unit": "400g", "stock": 30, "image": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400", "category_id": cats["Dairy & Bread"],       "brand": "Britannia",     "description": "Freshly baked whole wheat bread, healthy and soft."},
            {"name": "Butter",                 "price": 55,  "mrp": 62,  "cost_price": 45,  "discount": 11, "unit": "100g", "stock": 50, "image": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400", "category_id": cats["Dairy & Bread"],       "brand": "Amul",          "description": "Creamy salted butter made from fresh cream."},
            # Beverages
            {"name": "Tata Tea Premium",       "price": 95,  "mrp": 110, "cost_price": 80,  "discount": 13, "unit": "250g", "stock": 45, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "category_id": cats["Beverages"],           "brand": "Tata Tea",      "description": "Rich and aromatic tea leaves for a perfect morning cup."},
            {"name": "Bisleri Water",          "price": 20,  "mrp": 25,  "cost_price": 14,  "discount": 20, "unit": "1 L",  "stock": 200,"image": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400", "category_id": cats["Beverages"],           "brand": "Bisleri",       "description": "Pure mineral water, safe to drink directly."},
            {"name": "Tropicana Orange Juice", "price": 85,  "mrp": 99,  "cost_price": 65,  "discount": 14, "unit": "1 L",  "stock": 35, "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400", "category_id": cats["Beverages"],           "brand": "Tropicana",     "description": "100% pure orange juice with no added sugar."},
            # Snacks
            {"name": "Lays Classic Salted",    "price": 20,  "mrp": 20,  "cost_price": 14,  "discount": 0,  "unit": "26g",  "stock": 100,"image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400", "category_id": cats["Snacks & Munchies"],   "brand": "Lays",          "description": "Classic salted wafer chips. The perfect evening snack."},
            {"name": "Parle-G Biscuits",       "price": 10,  "mrp": 10,  "cost_price": 7,   "discount": 0,  "unit": "100g", "stock": 200,"image": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", "category_id": cats["Snacks & Munchies"],   "brand": "Parle",         "description": "India's favourite glucose biscuit. A classic since 1939."},
            {"name": "Haldiram's Bhujia",      "price": 50,  "mrp": 60,  "cost_price": 38,  "discount": 16, "unit": "200g", "stock": 60, "image": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400", "category_id": cats["Snacks & Munchies"],   "brand": "Haldiram's",    "description": "Crispy and spicy bhujia sev from the house of Haldirams."},
            # Spices
            {"name": "Chicken Masala",         "price": 65,  "mrp": 75,  "cost_price": 50,  "discount": 13, "unit": "100g", "stock": 55, "image": "https://images.unsplash.com/photo-1596797038558-9da3999a9142?w=400", "category_id": cats["Spices & Masala"],     "brand": "Catch",         "description": "Premium blend of spices for authentic Indian chicken curry.", "catch": "Authentic Indian Flavours"},
            {"name": "Turmeric Powder",        "price": 55,  "mrp": 65,  "cost_price": 40,  "discount": 15, "unit": "200g", "stock": 70, "image": "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=400", "category_id": cats["Spices & Masala"],     "brand": "MDH",           "description": "Pure ground turmeric with natural antiseptic properties."},
            {"name": "Red Chilli Powder",      "price": 45,  "mrp": 55,  "cost_price": 32,  "discount": 18, "unit": "100g", "stock": 65, "image": "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400", "category_id": cats["Spices & Masala"],     "brand": "MDH",           "description": "Fiery red chilli powder for that extra kick."},
            # Dry Fruits
            {"name": "Cashews",                "price": 280, "mrp": 340, "cost_price": 220, "discount": 17, "unit": "250g", "stock": 25, "image": "https://images.unsplash.com/photo-1563636619-e9107da5a76a?w=400", "category_id": cats["Dry Fruits & Nuts"],   "brand": "John Miller",   "description": "Premium grade W240 cashews roasted and lightly salted."},
            {"name": "Almonds",                "price": 350, "mrp": 400, "cost_price": 290, "discount": 12, "unit": "250g", "stock": 20, "image": "https://images.unsplash.com/photo-1574570069479-7a66d7c4bb1e?w=400", "category_id": cats["Dry Fruits & Nuts"],   "brand": "Happilo",       "description": "California almonds, rich in protein and nutrients."},
            # Personal Care
            {"name": "Dove Soap",              "price": 85,  "mrp": 95,  "cost_price": 65,  "discount": 10, "unit": "4 pcs","stock": 40, "image": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400", "category_id": cats["Personal Care"],       "brand": "Dove",          "description": "Gentle cleansing soap with 1/4 moisturising cream."},
            {"name": "Head & Shoulders",       "price": 290, "mrp": 340, "cost_price": 230, "discount": 14, "unit": "340ml","stock": 30, "image": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400", "category_id": cats["Personal Care"],       "brand": "H&S",           "description": "Anti-dandruff shampoo for clean and healthy scalp."},
            # Household
            {"name": "Vim Dishwash Bar",       "price": 25,  "mrp": 30,  "cost_price": 18,  "discount": 16, "unit": "135g", "stock": 80, "image": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400", "category_id": cats["Household"],           "brand": "Vim",           "description": "Powerful dish wash bar that cuts through grease effortlessly."},
            {"name": "Surf Excel",             "price": 110, "mrp": 130, "cost_price": 85,  "discount": 15, "unit": "500g", "stock": 50, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "category_id": cats["Household"],           "brand": "Surf Excel",    "description": "Best-in-class detergent powder for fresh, clean laundry."},
        ]

        for prod in products_data:
            if not db.query(models.Product).filter(models.Product.name == prod["name"]).first():
                prod.setdefault("stock", 50)
                db.add(models.Product(**prod))

        # 5. Delivery Slots
        slots_data = [
            {"name": "Morning",   "start_time": "08:00 AM", "end_time": "11:00 AM"},
            {"name": "Afternoon", "start_time": "12:00 PM", "end_time": "03:00 PM"},
            {"name": "Evening",   "start_time": "05:00 PM", "end_time": "08:00 PM"},
            {"name": "Night",     "start_time": "08:00 PM", "end_time": "10:00 PM"},
        ]
        for s in slots_data:
            if not db.query(models.DeliverySlot).filter(models.DeliverySlot.name == s["name"]).first():
                db.add(models.DeliverySlot(**s))

        # 6. Coupons
        coupons_data = [
            {"code": "WELCOME10", "discount_value": 10.0, "is_percentage": True,  "min_order_amount": 0.0,   "active": True},
            {"code": "FRESH50",   "discount_value": 50.0, "is_percentage": False, "min_order_amount": 200.0, "active": True},
            {"code": "SAVE20",    "discount_value": 20.0, "is_percentage": True,  "min_order_amount": 150.0, "active": True},
        ]
        for c in coupons_data:
            if not db.query(models.Coupon).filter(models.Coupon.code == c["code"]).first():
                db.add(models.Coupon(**c))

        db.commit()
        print("✅ Database seeded with full dummy data!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
