import { createActor } from "@/backend";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import { discountedPrice, formatPrice } from "@/utils/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductDetailPage,
});

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useGetProduct(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!actor) return null;
      const raw = await actor.getProduct(id);
      if (!raw) return null;
      return {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        category: raw.category,
        imageUrl: raw.imageUrl,
        price: Number(raw.price),
        discountPercent: Number(raw.discountPercent),
        rating: raw.rating,
        reviewCount: Number(raw.reviewCount),
        stockQty: Number(raw.stockQty),
        tags: raw.tags,
        createdAt: Number(raw.createdAt),
        updatedAt: Number(raw.updatedAt),
      };
    },
    enabled: !!actor && !isFetching,
  });
}

function useListProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      const rawList = await actor.listProducts();
      return rawList.map((raw) => ({
        id: raw.id,
        name: raw.name,
        description: raw.description,
        category: raw.category,
        imageUrl: raw.imageUrl,
        price: Number(raw.price),
        discountPercent: Number(raw.discountPercent),
        rating: raw.rating,
        reviewCount: Number(raw.reviewCount),
        stockQty: Number(raw.stockQty),
        tags: raw.tags,
        createdAt: Number(raw.createdAt),
        updatedAt: Number(raw.updatedAt),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Image Carousel ───────────────────────────────────────────────────────────

interface CarouselProps {
  imageUrl: string;
  productName: string;
}

function ImageCarousel({ imageUrl, productName }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Create pseudo-thumbnails: main image + 3 placeholder variants for visual richness
  const images = [
    { src: imageUrl, key: "main" },
    { src: imageUrl, key: "alt1" },
    { src: imageUrl, key: "alt2" },
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Main carousel */}
      <div
        className="overflow-hidden rounded-xl border border-border bg-card aspect-square"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {images.map(({ src, key }, i) => (
            <div key={key} className="flex-[0_0_100%] relative">
              <img
                src={src || "/assets/images/placeholder.svg"}
                alt={`${productName} - view ${i + 1}`}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/images/placeholder.svg";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2">
        {images.map(({ src, key }, i) => (
          <button
            key={key}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`View image ${i + 1}`}
            className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-smooth ${
              selectedIndex === i
                ? "border-accent"
                : "border-border opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={src || "/assets/images/placeholder.svg"}
              alt={`Thumbnail ${i + 1}`}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/images/placeholder.svg";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Quantity Selector ────────────────────────────────────────────────────────

interface QtyProps {
  qty: number;
  max: number;
  onChange: (q: number) => void;
}

function QtySelector({ qty, max, onChange }: QtyProps) {
  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-smooth"
        data-ocid="qty-decrease"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-12 h-10 flex items-center justify-center border-y border-border bg-card text-foreground font-semibold text-sm tabular-nums">
        {qty}
      </div>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-smooth"
        data-ocid="qty-increase"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Product Detail Skeleton ──────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-pulse">
      <Skeleton className="w-24 h-8 mb-6 rounded-lg" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="w-20 h-5 rounded-full" />
          <Skeleton className="w-full h-8 rounded-lg" />
          <Skeleton className="w-3/4 h-8 rounded-lg" />
          <Skeleton className="w-32 h-5 rounded" />
          <Skeleton className="w-40 h-10 rounded" />
          <Skeleton className="w-full h-24 rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="w-32 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Related Products ─────────────────────────────────────────────────────────

interface RelatedProps {
  category: string;
  currentId: string;
  allProducts: Product[];
}

function RelatedProducts({ category, currentId, allProducts }: RelatedProps) {
  const related = allProducts
    .filter((p) => p.category === category && p.id !== currentId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-bold text-foreground mb-5 font-display">
        Related Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ProductDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading: productLoading } = useGetProduct(id);
  const { data: allProducts = [] } = useListProducts();

  const inStock = product ? product.stockQty > 0 : false;
  const finalPrice = product
    ? discountedPrice(product.price, product.discountPercent)
    : 0;
  const hasDiscount = product ? product.discountPercent > 0 : false;

  function handleAddToCart() {
    if (!product) return;
    addItem(product, qty);
    toast.success(`${product.name} added to cart`, {
      description: `${qty} × ${formatPrice(finalPrice)}`,
      duration: 3000,
    });
  }

  function handleBuyNow() {
    if (!product) return;
    addItem(product, qty);
    navigate({ to: "/checkout" });
  }

  if (productLoading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <XCircle className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground font-display">
          Product Not Found
        </h1>
        <p className="text-muted-foreground">
          This product may have been removed or doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm transition-smooth hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-6 pb-16"
      data-ocid="product-detail-page"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
        data-ocid="back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Image carousel */}
        <ImageCarousel imageUrl={product.imageUrl} productName={product.name} />

        {/* Right: Product info */}
        <div className="flex flex-col gap-4">
          {/* Category badge + discount badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-accent text-[10px] uppercase tracking-widest">
              {product.category}
            </span>
            {hasDiscount && (
              <span className="inline-flex items-center px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Product name */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display leading-tight">
            {product.name}
          </h1>

          {/* Star rating */}
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="md"
          />

          {/* Price block */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground font-display">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5">
            {inStock ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  In Stock
                  {product.stockQty <= 5 && (
                    <span className="text-muted-foreground font-normal ml-1">
                      (only {product.stockQty} left)
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Out of Stock
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Quantity + CTA */}
          {inStock && (
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">
                  Quantity
                </span>
                <QtySelector
                  qty={qty}
                  max={product.stockQty}
                  onChange={setQty}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-accent text-accent font-semibold text-sm transition-smooth hover:bg-accent hover:text-accent-foreground"
                  data-ocid="add-to-cart-btn"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm transition-smooth hover:opacity-90 active:scale-95"
                  data-ocid="buy-now-btn"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-muted-foreground">Tags:</span>
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts
        category={product.category}
        currentId={product.id}
        allProducts={allProducts}
      />
    </div>
  );
}
