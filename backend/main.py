import os
import random
import smtplib
from smtplib import SMTP_SSL
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header, Body, Request, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from pydantic import BaseModel
import shutil
import uuid

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .database import engine, Base, get_db
from . import models, schemas

# Initialize DB
Base.metadata.create_all(bind=engine)

load_dotenv()
app = FastAPI()

# ---- Authentication & Email logic ----

def send_otp_email(email: str, otp: str):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    if not smtp_email or not smtp_pass:
        print(f"[DEV MODE] OTP for {email} is {otp}")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = email
    msg['Subject'] = 'Your FreshDash Login OTP'
    msg.attach(MIMEText(f'Your OTP for login is: {otp}. It is valid for 10 minutes.', 'plain'))

    try:
        # Using Port 465 (SSL) for better reliability on restricted networks
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(str(smtp_email), str(smtp_pass))
            server.sendmail(str(smtp_email), email, msg.as_string())
    except Exception as e:
        print(f"Error sending email: {e}")
        # Try fallback to 587 if 465 fails
        try:
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(str(smtp_email), str(smtp_pass))
                server.sendmail(str(smtp_email), email, msg.as_string())
        except Exception as e2:
            print(f"Error on fallback Port 587: {e2}")
            raise HTTPException(status_code=500, detail="Failed to send OTP email")

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    # For now, token is just user id
    user = db.query(models.User).filter(models.User.id == int(authorization)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def get_current_admin(user: models.User = Depends(get_current_user)):
    role = (user.role or "").strip().lower()
    if role != "admin":
        raise HTTPException(status_code=403, detail=f"Requires Admin role. Current role: {user.role}")
    return user

def get_current_executive(user: models.User = Depends(get_current_user)):
    role = (user.role or "").strip().lower()
    if role not in ["executive", "admin"]:
        raise HTTPException(status_code=403, detail=f"Requires Admin or Executive role. Current role: {user.role}")
    return user

# ---- API ROUTES ----

@app.post("/api/auth/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter((models.User.email == user.email) | (models.User.phone == user.phone)).first()
    if existing:
        return JSONResponse(status_code=400, content={"error": "Email or Phone already exists"})
    db_user = models.User(
        name=user.name, 
        email=user.email, 
        phone=user.phone, 
        password=user.password, 
        role=user.role or "customer",
        street_address=user.street_address,
        city=user.city,
        state=user.state,
        pincode=user.pincode,
        landmark=user.landmark
    )
    db.add(db_user)
    db.flush() # Get user id
    
    # Also add it to user_addresses table for checkout selection
    db_addr = models.UserAddress(
        user_id=db_user.id,
        name="Home (Default)",
        street_address=user.street_address,
        city=user.city,
        state=user.state,
        pincode=user.pincode,
        landmark=user.landmark,
        is_default=1
    )
    db.add(db_addr)
    db.commit()
    return {"success": True}

@app.post("/api/auth/login")
def login(creds: schemas.AuthLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == creds.phone, models.User.password == creds.password).first()
    if user:
        return {
            "id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "role": user.role, "token": str(user.id),
            "street_address": user.street_address, "city": user.city, "state": user.state, "pincode": user.pincode, "landmark": user.landmark
        }
    return JSONResponse(status_code=401, content={"error": "Invalid phone number or password"})

@app.post("/api/auth/request-otp")
def request_otp(creds: schemas.AuthOtp, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == creds.phone).first()
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})
    
    otp = str(random.randint(100000, 999999))
    expiry = datetime.now() + timedelta(minutes=10)
    user.otp = otp
    user.otp_expiry = expiry
    db.commit()

    send_otp_email(user.email, otp)
    return {"success": True, "message": "OTP sent to registered email"}

@app.post("/api/auth/verify-otp")
def verify_otp(creds: schemas.VerifyOtp, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == creds.phone).first()
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})
    if user.otp != creds.otp:
        return JSONResponse(status_code=400, content={"error": "Invalid OTP"})
    if not user.otp_expiry or user.otp_expiry < datetime.now():
        return JSONResponse(status_code=400, content={"error": "OTP expired"})

    user.otp = None
    user.otp_expiry = None
    db.commit()
    db.commit()
    return {
        "id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "role": user.role, "token": str(user.id),
        "street_address": user.street_address, "city": user.city, "state": user.state, "pincode": user.pincode, "landmark": user.landmark
    }

