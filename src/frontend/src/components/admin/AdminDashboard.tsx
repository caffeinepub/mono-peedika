import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { OrdersTab } from "./OrdersTab";
import { ProductsTab } from "./ProductsTab";

type TabId = "products" | "orders";

export function AdminDashboard() {
  const { identity, clear } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<TabId>("products");

  const principalText = identity?.getPrincipal().toText();
  const shortPrincipal = principalText
    ? `${principalText.slice(0, 8)}…${principalText.slice(-6)}`
    : "Unknown";

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: "products",
      label: "Products",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header Bar */}
      <div className="bg-card border-b border-border/70 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <span className="font-display font-black text-accent text-sm">
                A
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground font-display">
                Admin Dashboard
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px] sm:max-w-none">
                {shortPrincipal}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => clear()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
            data-ocid="admin-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border-b border-border/40 px-4">
        <div className="max-w-7xl mx-auto flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
              data-ocid={`admin-tab-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "products" ? <ProductsTab /> : <OrdersTab />}
      </div>
    </div>
  );
}
