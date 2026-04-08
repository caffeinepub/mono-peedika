import Types "../types/products-orders";
import Lib "../lib/products-orders";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  products : Map.Map<Types.ProductId, Types.Product>,
  orders : Map.Map<Types.OrderId, Types.Order>,
  initProductIdCounter : Nat,
  initOrderIdCounter : Nat,
) {
  var productIdCounter : Nat = initProductIdCounter;
  var orderIdCounter : Nat = initOrderIdCounter;

  // ── Products ──────────────────────────────────────────────────────────────

  public shared func addProduct(req : Types.AddProductRequest) : async Types.Product {
    let now = Time.now();
    let (product, newCounter) = Lib.addProduct(products, productIdCounter, req, now);
    productIdCounter := newCounter;
    product
  };

  public shared func updateProduct(req : Types.UpdateProductRequest) : async ?Types.Product {
    let now = Time.now();
    Lib.updateProduct(products, req, now)
  };

  public shared func deleteProduct(id : Types.ProductId) : async Bool {
    Lib.deleteProduct(products, id)
  };

  public query func getProduct(id : Types.ProductId) : async ?Types.Product {
    Lib.getProduct(products, id)
  };

  public query func listProducts() : async [Types.Product] {
    Lib.listProducts(products)
  };

  public query func searchProducts(searchTerm : Text) : async [Types.Product] {
    Lib.searchProducts(products, searchTerm)
  };

  public query func getFeaturedProducts(tag : Text) : async [Types.Product] {
    Lib.getFeaturedProducts(products, tag)
  };

  // ── Orders ────────────────────────────────────────────────────────────────

  public shared func createOrder(req : Types.CreateOrderRequest) : async Types.Order {
    // Validate: UPI orders must supply a 12-digit transaction ID
    switch (req.paymentMethod) {
      case (#UPI) {
        switch (req.upiTransactionId) {
          case null Runtime.trap("UPI orders require a transaction ID");
          case (?txId) {
            if (txId.size() != 12) {
              Runtime.trap("UPI transaction ID must be 12 digits")
            }
          };
        }
      };
      case (#COD) {};
    };
    let now = Time.now();
    let (order, newCounter) = Lib.createOrder(orders, products, orderIdCounter, req, now);
    orderIdCounter := newCounter;
    order
  };

  public query func getOrder(id : Types.OrderId) : async ?Types.Order {
    Lib.getOrder(orders, id)
  };

  public query func listOrders() : async [Types.Order] {
    Lib.listOrders(orders)
  };

  public shared func updateOrderStatus(id : Types.OrderId, status : Types.OrderStatus) : async ?Types.Order {
    Lib.updateOrderStatus(orders, id, status)
  };

  public query func getOrdersByCustomer(customerId : Text) : async [Types.Order] {
    Lib.getOrdersByCustomer(orders, customerId)
  };
};
