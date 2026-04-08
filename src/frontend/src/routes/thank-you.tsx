import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, ShoppingBag, Truck } from "lucide-react";
import type { Order } from "../backend.d.ts";
import { Route as rootRoute } from "./__root";

type ThankYouSearch = {
  orderId?: string;
};

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/thank-you",
  validateSearch: (search: Record<string, unknown>): ThankYouSearch => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
  }),
  component: ThankYouPage,
});

function useGetOrder(id: string | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getOrder(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

function ThankYouPage() {
  const { orderId } = Route.useSearch();
  const { data: order, isLoading } = useGetOrder(orderId);

  const waMessage = encodeURIComponent(
    `Hi, I placed an order #${orderId} on Mono-peedika. Please confirm.`,
  );
  const waUrl = `https://wa.me/919061847752?text=${waMessage}`;

  return (
    <div className="min-h-[80vh] bg-background py-10 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        {/* Success header */}
        <div
          className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-4 shadow-elevated text-center"
          data-ocid="thank-you-success-card"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center">
            <CheckCircle2
              className="w-10 h-10 text-green-400"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Thank You!
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your order has been placed successfully
            </p>
          </div>

          {orderId && (
            <div className="bg-muted/60 rounded-lg px-5 py-3 w-full">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Order ID
              </p>
              <p
                className="font-mono font-semibold text-accent text-base break-all"
                data-ocid="order-id-display"
              >
                #{orderId}
              </p>
            </div>
          )}

          {/* Estimated delivery */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="w-4 h-4 text-accent flex-shrink-0" />
            <span>
              Estimated delivery:{" "}
              <strong className="text-foreground">5–7 business days</strong>
            </span>
          </div>
        </div>

        {/* Order details */}
        {isLoading ? (
          <OrderDetailSkeleton />
        ) : order ? (
          <OrderDetails order={order} />
        ) : orderId ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-sm">
            Could not load order details.
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex flex-col gap-3" data-ocid="thank-you-actions">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors shadow-elevated"
            data-ocid="whatsapp-confirm-btn"
          >
            <MessageCircle className="w-5 h-5" />
            Confirm on WhatsApp
          </a>

          <Link to="/" data-ocid="continue-shopping-btn">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.priceAtOrder) * Number(item.qty),
    0,
  );

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden"
      data-ocid="order-details-card"
    >
      {/* Customer info */}
      <div className="px-5 py-4 border-b border-border/60">
        <h2 className="font-display font-semibold text-foreground text-sm mb-3">
          Order Details
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="text-foreground font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment</p>
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold mt-0.5"
            >
              {order.paymentMethod}
            </Badge>
          </div>
          {order.upiTransactionId && (
            <div className="col-span-2">
              <p className="text-muted-foreground">UPI Transaction ID</p>
              <p className="font-mono text-foreground text-[11px]">
                {order.upiTransactionId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-4 border-b border-border/60">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Items
        </h3>
        <ul className="flex flex-col gap-2.5" data-ocid="order-items-list">
          {order.items.map((item) => (
            <li
              key={`${item.productId}-${Number(item.qty)}`}
              className="flex justify-between items-start gap-2 text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate">
                  {item.productName}
                </p>
                <p className="text-muted-foreground text-xs">
                  Qty: {Number(item.qty)}
                </p>
              </div>
              <p className="text-foreground font-semibold flex-shrink-0">
                {formatPrice(Number(item.priceAtOrder) * Number(item.qty))}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="px-5 py-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="text-green-400">Free</span>
        </div>
        <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border/60 mt-1">
          <span>Grand Total</span>
          <span className="text-accent">
            {formatPrice(Number(order.totalAmount))}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <Skeleton className="h-px w-full bg-border my-1" />
      <Skeleton className="h-4 w-24 ml-auto" />
    </div>
  );
}
