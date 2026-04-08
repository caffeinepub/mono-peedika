import Common "common";

module {
  public type ProductId = Common.ProductId;
  public type OrderId = Common.OrderId;
  public type Timestamp = Common.Timestamp;

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    category : Text;
    price : Nat;
    discountPercent : Nat;
    stockQty : Nat;
    rating : Float;
    reviewCount : Nat;
    imageUrl : Text;
    tags : [Text];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type AddProductRequest = {
    name : Text;
    description : Text;
    category : Text;
    price : Nat;
    discountPercent : Nat;
    stockQty : Nat;
    rating : Float;
    reviewCount : Nat;
    imageUrl : Text;
    tags : [Text];
  };

  public type UpdateProductRequest = {
    id : ProductId;
    name : Text;
    description : Text;
    category : Text;
    price : Nat;
    discountPercent : Nat;
    stockQty : Nat;
    rating : Float;
    reviewCount : Nat;
    imageUrl : Text;
    tags : [Text];
  };

  public type ShippingAddress = {
    addressLine1 : Text;
    addressLine2 : ?Text;
    city : Text;
    state : Text;
    postalCode : Text;
  };

  public type PaymentMethod = {
    #UPI;
    #COD;
  };

  public type OrderStatus = {
    #Pending;
    #Paid;
    #Shipped;
    #Delivered;
  };

  public type OrderItem = {
    productId : ProductId;
    productName : Text;
    qty : Nat;
    priceAtOrder : Nat;
  };

  public type Order = {
    id : OrderId;
    customerId : Text;
    customerName : Text;
    customerEmail : Text;
    customerPhone : Text;
    shippingAddress : ShippingAddress;
    items : [OrderItem];
    paymentMethod : PaymentMethod;
    upiTransactionId : ?Text;
    status : OrderStatus;
    totalAmount : Nat;
    createdAt : Timestamp;
  };

  public type CreateOrderRequest = {
    customerId : Text;
    customerName : Text;
    customerEmail : Text;
    customerPhone : Text;
    shippingAddress : ShippingAddress;
    items : [OrderItem];
    paymentMethod : PaymentMethod;
    upiTransactionId : ?Text;
  };
};
