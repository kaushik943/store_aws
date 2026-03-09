export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'executive' | 'admin';
  street_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  token?: string;
}

export interface UserAddress {
  id: number;
  user_id: number;
  name: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default: boolean;
}

export interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  total: number;
  status: string;
  created_at: string;
  address_id?: number | null;
  address?: string | null;
  discount_amount: number;
  order_items?: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  is_checked: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  image_url?: string;
  parent_id?: number | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  cost_price?: number;
  mrp?: number;
  discount?: number;
  description?: string;
  unit: string;
  image: string;
  category_id: number;
  stock: number;
  highlights?: string;
  brand?: string;
  catch?: string;
  product_id?: string;
  mfg_date?: string;
  country_of_origin?: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}
