import { createActor } from "@/backend";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import type { Product } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Route as rootRoute } from "./__root";

// ─── Route ───────────────────────────────────────────────────────────────────

type HomeSearch = { q?: string };

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: HomePage,
});

// ─── Data Hooks ───────────────────────────────────────────────────────────────

function mapProduct(raw: {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: bigint;
  discountPercent: bigint;
  rating: number;
  reviewCount: bigint;
  stockQty: bigint;
  tags: string[];
  createdAt: bigint;
  updatedAt: bigint;
}): Product {
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
}

function useAllProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.listProducts();
      return raw.map(mapProduct);
    },
    enabled: !!actor && !isFetching,
  });
}

function useBestSellers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["bestSellers"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getFeaturedProducts("bestSeller");
      return raw.map(mapProduct);
    },
    enabled: !!actor && !isFetching,
  });
}

function useDeals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getFeaturedProducts("dealOfTheDay");
      return raw.map(mapProduct);
    },
    enabled: !!actor && !isFetching,
  });
}

function useSearchProducts(term: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      const raw = await actor.searchProducts(term.trim());
      return raw.map(mapProduct);
    },
    enabled: !!actor && !isFetching && !!term.trim(),
  });
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    id: "h1",
    headline: "Mono-peedika",
    subline: "Your one-stop destination for premium gadgets & accessories",
    cta: "Shop Now",
    accentText: "New Arrivals",
    bgClass: "from-card to-background",
  },
  {
    id: "h2",
    headline: "Best Deals Today",
    subline: "Up to 40% off on top-rated electronics — limited time only",
    cta: "See Deals",
    accentText: "Up to 40% OFF",
    bgClass: "from-card to-background",
  },
  {
    id: "h3",
    headline: "Fast Delivery",
    subline: "Cash on delivery & UPI accepted. Delivered to your doorstep",
    cta: "Browse All",
    accentText: "Free Shipping",
    bgClass: "from-card to-background",
  },
];

function HeroBanner({ onShopNow }: { onShopNow: () => void }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(
      () => setActive((p) => (p + 1) % HERO_SLIDES.length),
      4500,
    );
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-card to-background border-b border-border"
      data-ocid="hero-banner"
    >
      {/* Decorative radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 50%, oklch(var(--accent) / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
        {/* Text column */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-widest border border-accent/20">
            <Sparkles className="w-3 h-3" />
            {slide.accentText}
          </span>
          <h1 className="font-display font-black text-3xl md:text-5xl text-foreground leading-tight tracking-tight">
            {slide.headline}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
            {slide.subline}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onShopNow();
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm transition-smooth hover:opacity-90 active:scale-95 shadow-elevated"
              data-ocid="hero-cta-btn"
            >
              <ShoppingBag className="w-4 h-4" />
              {slide.cta}
            </button>
            <Link
              to="/"
              search={{ q: undefined }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              View All Products
            </Link>
          </div>
        </div>

        {/* Icon accent */}
        <div className="hidden md:flex items-center justify-center w-48 h-48 flex-shrink-0">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, oklch(var(--accent) / 0.15) 0%, oklch(var(--accent) / 0.04) 70%)",
              boxShadow: "0 0 60px oklch(var(--accent) / 0.12)",
            }}
          >
            <ShoppingBag
              className="w-20 h-20"
              style={{ color: "oklch(var(--accent))", opacity: 0.7 }}
            />
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 bg-accent"
                : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  query: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function SearchBar({ query, onChange, onSubmit, inputRef }: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(query);
  }

  return (
    <section
      className="bg-muted/30 border-b border-border py-4 px-4"
      data-ocid="search-section"
    >
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-0 bg-card border border-border rounded-xl overflow-hidden focus-within:border-accent/60 transition-colors shadow-subtle"
        >
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search for phones, laptops, earbuds..."
            value={query}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            aria-label="Search products"
            data-ocid="home-search-input"
          />
          <button
            type="submit"
            className="px-5 py-3.5 bg-accent text-accent-foreground font-semibold text-sm flex items-center gap-1.5 transition-smooth hover:opacity-90 flex-shrink-0"
            data-ocid="home-search-btn"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  right?: React.ReactNode;
}

function SectionHeader({ icon, title, badge, right }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent flex-shrink-0">
          {icon}
        </div>
        <h2 className="font-display font-bold text-lg md:text-xl text-foreground truncate">
          {title}
        </h2>
        {badge && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wide border border-primary/20">
            {badge}
          </span>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
      {/* Divider line */}
    </div>
  );
}

// ─── Countdown Timer (decorative) ─────────────────────────────────────────────

function DealsCountdown() {
  const [time, setTime] = useState({ h: 12, m: 34, s: 56 });

  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
          m = 59;
          s = 59;
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="flex items-center gap-1.5 text-accent"
      data-ocid="deals-countdown"
    >
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-mono font-bold tabular-nums">
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)} left
      </span>
    </div>
  );
}

// ─── Product Grid ─────────────────────────────────────────────────────────────

