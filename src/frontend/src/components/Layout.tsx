import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CartDrawer } from "./CartDrawer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { totalItems, toggleCart } = useCartStore();
  const itemCount = totalItems();

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate({ to: "/", search: { q: searchQuery.trim() } });
    setSearchOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-30 bg-card border-b border-border/70 shadow-subtle"
        data-ocid="site-header"
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 min-w-0"
            aria-label="Mono-peedika Home"
            data-ocid="logo-link"
          >
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
              <span className="font-display font-black text-accent-foreground text-base leading-none">
                M
              </span>
            </div>
            <span className="font-display font-bold text-foreground text-lg hidden sm:block tracking-tight">
              Mono-peedika
            </span>
          </Link>

          {/* Search Bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="flex-1 hidden sm:flex items-center bg-muted/60 border border-border/50 rounded-lg overflow-hidden hover:border-accent/50 focus-within:border-accent/70 transition-colors"
          >
            <input
              type="search"
              placeholder="Search gadgets, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              aria-label="Search products"
              data-ocid="search-input"
            />
            <button
              type="submit"
              className="px-3 py-2 text-muted-foreground hover:text-accent transition-colors"
              aria-label="Search"
              data-ocid="search-submit-btn"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="sm:hidden p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle search"
              data-ocid="search-toggle-btn"
            >
              {searchOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={toggleCart}
              className="relative p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label={`Shopping cart, ${itemCount} items`}
              data-ocid="cart-toggle-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              to="/orders"
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="My orders"
              data-ocid="account-link"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Admin link */}
            <Link
              to="/admin"
              className="p-2 rounded-md hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-accent font-medium"
              aria-label="Admin"
              data-ocid="admin-link"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="sm:hidden border-t border-border/50 px-4 py-2">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-muted/60 border border-border/50 rounded-lg overflow-hidden focus-within:border-accent/70 transition-colors"
            >
              <input
                ref={searchRef}
                type="search"
                placeholder="Search gadgets, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                aria-label="Search products"
                data-ocid="search-input-mobile"
              />
              <button
                type="submit"
                className="px-3 py-2 text-muted-foreground hover:text-accent transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className={cn("flex-1 bg-background")} id="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                <span className="font-display font-black text-accent-foreground text-sm">
                  M
                </span>
              </div>
              <span className="font-display font-bold text-foreground text-base">
                Mono-peedika
              </span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-accent transition-colors">
                Home
              </Link>
              <Link
                to="/orders"
                className="hover:text-accent transition-colors"
              >
                My Orders
              </Link>
              <Link to="/cart" className="hover:text-accent transition-colors">
                Cart
              </Link>
            </nav>
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Mono-peedika. All rights reserved.
            </p>
            <p>
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Toast notifications */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
