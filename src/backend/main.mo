import Types "types/products-orders";
import ProductsOrdersApi "mixins/products-orders-api";
import Map "mo:core/Map";
import Time "mo:core/Time";

actor {
  let products = Map.empty<Types.ProductId, Types.Product>();
  let orders = Map.empty<Types.OrderId, Types.Order>();

  // ── Sample data seeding ───────────────────────────────────────────────────
  // Pre-populate products on first canister deployment (map is empty at init)

  let seedCount : Nat = do {
    if (not products.isEmpty()) {
      // Already seeded — return current product count so mixin counter is correct
      products.size()
    } else {
      let now = Time.now();
      var counter : Nat = 0;
      let samples : [(Text, Text, Text, Nat, Nat, Nat, Float, Nat, Text, [Text])] = [
        (
          "Wireless Bluetooth Headphones",
          "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design.",
          "Electronics",
          2999, 20, 50, 4.5, 128,
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          ["best-seller", "electronics", "audio"],
        ),
        (
          "Mechanical Keyboard RGB",
          "Compact tenkeyless mechanical keyboard with Cherry MX switches, full RGB backlight, and detachable cable.",
          "Electronics",
          4499, 10, 30, 4.7, 89,
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
          ["electronics", "gaming", "best-seller"],
        ),
        (
          "Running Shoes Pro",
          "Lightweight running shoes with cushioned sole, breathable mesh upper, and anti-slip grip.",
          "Footwear",
          1799, 30, 80, 4.3, 215,
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
          ["deals", "footwear", "sports"],
        ),
        (
          "Stainless Steel Water Bottle",
          "Insulated double-wall bottle, keeps drinks cold 24h and hot 12h. 750ml capacity.",
          "Kitchen",
          699, 15, 120, 4.6, 342,
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
          ["deals", "kitchen", "best-seller"],
        ),
        (
          "Smart Watch Fitness Tracker",
          "Smartwatch with heart rate monitor, SpO2 sensor, GPS, sleep tracking, and 7-day battery life.",
          "Electronics",
          5999, 25, 25, 4.4, 176,
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          ["deals", "electronics", "wearables"],
        ),
        (
          "Organic Cotton T-Shirt",
          "100% organic cotton crew-neck t-shirt. Soft, breathable, and sustainably sourced.",
          "Clothing",
          499, 0, 200, 4.2, 88,
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
          ["clothing", "sustainable"],
        ),
        (
          "Portable Power Bank 20000mAh",
          "High-capacity power bank with dual USB-A and USB-C ports. Fast charging support.",
          "Electronics",
          1299, 18, 60, 4.5, 253,
          "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
          ["best-seller", "electronics", "accessories"],
        ),
        (
          "Yoga Mat Anti-Slip",
          "Extra-thick 6mm yoga mat with non-slip surface, alignment lines, and carrying strap.",
          "Sports",
          899, 12, 45, 4.4, 134,
          "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400",
          ["sports", "deals", "fitness"],
        ),
      ];
      for ((name, desc, cat, price, disc, stock, rating, reviews, img, tags) in samples.values()) {
        counter += 1;
        let product : Types.Product = {
          id = "P" # counter.toText();
          name;
          description = desc;
          category = cat;
          price;
          discountPercent = disc;
          stockQty = stock;
          rating;
          reviewCount = reviews;
          imageUrl = img;
          tags;
          createdAt = now;
          updatedAt = now;
        };
        products.add(product.id, product);
      };
      counter
    }
  };

  // Include mixin with counter initialized past seeded products
  include ProductsOrdersApi(products, orders, seedCount, 0);
};