@app.post("/api/auth/admin-login")
def admin_login(creds: schemas.AuthLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == creds.phone, models.User.password == creds.password, models.User.role == "admin").first()
    if user:
         return {
             "id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "role": user.role, "token": str(user.id),
             "street_address": user.street_address, "city": user.city, "state": user.state, "pincode": user.pincode, "landmark": user.landmark
         }
    return JSONResponse(status_code=401, content={"error": "Invalid admin credentials"})

# User Management routes (Added Admin User Management)
@app.get("/api/admin/users")
def get_users(admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    res = []
    for u in users:
        cart_total = sum(item.product.price * item.quantity for item in u.cart_items)
        res.append({
            "id": u.id, "name": u.name, "email": u.email, "phone": u.phone, "role": u.role,
            "address": f"{u.street_address}, {u.city}, {u.state} - {u.pincode}",
            "cart_count": len(u.cart_items),
            "cart_total": cart_total
        })
    return res

@app.get("/api/admin/users/{user_id}/cart")
def get_user_cart_admin(user_id: int, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    res = []
    for item in u.cart_items:
        res.append({
            "product_id": item.product_id,
            "product_name": item.product.name,
            "product_image": item.product.image,
            "product_price": item.product.price,
            "quantity": item.quantity
        })
    return res

class UserUpdate(BaseModel):
    name: str
    phone: str
    email: str
    role: str

@app.put("/api/admin/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        return JSONResponse(status_code=404, content={"error": "User not found"})
    u.name = user_data.name
    u.phone = user_data.phone
    u.email = user_data.email
    u.role = user_data.role
    db.commit()
    return {"success": True}

class OrderStatusUpdate(BaseModel):
    status: str

@app.put("/api/admin/orders/{order_id}/status")
def update_order_status(order_id: int, data: OrderStatusUpdate, staff: models.User = Depends(get_current_executive), db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    db.commit()
    return {"success": True}

@app.get("/api/executive/orders")
def get_executive_orders(executive: models.User = Depends(get_current_executive), db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    res = []
    for o in orders:
        items = []
        for i in o.order_items:
            prod = db.query(models.Product).filter(models.Product.id == i.product_id).first()
            items.append({
                "id": i.id, "product_name": prod.name if prod else "Unknown",
                "quantity": i.quantity, "price": i.price, "is_checked": bool(i.is_checked)
            })
        
        addr_info = None
        if o.address_id:
            db_addr = db.query(models.UserAddress).filter(models.UserAddress.id == o.address_id).first()
            if db_addr:
                addr_info = f"{db_addr.name}: {db_addr.street_address}, {db_addr.city}, {db_addr.pincode}"
                
        res.append({
            "id": o.id, "user_name": o.user.name, "total": o.total, "status": o.status,
            "created_at": o.created_at.isoformat(), "items": items,
            "address": addr_info if addr_info else f"DEFAULT: {o.user.street_address}, {o.user.city}, {o.user.state} - {o.user.pincode}"
        })
    return res

@app.put("/api/executive/items/{item_id}/pick")
def pick_item(item_id: int, data: schemas.PickItemStatus, staff: models.User = Depends(get_current_executive), db: Session = Depends(get_db)):
    item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_checked = 1 if data.is_checked else 0
    db.commit()
    return {"success": True}

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if u:
        db.delete(u)
        db.commit()
        return {"success": True}
    return JSONResponse(status_code=404, content={"error": "User not found"})

class UserRoleUpdate(BaseModel):
    role: str

@app.put("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, data: UserRoleUpdate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    db.commit()
    return {"success": True}

# Products and Categories

@app.get("/api/categories")
def get_categories(parent: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Category)
    if parent == -1: # Root categories only
        query = query.filter(models.Category.parent_id == None)
    elif parent:
        query = query.filter(models.Category.parent_id == parent)
    return query.all()

@app.post("/api/admin/categories")
def add_category(cat: schemas.CategoryCreate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_cat = models.Category(
        name=cat.name, 
        icon=cat.icon, 
        image_url=cat.image_url, 
        parent_id=cat.parent_id
    )
    db.add(new_cat)
    db.commit()
    return {"id": new_cat.id}

@app.post("/api/admin/upload")
def upload_file(file: UploadFile = File(...), admin: models.User = Depends(get_current_admin)):
    # Always use absolute path relative to this file, regardless of cwd
    upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/uploads/{file_name}"}

# User Address Management
@app.get("/api/user/addresses", response_model=List[schemas.UserAddressResponse])
def get_user_addresses(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user.addresses

@app.post("/api/user/addresses", response_model=schemas.UserAddressResponse)
def add_user_address(address: schemas.UserAddressCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_addr = models.UserAddress(**address.dict(), user_id=user.id)
    db.add(db_addr)
    db.commit()
    db.refresh(db_addr)
    return db_addr

@app.delete("/api/user/addresses/{address_id}")
def delete_user_address(address_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    addr = db.query(models.UserAddress).filter(models.UserAddress.id == address_id, models.UserAddress.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return {"success": True}

# Cart Management
@app.get("/api/user/cart")
def get_own_cart(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = []
    for item in user.cart_items:
        res.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name,
            "product_image": item.product.image,
            "product_price": item.product.price,
            "quantity": item.quantity
        })
    return res

@app.post("/api/user/cart/sync")
def sync_cart(items: List[schemas.CartItemCreate], user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Clear old cart
    db.query(models.CartItem).filter(models.CartItem.user_id == user.id).delete()
    # Add new items
    for item in items:
        db.add(models.CartItem(user_id=user.id, product_id=item.product_id, quantity=item.quantity))
    db.commit()
    return {"success": True}

# Removed Pickup Locations as per user request

@app.get("/api/products")
def get_products(category: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category_id == category)
    return query.all()

@app.get("/api/products/search")
def search_products(q: str = "", db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.name.ilike(f"%{q}%")).all()

@app.post("/api/admin/products")
def add_product(prod: schemas.ProductCreate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_prod = models.Product(**prod.dict())
    db.add(new_prod)
    db.commit()
    return {"id": new_prod.id}

@app.put("/api/admin/products/{product_id}")
def update_product(product_id: int, prod: schemas.ProductCreate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if p:
        for k, v in prod.dict().items():
            setattr(p, k, v)
        db.commit()
        return {"success": True}
    return JSONResponse(status_code=404, content={"error": "Product not found"})

@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, password: str = "", admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if admin.password != password:
        return JSONResponse(status_code=403, content={"error": "Invalid password"})
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if p:
        db.delete(p)
        db.commit()
        return {"success": True}
    return JSONResponse(status_code=404, content={"error": "Product not found"})

@app.delete("/api/admin/orders/{order_id}")
def delete_order(order_id: int, password: str = "", admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if admin.password != password:
        return JSONResponse(status_code=403, content={"error": "Invalid password"})
    o = db.query(models.Order).filter(models.Order.id == order_id).first()
    if o:
        db.delete(o)
        db.commit()
        return {"success": True}
    return JSONResponse(status_code=404, content={"error": "Order not found"})

# Reviews
@app.get("/api/products/{product_id}/reviews")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review, models.User).join(models.User, models.Review.user_id == models.User.id).filter(models.Review.product_id == product_id).order_by(models.Review.created_at.desc()).all()
    res = []
    for r, u in reviews:
        res.append({
            "id": r.id, "product_id": r.product_id, "user_id": r.user_id,
            "rating": r.rating, "comment": r.comment, "created_at": r.created_at,
            "user_name": u.name
        })
    return res

@app.post("/api/products/{product_id}/reviews")
def add_review(product_id: int, review: schemas.ReviewCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_review = models.Review(product_id=product_id, user_id=user.id, rating=review.rating, comment=review.comment)
    db.add(new_review)
    db.commit()
    return {"id": new_review.id, "success": True}
# Coupons & Delivery Slots
@app.get("/api/delivery-slots", response_model=List[schemas.DeliverySlotResponse])
def get_delivery_slots(db: Session = Depends(get_db)):
    return db.query(models.DeliverySlot).filter(models.DeliverySlot.is_active == True).all()

@app.post("/api/admin/delivery-slots", response_model=schemas.DeliverySlotResponse)
def add_delivery_slot(slot: schemas.DeliverySlotCreate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_slot = models.DeliverySlot(**slot.dict())
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

@app.delete("/api/admin/delivery-slots/{slot_id}")
def delete_delivery_slot(slot_id: int, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    slot = db.query(models.DeliverySlot).filter(models.DeliverySlot.id == slot_id).first()
    if slot:
        db.delete(slot)
        db.commit()
        return {"success": True}
    return JSONResponse(status_code=404, content={"error": "Slot not found"})

@app.get("/api/admin/coupons", response_model=List[schemas.CouponResponse])
def get_coupons(admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(models.Coupon).all()

@app.post("/api/admin/coupons", response_model=schemas.CouponResponse)
def add_coupon(coupon: schemas.CouponCreate, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_coupon = models.Coupon(**coupon.dict())
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@app.delete("/api/admin/coupons/{coupon_id}")
def delete_coupon(coupon_id: int, admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if coupon:
        db.delete(coupon)
        db.commit()
        return {"success": True}
    return JSONResponse(status_code=404, content={"error": "Coupon not found"})

class CouponValidateRequest(BaseModel):
    code: str
    cart_total: float

@app.post("/api/coupons/validate")
def validate_coupon(req: CouponValidateRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.code == req.code, models.Coupon.active == True).first()
    if not coupon:
        return JSONResponse(status_code=400, content={"error": "Invalid or expired coupon code"})
    
    if coupon.min_order_amount and req.cart_total < coupon.min_order_amount:
        return JSONResponse(status_code=400, content={"error": f"Minimum order amount for this coupon is ₹{coupon.min_order_amount}"})
        
    if coupon.user_id and coupon.user_id != user.id:
        return JSONResponse(status_code=400, content={"error": "This coupon is not applicable to your account"})
        
    discount = coupon.discount_value
    if coupon.is_percentage:
        discount = (coupon.discount_value / 100) * req.cart_total
        
    return {"success": True, "discount_amount": discount, "coupon_id": coupon.id}


# Orders & Stats
@app.get("/api/admin/stats")
def get_admin_stats(admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_orders = db.query(models.Order).count()
    # Calculate profit: sum(quantity * (sp - cp))
    total_profit = db.query(
        func.sum((models.OrderItem.price - models.Product.cost_price) * models.OrderItem.quantity)
    ).join(models.Product, models.OrderItem.product_id == models.Product.id).scalar() or 0
    
    total_users = db.query(models.User).count()
    low_stock = db.query(models.Product).filter(models.Product.stock <= 10).count()
    return {
        "revenue": round(total_profit, 2),
        "total_orders": total_orders,
        "total_users": total_users,
        "low_stock": low_stock
    }

@app.get("/api/admin/orders")
def get_admin_orders(admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    orders = db.query(models.Order, models.User).join(models.User, models.Order.user_id == models.User.id).order_by(models.Order.created_at.desc()).all()
    res = []
    for o, u in orders:
        items = []
        for i in o.order_items:
            prod = db.query(models.Product).filter(models.Product.id == i.product_id).first()
            items.append({
                "id": i.id,
                "product_id": i.product_id,
                "product_name": prod.name if prod else "Unknown Product",
                "quantity": i.quantity,
                "price": i.price
            })
        res.append({
            "id": o.id, 
            "total": o.total, 
            "status": o.status, 
            "created_at": o.created_at, 
            "user_name": u.name,
            "discount_amount": o.discount_amount or 0.0,
            "order_items": items
        })
    return res

@app.get("/api/orders")
def get_orders(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user.id).order_by(models.Order.created_at.desc()).all()
    res = []
    for o in orders:
        items = []
        for i in o.order_items:
            prod = db.query(models.Product).filter(models.Product.id == i.product_id).first()
            items.append({
                "id": i.id,
                "product_id": i.product_id,
                "product_name": prod.name if prod else "Unknown Product",
                "quantity": i.quantity,
                "price": i.price
            })
        res.append({
            "id": o.id,
            "total": o.total,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
            "address_id": o.address_id,
            "discount_amount": o.discount_amount or 0.0,
            "order_items": items
        })
    return res

@app.post("/api/orders")
def create_order(order: schemas.OrderCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_order = models.Order(
        user_id=user.id, 
        total=order.total - (order.discount_amount or 0.0), # Store order total after discount
        address_id=order.address_id,
        coupon_id=order.coupon_id,
        delivery_slot_id=order.delivery_slot_id,
        discount_amount=order.discount_amount or 0.0
    )
    db.add(new_order)
    db.flush()
    db.refresh(new_order)
    for item in order.items:
        db.add(models.OrderItem(order_id=new_order.id, product_id=item.id, quantity=item.quantity, price=item.price))
        # Update Stock
        product = db.query(models.Product).filter(models.Product.id == item.id).first()
        if product and product.stock is not None:
            product.stock = max(0, product.stock - item.quantity)
            if product.stock == 0:
                product.out_of_stock = True
            db.flush()
    # Clear user's cart
    db.query(models.CartItem).filter(models.CartItem.user_id == user.id).delete()
    db.commit()
    return {"id": new_order.id}


# Always mount /uploads so it works in both dev and production
upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Mount the Vite frontend (production build only)
dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")

if os.path.isdir(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    # Catch all route for SPA (React Router)
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404, detail="Route not found")
            
        file_path = os.path.join(dist_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(dist_path, "index.html"))
