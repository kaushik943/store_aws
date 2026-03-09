from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="customer")
    street_address = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    landmark = Column(String, nullable=True)
    otp = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    
    orders = relationship("Order", back_populates="user", foreign_keys="Order.user_id")
    rider_orders = relationship("Order", back_populates="rider", foreign_keys="Order.rider_id")
    packed_orders = relationship("Order", back_populates="packed_by", foreign_keys="Order.packed_by_id")
    
    addresses = relationship("UserAddress", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")

class UserAddress(Base):
    __tablename__ = "user_addresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    street_address = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    landmark = Column(String, nullable=True)
    is_default = Column(Integer, default=0)
    
    user = relationship("User", back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    icon = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    subcategories = relationship("SubCategory", back_populates="category")
    products = relationship("Product", back_populates="category")

class SubCategory(Base):
    __tablename__ = "subcategories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    category = relationship("Category", back_populates="subcategories")
    products = relationship("Product", back_populates="subcategory")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, unique=True, nullable=True) # PRD_...
    name = Column(String)
    description = Column(Text, nullable=True)
    price = Column(Float)
    cost_price = Column(Float, default=0.0)
    mrp = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    unit = Column(String)
    image = Column(String)
    stock = Column(Integer, default=0)
    out_of_stock = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=True)
    
    # Detailed Info
    brand = Column(String, nullable=True)
    catch = Column(String, nullable=True)
    product_type = Column(String, nullable=True)
    mfg_date = Column(String, nullable=True)
    country_of_origin = Column(String, default="India")
    specifications = Column(JSON, nullable=True) # JSON dict
    manufacturer_name = Column(String, nullable=True)
    manufacturer_address = Column(Text, nullable=True)
    seller_name = Column(String, default="AK Store Retail")
    customer_care_details = Column(Text, nullable=True)
    disclaimer = Column(Text, nullable=True)

    category = relationship("Category", back_populates="products")
    subcategory = relationship("SubCategory", back_populates="products")
    reviews = relationship("Review", back_populates="product")

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True)
    discount_value = Column(Float)
    is_percentage = Column(Boolean, default=False)
    min_order_amount = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    active = Column(Boolean, default=True)

class DeliverySlot(Base):
    __tablename__ = "delivery_slots"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String) # Morning, Evening, etc.
    start_time = Column(String)
    end_time = Column(String)
    is_active = Column(Boolean, default=True)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    product = relationship("Product", back_populates="reviews")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rider_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    packed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=True)
    delivery_slot_id = Column(Integer, ForeignKey("delivery_slots.id"), nullable=True)
    
    total = Column(Float)
    discount_amount = Column(Float, default=0.0)
    status = Column(String, default="pending")
    address_id = Column(Integer, ForeignKey("user_addresses.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    rider = relationship("User", back_populates="rider_orders", foreign_keys=[rider_id])
    packed_by = relationship("User", back_populates="packed_orders", foreign_keys=[packed_by_id])
    
    address = relationship("UserAddress")
    order_items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float) # Selling price at time of order
    is_checked = Column(Integer, default=0)
    
    order = relationship("Order", back_populates="order_items")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")
