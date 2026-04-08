import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { discountedPrice, formatPrice } from "@/utils/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronUp, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { CreateOrderRequest } from "../backend";
import { PaymentMethod } from "../backend";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  paymentMethod: "UPI" | "COD";
  upiTransactionId: string;
}

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { actor } = useActor(createActor);
  const navigate = useNavigate();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = totalPrice();
  const UPI_ID = "9061847752@fam";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: { paymentMethod: "UPI" },
  });

  const paymentMethod = watch("paymentMethod");

  async function copyUpi() {
    await navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  }

  async function onSubmit(data: CheckoutFormData) {
    if (!actor) {
      toast.error("Service not ready. Please try again.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const req: CreateOrderRequest = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || undefined,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
        },
        paymentMethod:
          data.paymentMethod === "UPI" ? PaymentMethod.UPI : PaymentMethod.COD,
        upiTransactionId:
          data.paymentMethod === "UPI" ? data.upiTransactionId : undefined,
        customerId: "guest",
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          qty: BigInt(item.qty),
          priceAtOrder: BigInt(
            discountedPrice(item.product.price, item.product.discountPercent),
          ),
        })),
      };

      const order = await actor.createOrder(req);
      clearCart();
      navigate({
        to: "/thank-you",
        search: { orderId: order.id },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-lg">
          Your cart is empty. Add items before checking out.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          className="bg-accent text-accent-foreground"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left: Form ── */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Shipping Details */}
            <section
              className="bg-card border border-border rounded-xl p-5 space-y-4"
              data-ocid="checkout-shipping-section"
            >
              <h2 className="font-display font-bold text-foreground text-base">
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="customerName"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Rahul Kumar"
                    {...register("customerName", {
                      required: "Full name is required",
                    })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-name-input"
                  />
                  {errors.customerName && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="customerEmail"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    Email *
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="rahul@example.com"
                    {...register("customerEmail", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-email-input"
                  />
                  {errors.customerEmail && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="customerPhone"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    Phone (10 digits) *
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    {...register("customerPhone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit Indian phone number",
                      },
                    })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-phone-input"
                  />
                  {errors.customerPhone && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.customerPhone.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="addressLine1"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    Address Line 1 *
                  </Label>
                  <Input
                    id="addressLine1"
                    placeholder="Flat No, Building, Street"
                    {...register("addressLine1", {
                      required: "Address is required",
                    })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-address1-input"
                  />
                  {errors.addressLine1 && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="addressLine2"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    Address Line 2{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="addressLine2"
                    placeholder="Area, Landmark"
                    {...register("addressLine2")}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-address2-input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="city"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    City *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    {...register("city", { required: "City is required" })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-city-input"
                  />
                  {errors.city && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="state"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    State *
                  </Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    {...register("state", { required: "State is required" })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-state-input"
                  />
                  {errors.state && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="postalCode"
                    className="text-foreground text-sm mb-1.5 block"
                  >
                    Postal Code *
                  </Label>
                  <Input
                    id="postalCode"
                    placeholder="400001"
                    maxLength={6}
                    {...register("postalCode", {
                      required: "Postal code is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "Enter a valid 6-digit PIN code",
                      },
                    })}
                    className="bg-muted/40 border-border/60 focus:border-accent/60"
                    data-ocid="checkout-postal-input"
                  />
                  {errors.postalCode && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section
              className="bg-card border border-border rounded-xl p-5 space-y-4"
              data-ocid="checkout-payment-section"
            >
              <h2 className="font-display font-bold text-foreground text-base">
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {(["UPI", "COD"] as const).map((method) => (
                  <label
                    key={method}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-accent/40"
                    }`}
                    data-ocid={`checkout-payment-${method.toLowerCase()}`}
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <span className="text-2xl">
                      {method === "UPI" ? "💳" : "🏠"}
                    </span>
                    <span className="font-semibold text-sm">
                      {method === "UPI" ? "UPI Payment" : "Cash on Delivery"}
                    </span>
                  </label>
                ))}
              </div>

              {/* UPI Section */}
              {paymentMethod === "UPI" && (
                <div
                  className="space-y-4 pt-2"
                  data-ocid="checkout-upi-section"
                >
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Send{" "}
                      <span className="font-bold text-accent">
                        {formatPrice(total)}
                      </span>{" "}
                      to this UPI ID:
                    </p>
                    <div className="flex items-center gap-2 bg-muted/50 border border-accent/30 rounded-lg px-4 py-3">
                      <code className="flex-1 font-mono text-accent font-semibold text-sm tracking-wide">
                        {UPI_ID}
                      </code>
                      <button
                        type="button"
                        onClick={copyUpi}
                        className="text-muted-foreground hover:text-accent transition-colors flex-shrink-0"
                        aria-label="Copy UPI ID"
                        data-ocid="checkout-copy-upi-btn"
                      >
                        {copiedUpi ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="upiTransactionId"
                      className="text-foreground text-sm mb-1.5 block"
                    >
                      Transaction / UTR ID *
                      <span className="text-muted-foreground font-normal ml-1">
                        (12 digits)
                      </span>
                    </Label>
                    <Input
                      id="upiTransactionId"
                      placeholder="123456789012"
                      maxLength={12}
                      {...register("upiTransactionId", {
                        required:
                          paymentMethod === "UPI"
                            ? "Transaction ID is required"
                            : false,
                        pattern:
                          paymentMethod === "UPI"
                            ? {
                                value: /^[A-Z0-9]{12}$/i,
                                message:
                                  "Must be exactly 12 alphanumeric characters",
                              }
                            : undefined,
                        minLength:
                          paymentMethod === "UPI"
                            ? { value: 12, message: "Must be 12 characters" }
                            : undefined,
                        maxLength:
                          paymentMethod === "UPI"
                            ? { value: 12, message: "Must be 12 characters" }
                            : undefined,
                      })}
                      className="bg-muted/40 border-border/60 focus:border-accent/60 font-mono tracking-widest"
                      data-ocid="checkout-utr-input"
                    />
                    {errors.upiTransactionId && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.upiTransactionId.message}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-1.5">
                      After payment, enter the 12-character UTR/Transaction ID
                      from your UPI app.
                    </p>
                  </div>
                </div>
              )}

              {/* COD Section */}
              {paymentMethod === "COD" && (
                <div
                  className="bg-muted/30 border border-border/50 rounded-xl p-4 flex items-center gap-3"
                  data-ocid="checkout-cod-section"
                >
                  <span className="text-2xl flex-shrink-0">💰</span>
                  <p className="text-sm text-foreground">
                    Pay{" "}
                    <span className="font-bold text-accent">
                      {formatPrice(total)}
                    </span>{" "}
                    at the time of delivery. No advance payment needed.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Mobile: collapsible */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 mb-2"
                data-ocid="checkout-summary-toggle"
              >
                <span className="font-semibold text-foreground">
                  Order Summary ({items.length}{" "}
                  {items.length === 1 ? "item" : "items"})
                </span>
                <div className="flex items-center gap-2 text-accent font-bold">
                  {formatPrice(total)}
                  {summaryOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>
              {summaryOpen && (
                <OrderSummaryContent items={items} total={total} />
              )}
            </div>

            {/* Desktop: always visible */}
            <div className="hidden lg:block sticky top-20">
              <OrderSummaryContent items={items} total={total} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={submitting || !actor}
            className="w-full sm:w-auto min-w-48 h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base gap-2 disabled:opacity-60"
            data-ocid="checkout-submit-btn"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface SummaryItem {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    discountPercent: number;
  };
  qty: number;
}

function OrderSummaryContent({
  items,
  total,
}: {
  items: SummaryItem[];
  total: number;
}) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-5"
      data-ocid="checkout-order-summary"
    >
      <h3 className="font-display font-bold text-foreground text-base mb-4">
        Order Summary
      </h3>

      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => {
          const ep = discountedPrice(
            item.product.price,
            item.product.discountPercent,
          );
          return (
            <div
              key={item.product.id}
              className="flex items-center gap-3"
              data-ocid={`checkout-summary-item-${item.product.id}`}
            >
              <div className="w-10 h-10 rounded-lg bg-muted/40 border border-border/50 overflow-hidden flex-shrink-0">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate font-medium">
                  {item.product.name}
                </p>
                <p className="text-xs text-muted-foreground">×{item.qty}</p>
              </div>
              <span className="text-xs font-semibold text-foreground flex-shrink-0">
                {formatPrice(ep * item.qty)}
              </span>
            </div>
          );
        })}
      </div>

      <Separator className="bg-border/50 mb-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground font-medium">
            {formatPrice(total)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-green-400 font-medium">Free</span>
        </div>
      </div>

      <Separator className="bg-border/50 my-3" />

      <div className="flex justify-between items-center">
        <span className="font-display font-bold text-foreground">Total</span>
        <span className="font-display font-black text-accent text-lg">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
