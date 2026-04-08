import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { discountedPrice, formatPrice } from "@/utils/format";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalPrice } =
    useCartStore();
  const navigate = useNavigate();
  const total = totalPrice();

  if (items.length === 0) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4"
        data-ocid="cart-empty-state"
      >
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Looks like you haven't added anything yet. Browse our collection and
            find something you love.
          </p>
        </div>
        <Button
          asChild
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link to="/" data-ocid="cart-shop-now-btn">
            Shop Now
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Shopping Cart
          <span className="ml-2 text-muted-foreground text-base font-normal">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          data-ocid="cart-clear-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear all
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4" data-ocid="cart-items-list">
          {items.map((item) => {
            const effectivePrice = discountedPrice(
              item.product.price,
              item.product.discountPercent,
            );
            const lineTotal = effectivePrice * item.qty;

            return (
              <div
                key={item.product.id}
                className="bg-card border border-border rounded-xl p-4 flex gap-4"
                data-ocid={`cart-item-${item.product.id}`}
              >
                {/* Product Image */}
                <Link
                  to="/product/$id"
                  params={{ id: item.product.id }}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted/40 overflow-hidden border border-border/50">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to="/product/$id"
                      params={{ id: item.product.id }}
                      className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-accent font-bold text-sm">
                        {formatPrice(effectivePrice)}
                      </span>
                      {item.product.discountPercent > 0 && (
                        <span className="text-muted-foreground line-through text-xs">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 gap-2">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-1 bg-muted/60 rounded-lg border border-border/50 p-0.5">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-foreground hover:bg-card hover:text-accent transition-colors"
                        data-ocid={`cart-qty-dec-${item.product.id}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-foreground">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                        disabled={item.qty >= item.product.stockQty}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-foreground hover:bg-card hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        data-ocid={`cart-qty-inc-${item.product.id}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(lineTotal)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.product.name}`}
                        onClick={() => removeItem(item.product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        data-ocid={`cart-remove-${item.product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div
            className="bg-card border border-border rounded-xl p-5 sticky top-20"
            data-ocid="cart-order-summary"
          >
            <h2 className="font-display font-bold text-foreground text-lg mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              {items.map((item) => {
                const ep = discountedPrice(
                  item.product.price,
                  item.product.discountPercent,
                );
                return (
                  <div
                    key={item.product.id}
                    className="flex justify-between gap-2"
                  >
                    <span className="text-muted-foreground truncate flex-1 min-w-0">
                      {item.product.name}{" "}
                      <span className="text-muted-foreground/60">
                        ×{item.qty}
                      </span>
                    </span>
                    <span className="text-foreground font-medium flex-shrink-0">
                      {formatPrice(ep * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4 bg-border/50" />

            <div className="flex justify-between items-center mb-1">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-foreground font-semibold">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground text-sm">Delivery</span>
              <span className="text-green-400 text-sm font-medium">Free</span>
            </div>

            <Separator className="my-4 bg-border/50" />

            <div className="flex justify-between items-center mb-5">
              <span className="font-display font-bold text-foreground text-base">
                Total
              </span>
              <span className="font-display font-black text-accent text-xl">
                {formatPrice(total)}
              </span>
            </div>

            <Button
              onClick={() => navigate({ to: "/checkout" })}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-11 gap-2"
              data-ocid="cart-checkout-btn"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Link
              to="/"
              className="block text-center mt-3 text-sm text-muted-foreground hover:text-accent transition-colors"
              data-ocid="cart-continue-shopping-link"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
