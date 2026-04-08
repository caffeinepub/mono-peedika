import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrderId = string;
export type Timestamp = bigint;
export interface AddProductRequest {
    stockQty: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    discountPercent: bigint;
    imageUrl: string;
    category: string;
    rating: number;
    price: bigint;
    reviewCount: bigint;
}
export interface ShippingAddress {
    city: string;
    postalCode: string;
    state: string;
    addressLine1: string;
    addressLine2?: string;
}
export interface OrderItem {
    qty: bigint;
    productId: ProductId;
    productName: string;
    priceAtOrder: bigint;
}
export type ProductId = string;
export interface CreateOrderRequest {
    customerName: string;
    paymentMethod: PaymentMethod;
    customerPhone: string;
    upiTransactionId?: string;
    shippingAddress: ShippingAddress;
    customerId: string;
    items: Array<OrderItem>;
    customerEmail: string;
}
export interface Order {
    id: OrderId;
    customerName: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    customerPhone: string;
    createdAt: Timestamp;
    upiTransactionId?: string;
    totalAmount: bigint;
    shippingAddress: ShippingAddress;
    customerId: string;
    items: Array<OrderItem>;
    customerEmail: string;
}
export interface Product {
    id: ProductId;
    stockQty: bigint;
    name: string;
    createdAt: Timestamp;
    tags: Array<string>;
    description: string;
    discountPercent: bigint;
    updatedAt: Timestamp;
    imageUrl: string;
    category: string;
    rating: number;
    price: bigint;
    reviewCount: bigint;
}
export interface UpdateProductRequest {
    id: ProductId;
    stockQty: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    discountPercent: bigint;
    imageUrl: string;
    category: string;
    rating: number;
    price: bigint;
    reviewCount: bigint;
}
export enum OrderStatus {
    Paid = "Paid",
    Delivered = "Delivered",
    Shipped = "Shipped",
    Pending = "Pending"
}
export enum PaymentMethod {
    COD = "COD",
    UPI = "UPI"
}
export interface backendInterface {
    addProduct(req: AddProductRequest): Promise<Product>;
    createOrder(req: CreateOrderRequest): Promise<Order>;
    deleteProduct(id: ProductId): Promise<boolean>;
    getFeaturedProducts(tag: string): Promise<Array<Product>>;
    getOrder(id: OrderId): Promise<Order | null>;
    getOrdersByCustomer(customerId: string): Promise<Array<Order>>;
    getProduct(id: ProductId): Promise<Product | null>;
    listOrders(): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    updateOrderStatus(id: OrderId, status: OrderStatus): Promise<Order | null>;
    updateProduct(req: UpdateProductRequest): Promise<Product | null>;
}
