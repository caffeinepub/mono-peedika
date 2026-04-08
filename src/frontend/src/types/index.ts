export type ProductId = string;
export type OrderId = string;

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number; // in paise
  discountPercent: number;
  rating: number;
  reviewCount: number;
  stockQty: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export enum PaymentMethod {
  UPI = "UPI",
  COD = "COD",
}

export enum OrderStatus {
  Pending = "Pending",
  Paid = "Paid",
  Shipped = "Shipped",
  Delivered = "Delivered",
}

export interface OrderItem {
  productId: ProductId;
  productName: string;
  qty: number;
  priceAtOrder: number; // in paise
}

export interface Order {
  id: OrderId;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number; // in paise
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  upiTransactionId?: string;
  status: OrderStatus;
  createdAt: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  upiTransactionId?: string;
  items: OrderItem[];
}