interface ProductGridProps {
  products: Product[];
  badge?: "best-seller" | "sale";
}

function ProductGrid({ products, badge }: ProductGridProps) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} badge={badge} />
      ))}
    </div>
  );
}

// ─── Search Results ───────────────────────────────────────────────────────────

interface SearchResultsProps {
  query: string;
  onClear: () => void;
}

function SearchResults({ query, onClear }: SearchResultsProps) {
  const { data: results = [], isLoading } = useSearchProducts(query);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6" data-ocid="search-results">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent flex-shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Results for <span className="text-accent">"{query}"</span>
          </h2>
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              ({results.length} found)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline flex-shrink-0"
          data-ocid="clear-search-btn"
        >
          Clear search
        </button>
      </div>

      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : results.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-4 text-center"
          data-ocid="search-empty-state"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground font-display">
            No products found
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try a different search term or browse our categories below.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm transition-smooth hover:opacity-90"
            data-ocid="search-empty-cta"
          >
            Browse All Products
          </button>
        </div>
      ) : (
        <ProductGrid products={results} />
      )}
    </section>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

function HomePage() {
  const { q: searchParam } = Route.useSearch();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const allProductsRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchParam ?? "");
  const [activeSearch, setActiveSearch] = useState(searchParam ?? "");

  // Sync from URL
  useEffect(() => {
    setSearchQuery(searchParam ?? "");
    setActiveSearch(searchParam ?? "");
  }, [searchParam]);

  const { data: allProducts = [], isLoading: loadingAll } = useAllProducts();
  const { data: bestSellers = [], isLoading: loadingBest } = useBestSellers();
  const { data: deals = [], isLoading: loadingDeals } = useDeals();

  function handleSearchSubmit(val: string) {
    const trimmed = val.trim();
    setActiveSearch(trimmed);
    navigate({ to: "/", search: trimmed ? { q: trimmed } : {} });
    if (!trimmed && searchInputRef.current) searchInputRef.current.blur();
  }

  function clearSearch() {
    setSearchQuery("");
    setActiveSearch("");
    navigate({ to: "/", search: {} });
  }

  function scrollToProducts() {
    allProductsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const isSearchActive = !!activeSearch.trim();

  return (
    <div className="flex flex-col min-h-0">
      {/* Hero */}
      <HeroBanner onShopNow={scrollToProducts} />

      {/* Search Bar */}
      <SearchBar
        query={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
        inputRef={searchInputRef}
      />

      {isSearchActive ? (
        <SearchResults query={activeSearch} onClear={clearSearch} />
      ) : (
        <>
          {/* ── Best Sellers ── */}
          <section
            className="max-w-7xl mx-auto w-full px-4 py-8"
            data-ocid="best-sellers-section"
          >
            <SectionHeader
              icon={<TrendingUp className="w-4 h-4" />}
              title="Best Sellers"
              badge="Hot"
            />
            {loadingBest ? (
              <SkeletonGrid count={4} />
            ) : bestSellers.length > 0 ? (
              <ProductGrid products={bestSellers} badge="best-seller" />
            ) : /* Fallback: show top-rated from allProducts */
            loadingAll ? (
              <SkeletonGrid count={4} />
            ) : (
              <ProductGrid
                products={[...allProducts]
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 4)}
                badge="best-seller"
              />
            )}
          </section>

          {/* ── Deals of the Day ── */}
          <section
            className="bg-muted/20 border-y border-border"
            data-ocid="deals-section"
          >
            <div className="max-w-7xl mx-auto w-full px-4 py-8">
              <SectionHeader
                icon={<Zap className="w-4 h-4" />}
                title="Deals of the Day"
                right={<DealsCountdown />}
              />
              {loadingDeals ? (
                <SkeletonGrid count={4} />
              ) : deals.length > 0 ? (
                <ProductGrid products={deals} badge="sale" />
              ) : /* Fallback: show discounted from allProducts */
              loadingAll ? (
                <SkeletonGrid count={4} />
              ) : (
                <ProductGrid
                  products={allProducts
                    .filter((p) => p.discountPercent > 0)
                    .slice(0, 4)}
                  badge="sale"
                />
              )}
            </div>
          </section>

          {/* ── All Products ── */}
          <section
            ref={allProductsRef}
            className="max-w-7xl mx-auto w-full px-4 py-8"
            data-ocid="all-products-section"
          >
            <SectionHeader
              icon={<ShoppingBag className="w-4 h-4" />}
              title="All Products"
              badge={
                allProducts.length > 0
                  ? `${allProducts.length} items`
                  : undefined
              }
            />
            {loadingAll ? (
              <SkeletonGrid count={8} />
            ) : allProducts.length > 0 ? (
              <ProductGrid products={allProducts} />
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20 gap-4 text-center"
                data-ocid="empty-products-state"
              >
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground font-display">
                  Products coming soon
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Our catalog is being updated. Check back soon for amazing
                  deals on the best gadgets.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
