export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  rating: number;
  review_count: number;
  is_trending: boolean;
  is_best_seller: boolean;
  is_deal: boolean;
  is_new: boolean;
  brand: string;
  stock_status: string;
  primary_image: string;
  images?: string[];
  stock_quantity?: number;
  reviews?: Review[];
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

export interface CartItem {
  cart_item_id: number;
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  quantity: number;
  primary_image: string;
  stock_status: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shipping_address_id: number;
  payment_method: string;
  payment_status: string;
  tracking_number: string;
  created_at: string;
  full_name?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  user_name?: string;
  user_email?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  slug: string;
  primary_image: string;
}

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}
