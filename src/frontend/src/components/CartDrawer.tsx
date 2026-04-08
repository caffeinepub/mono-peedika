import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { discountedPrice, formatPrice } from "@/utils/format";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, totalPrice } =
    useCartStore();
  const navigate = useNavigate();

  function handleCheckout() {
    closeCart();
    navigate({ to: "/checkout" });
  }

  function handleBackdropKey(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter") closeCart();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={closeCart}
        onKeyDown={handleBackdropKey}
        role="presentation"
        aria-hidden="true"
      />

      {/* Drawer */}
      <dialog
        open={isOpen}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-card border-l border-border shadow-elevated flex flex-col transition-transform duration-300 ease-in-out m-0 p-0 max-h-none",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        data-ocid="cart-drawer"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Your Cart
            </h2>
            {items.length > 0 && (
              <span className="badge-accent text-[10px] px-2 py-0.5">
                {items.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close cart"
            data-ocid="cart-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center"
              data-ocid="cart-empty"
            >
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
              <p className="font-display font-semibold text-foreground text-lg">
                Cart is empty
              </p>
              <p className="text-muted-foreground text-sm">
                Add some products to get started!
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 px-6 py-2 bg-accent text-accent-foreground rounded-md font-semibold text-sm hover:opacity-90 transition-smooth"
                data-ocid="continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((item) => {
                const finalPrice = discountedPrice(
                  item.product.price,
                  item.product.discountPercent,
                );
                return (
                  <li
                    key={item.product.id}
                    className="flex gap-3 px-4 py-3"
                    data-ocid="cart-item"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                      <img
                        src={
                          item.product.imageUrl ||
                          "/assets/images/placeholder.svg"
                        }
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {formatPrice(finalPrice)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-border rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.product.id, item.qty - 1)
                            }
                            className="px-2 py-1 hover:bg-muted transition-colors text-foreground"
                            aria-label="Decrease quantity"
                            data-ocid="qty-decrease-btn"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 text-sm font-bold tabular-nums border-x border-border">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.product.id, item.qty + 1)
                            }
                            className="px-2 py-1 hover:bg-muted transition-colors text-foreground"
                            aria-label="Increase quantity"
                            data-ocid="qty-increase-btn"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          aria-label="Remove item"
                          data-ocid="remove-item-btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="border-t border-border px-4 py-4 space-y-3"
            data-ocid="cart-footer"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-lg font-bold font-display text-foreground">
                {formatPrice(totalPrice())}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes and shipping calculated at checkout
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-md hover:opacity-90 transition-smooth text-sm"
              data-ocid="checkout-btn"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
