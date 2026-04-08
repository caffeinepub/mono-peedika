import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute } from "@tanstack/react-router";
import { ClipboardList, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { OrderStatus, PaymentMethod } from "../backend";
import type { Order } from "../backend.d.ts";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const CUSTOMER_ID_KEY = "mono_peedika_customer_id";

function getLocalCustomerId(): string {
  let id = localStorage.getItem(CUSTOMER_ID_KEY);
  if (!id) {
    id = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(CUSTOMER_ID_KEY, id);
  }
  return id;
}

function useGetOrdersByCustomer() {
  const { actor, isFetching } = useActor(createActor);
  const customerId = useMemo(() => getLocalCustomerId(), []);
  return useQuery<Order[]>({
    queryKey: ["orders-by-customer", customerId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByCustomer(customerId);
    },
    enabled: !!actor && !isFetching,
  });
}

type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  [OrderStatus.Pending]: {
    label: "Pending",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  [OrderStatus.Paid]: {
    label: "Paid",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  [OrderStatus.Shipped]: {
    label: "Shipped",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  [OrderStatus.Delivered]: {
    label: "Delivered",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000; // nanoseconds → ms
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

function OrdersPage() {
  const { data: orders, isLoading } = useGetOrdersByCustomer();

  return (
    <div className="min-h-[80vh] bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1
              className="font-display text-xl font-bold text-foreground tracking-tight"
              data-ocid="orders-page-heading"
            >
              My Orders
            </h1>
            <p className="text-xs text-muted-foreground">
              Track and view your past orders
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-3" data-ocid="orders-loading">
            {[1, 2, 3].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="flex flex-col gap-3" data-ocid="orders-list">
            {[...orders]
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusCfg =
    STATUS_CONFIG[order.status] ?? STATUS_CONFIG[OrderStatus.Pending];
  const itemCount = order.items.reduce((sum, i) => sum + Number(i.qty), 0);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden transition-smooth hover:border-accent/30"
      data-ocid="order-card"
    >
      {/* Top bar */}
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="font-mono text-xs text-muted-foreground truncate"
            data-ocid="order-card-id"
          >
            #{order.id}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.className}`}
          data-ocid="order-status-badge"
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60 mx-5" />

      {/* Bottom row */}
      <div className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-4 text-muted-foreground text-xs">
          <span>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 font-medium"
            >
              {order.paymentMethod === PaymentMethod.UPI ? "UPI" : "COD"}
            </Badge>
          </span>
        </div>
        <p
          className="font-display font-bold text-foreground text-base"
          data-ocid="order-total"
        >
          {formatPrice(Number(order.totalAmount))}
        </p>
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-px w-full bg-border" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-20 px-4 text-center"
      data-ocid="orders-empty-state"
    >
      <div className="w-20 h-20 rounded-full bg-muted/60 border border-border flex items-center justify-center">
        <ShoppingBag
          className="w-9 h-9 text-muted-foreground/50"
          strokeWidth={1.2}
        />
      </div>
      <div>
        <h2 className="font-display font-semibold text-foreground text-lg">
          No orders yet
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your order history will appear here after you make a purchase.
        </p>
      </div>
      <Link to="/">
        <Button
          variant="default"
          className="gap-2 font-semibold rounded-xl px-6 h-11"
          data-ocid="orders-empty-shop-btn"
        >
          <ShoppingBag className="w-4 h-4" />
          Start Shopping
        </Button>
      </Link>
    </div>
  );
}
