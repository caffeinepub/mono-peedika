import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import { discountedPrice, formatPrice } from "@/utils/format";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Zap } from "lucide-react";
import { StarRating } from "./StarRating";

interface ProductCardProps {
  product: Product;
  badge?: "best-seller" | "sale" | "new";
  className?: string;
}

export function ProductCard({ product, badge, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const finalPrice = discountedPrice(product.price, product.discountPercent);
  const hasDiscount = product.discountPercent > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCart();
  }

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className={cn(
        "card-product group flex flex-col cursor-pointer",
        className,
      )}
      data-ocid="product-card"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-muted/30">
        <img
          src={product.imageUrl || "/assets/images/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        {/* Badge */}
        {badge && (
          <div className="absolute top-2 left-2">
            {badge === "best-seller" && (
              <span className="badge-accent text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide">
                Best Seller
              </span>
            )}
            {badge === "sale" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold uppercase tracking-wide">
                <Zap className="w-2.5 h-2.5" />
                Sale
              </span>
            )}
            {badge === "new" && (
              <span className="inline-flex items-center px-2 py-0.5 bg-chart-3 text-foreground rounded-full text-[10px] font-bold uppercase tracking-wide">
                New
              </span>
            )}
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded px-1.5 py-0.5">
            -{product.discountPercent}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent truncate">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug min-w-0">
          {product.name}
        </h3>
        <StarRating
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="sm"
        />

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-foreground">
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stockQty === 0}
          className={cn(
            "mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-smooth",
            product.stockQty === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-accent text-accent-foreground hover:opacity-90 active:scale-95",
          )}
          data-ocid="add-to-cart-btn"
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stockQty === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
