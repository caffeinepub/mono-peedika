import Types "../types/products-orders";
import Map "mo:core/Map";

module {
  public type ProductMap = Map.Map<Types.ProductId, Types.Product>;
  public type OrderMap = Map.Map<Types.OrderId, Types.Order>;

  // ── Products ──────────────────────────────────────────────────────────────

  public func addProduct(
    products : ProductMap,
    idCounter : Nat,
    req : Types.AddProductRequest,
    now : Types.Timestamp,
  ) : (Types.Product, Nat) {
    let newId = idCounter + 1;
    let product : Types.Product = {
      id = "P" # newId.toText();
      name = req.name;
      description = req.description;
      category = req.category;
      price = req.price;
      discountPercent = req.discountPercent;
      stockQty = req.stockQty;
      rating = req.rating;
      reviewCount = req.reviewCount;
      imageUrl = req.imageUrl;
      tags = req.tags;
      createdAt = now;
      updatedAt = now;
    };
    products.add(product.id, product);
    (product, newId)
  };

  public func updateProduct(
    products : ProductMap,
    req : Types.UpdateProductRequest,
    now : Types.Timestamp,
  ) : ?Types.Product {
    switch (products.get(req.id)) {
      case null null;
      case (?existing) {
        let updated : Types.Product = {
          existing with
          name = req.name;
          description = req.description;
          category = req.category;
          price = req.price;
          discountPercent = req.discountPercent;
          stockQty = req.stockQty;
          rating = req.rating;
          reviewCount = req.reviewCount;
          imageUrl = req.imageUrl;
          tags = req.tags;
          updatedAt = now;
        };
        products.add(req.id, updated);
        ?updated
      };
    }
  };

  public func deleteProduct(
    products : ProductMap,
    id : Types.ProductId,
  ) : Bool {
    if (products.containsKey(id)) {
      products.remove(id);
      true
    } else {
      false
    }
  };

  public func getProduct(
    products : ProductMap,
    id : Types.ProductId,
  ) : ?Types.Product {
    products.get(id)
  };

  public func listProducts(products : ProductMap) : [Types.Product] {
    products.values().toArray()
  };

  public func searchProducts(
    products : ProductMap,
    searchTerm : Text,
  ) : [Types.Product] {
    let lower = searchTerm.toLower();
    products.values().filter(func(p : Types.Product) : Bool {
      p.name.toLower().contains(#text lower) or
      p.description.toLower().contains(#text lower) or
      p.category.toLower().contains(#text lower)
    }).toArray()
  };

  public func getFeaturedProducts(
    products : ProductMap,
    tag : Text,
  ) : [Types.Product] {
    let lower = tag.toLower();
    products.values().filter(func(p : Types.Product) : Bool {
      p.tags.find<Text>(func(t) = t.toLower() == lower) != null
    }).toArray()
  };

  // ── Orders ────────────────────────────────────────────────────────────────

  public func createOrder(
    orders : OrderMap,
    products : ProductMap,
    idCounter : Nat,
    req : Types.CreateOrderRequest,
    now : Types.Timestamp,
  ) : (Types.Order, Nat) {
    let newId = idCounter + 1;
    // Compute total and decrement stock
    var total : Nat = 0;
    for (item in req.items.values()) {
      total += item.priceAtOrder * item.qty;
      switch (products.get(item.productId)) {
        case (?prod) {
          let newQty = if (prod.stockQty >= item.qty) prod.stockQty - item.qty else 0;
          products.add(item.productId, { prod with stockQty = newQty; updatedAt = now });
        };
        case null {};
      };
    };
    let orderId = "O" # newId.toText();
    let order : Types.Order = {
      id = orderId;
      customerId = req.customerId;
      customerName = req.customerName;
      customerEmail = req.customerEmail;
      customerPhone = req.customerPhone;
      shippingAddress = req.shippingAddress;
      items = req.items;
      paymentMethod = req.paymentMethod;
      upiTransactionId = req.upiTransactionId;
      status = #Pending;
      totalAmount = total;
      createdAt = now;
    };
    orders.add(orderId, order);
    (order, newId)
  };

  public func getOrder(orders : OrderMap, id : Types.OrderId) : ?Types.Order {
    orders.get(id)
  };

  public func listOrders(orders : OrderMap) : [Types.Order] {
    orders.values().toArray()
  };

  public func updateOrderStatus(
    orders : OrderMap,
    id : Types.OrderId,
    status : Types.OrderStatus,
  ) : ?Types.Order {
    switch (orders.get(id)) {
      case null null;
      case (?existing) {
        let updated : Types.Order = { existing with status };
        orders.add(id, updated);
        ?updated
      };
    }
  };

  public func getOrdersByCustomer(
    orders : OrderMap,
    customerId : Text,
  ) : [Types.Order] {
    orders.values().filter(func(o : Types.Order) : Bool {
      o.customerId == customerId
    }).toArray()
  };
};
