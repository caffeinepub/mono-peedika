import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useListOrders, useUpdateOrderStatus } from "@/hooks/useQueries";
import { formatBigIntPrice } from "@/utils/format";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus, PaymentMethod } from "../../backend";
import type { Order } from "../../backend.d.ts";

const STATUS_SEQUENCE = [
  OrderStatus.Pending,
  OrderStatus.Paid,
  OrderStatus.Shipped,
  OrderStatus.Delivered,
] as const;

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [OrderStatus.Paid]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [OrderStatus.Shipped]:
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  [OrderStatus.Delivered]: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function OrdersTab() {
  const { data: orders, isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  async function handleStatusChange(id: string, status: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Order status updated to ${status}`);
    } catch {
      toast.error("Failed to update order status");
    }
  }

  const sortedOrders = [...(orders ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">
          Orders
        </h2>
        <p className="text-sm text-muted-foreground">
          {orders?.length ?? 0} total order
          {(orders?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Order ID
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                  Payment
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                  UTR
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : sortedOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onDetail={() => setDetailOrder(order)}
                    />
                  ))}
              {!isLoading && sortedOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog
        open={!!detailOrder}
        onOpenChange={(o) => !o && setDetailOrder(null)}
      >
        {detailOrder && <OrderDetailContent order={detailOrder} />}
      </Dialog>
    </div>
  );
}

function OrderRow({
  order,
  onStatusChange,
  onDetail,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDetail: () => void;
}) {
  const date = new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <tr
      className="hover:bg-muted/20 transition-colors"
      data-ocid={`order-row-${order.id}`}
    >
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {order.id.slice(0, 8)}…
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{order.customerName}</p>
        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
        {date}
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
            order.paymentMethod === PaymentMethod.UPI
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-muted/60 text-muted-foreground border-border"
          }`}
        >
          {order.paymentMethod}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-muted-foreground">
        {order.upiTransactionId ?? "—"}
      </td>
      <td className="px-4 py-3 text-right font-semibold text-foreground font-mono text-xs">
        {formatBigIntPrice(order.totalAmount)}
      </td>
      <td className="px-4 py-3">
        <StatusDropdown
          currentStatus={order.status}
          onChange={(s) => onStatusChange(order.id, s)}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={onDetail}
          className="p-1.5 rounded-md hover:bg-accent/10 hover:text-accent transition-colors text-muted-foreground"
          aria-label="View order detail"
          data-ocid={`view-order-${order.id}`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function StatusDropdown({
  currentStatus,
  onChange,
}: {
  currentStatus: OrderStatus;
  onChange: (s: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-opacity hover:opacity-80 ${STATUS_COLORS[currentStatus]}`}
        data-ocid="status-dropdown-trigger"
      >
        {currentStatus}
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-elevated overflow-hidden min-w-[130px]">
          {STATUS_SEQUENCE.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/60 ${
                s === currentStatus ? "text-accent" : "text-foreground"
              }`}
              data-ocid={`status-option-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailContent({ order }: { order: Order }) {
  const date = new Date(Number(order.createdAt) / 1_000_000).toLocaleString(
    "en-IN",
  );

  return (
    <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-display text-foreground">
          Order Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm">
        {/* Customer */}
        <section className="bg-muted/30 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Customer
          </p>
          <p className="text-foreground font-medium">{order.customerName}</p>
          <p className="text-muted-foreground">{order.customerEmail}</p>
          <p className="text-muted-foreground">{order.customerPhone}</p>
        </section>

        {/* Shipping */}
        <section className="bg-muted/30 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Shipping Address
          </p>
          <p className="text-foreground">
            {order.shippingAddress.addressLine1}
          </p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-muted-foreground">
              {order.shippingAddress.addressLine2}
            </p>
          )}
          <p className="text-muted-foreground">
            {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
            {order.shippingAddress.postalCode}
          </p>
        </section>

        {/* Payment */}
        <section className="bg-muted/30 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Payment
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{order.paymentMethod}</Badge>
            {order.upiTransactionId && (
              <span className="font-mono text-xs text-muted-foreground">
                UTR: {order.upiTransactionId}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{date}</p>
        </section>

        {/* Items */}
        <section className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Items
          </p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: order items don't have unique IDs
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground font-medium truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {Number(item.qty)}
                  </p>
                </div>
                <p className="font-mono text-foreground shrink-0">
                  {formatBigIntPrice(item.priceAtOrder)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center">
            <p className="font-semibold text-foreground">Total</p>
            <p className="font-mono font-bold text-accent">
              {formatBigIntPrice(order.totalAmount)}
            </p>
          </div>
        </section>
      </div>
    </DialogContent>
  );
}
