import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/TrekoLanding";
import {
  clearTripSelection,
  getCurrentUser,
  getValidCouponCode,
  isValidCoupon,
  readBookings,
  readTripSelection,
  type BookingRecord,
  type TripItem,
  writeBookings,
} from "@/lib/auth";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getPackageBadge = (item: TripItem) => {
  if (item.type === "stay") return "Stay";
  if (item.type === "cab") return "Transportation";
  return "Guide";
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TripItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState("");
  const [couponError, setCouponError] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate({ to: "/login" });
      return;
    }

    setItems(readTripSelection());
  }, [navigate]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const discount = couponApplied ? subtotal : 0;
  const finalTotal = Math.max(subtotal - discount, 0);
  const packageLabel = items.length > 1 ? "Complete Trip Package" : "Trip Package";

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    setItems(updatedItems);

    if (updatedItems.length) {
      localStorage.setItem("treko-demo-cart", JSON.stringify(updatedItems));
    } else {
      clearTripSelection();
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Invalid coupon code");
      setCouponApplied("");
      return;
    }

    if (isValidCoupon(couponCode)) {
      setCouponApplied(getValidCouponCode());
      setCouponError("");
      return;
    }

    setCouponError("Invalid coupon code");
    setCouponApplied("");
  };

  const handleCompleteBooking = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !items.length) return;

    const bookingId = `TRK-${Date.now().toString().slice(-6)}`;
    const destination = items[0]?.destination ?? "India";
    const hotel = items.find((item) => item.type === "stay")?.name ?? null;
    const cab = items.find((item) => item.type === "cab")?.name ?? null;
    const guide = items.find((item) => item.type === "guide")?.name ?? null;

    const record: BookingRecord = {
      id: bookingId,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      destination,
      hotel,
      cab,
      guide,
      items,
      total: finalTotal,
      couponUsed: couponApplied || null,
      bookingDate: new Date().toISOString(),
      status: "Pending",
    };

    const existingBookings = readBookings();
    writeBookings([record, ...existingBookings]);
    clearTripSelection();
    setBooking(record);
    setItems([]);
  };

  if (!getCurrentUser()) {
    return null;
  }

  if (booking) {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative h-20 bg-hero"><Navbar /></div>
        <section className="mx-auto max-w-4xl px-5 py-16 md:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card md:p-12">
            <div className="mb-6 flex items-center gap-3 text-amber-700">
              <span className="grid size-12 place-items-center rounded-full bg-amber-100"><Clock3 className="size-5" /></span>
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Request Submitted</p>
            </div>
            <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">Awaiting availability confirmation</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Your booking request has been sent. It will be confirmed after the selected businesses approve availability.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Order ID</p><p className="mt-2 font-display text-2xl font-semibold">{booking.id}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">User name</p><p className="mt-2 font-display text-2xl font-semibold">{booking.userName}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Selected destination</p><p className="mt-2 font-display text-2xl font-semibold">{booking.destination}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Selected services</p><p className="mt-2 font-display text-2xl font-semibold">{[booking.hotel, booking.cab, booking.guide].filter(Boolean).join(" ? ") || "Trip package"}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Total amount</p><p className="mt-2 font-display text-2xl font-semibold">{formatCurrency(booking.total)}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Coupon used</p><p className="mt-2 font-display text-2xl font-semibold">{booking.couponUsed || "None"}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Booking date</p><p className="mt-2 font-display text-2xl font-semibold">{new Date(booking.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
              <div className="rounded-2xl bg-secondary p-5"><p className="text-sm text-muted-foreground">Status</p><p className="mt-2 font-display text-2xl font-semibold text-amber-700">{booking.status}</p></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate({ to: "/my-plans" })} className="rounded-full">View My Plans</Button>
              <Button variant="outline" asChild className="rounded-full"><a href="/explore">Continue exploring</a></Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-20 bg-hero"><Navbar /></div>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-8 flex items-center gap-3 text-sm font-semibold text-primary">
          <a href="/explore" className="inline-flex items-center gap-2"><ArrowLeft className="size-4" /> Back to Explore</a>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div>
              <p className="section-label">Checkout</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">Your trip summary</h1>
            </div>
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-lg font-semibold text-foreground">No trip items selected.</p>
                <p className="mt-2 text-muted-foreground">Choose a stay, cab, or guide to build your travel plan.</p>
                <Button asChild className="mt-6 rounded-full"><a href="/explore">Explore destinations</a></Button>
              </div>
            ) : (
              items.map((item) => (
                <article key={`${item.type}-${item.id}`} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-card sm:flex-row">
                  <img src={item.image} alt={item.name} className="h-28 w-full rounded-2xl object-cover sm:w-32" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{getPackageBadge(item)}</p>
                        <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">{item.name}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{item.destination}</p>
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(item.id)} className="rounded-full bg-secondary p-2 text-muted-foreground transition hover:text-foreground" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {item.packageName ? <p><span className="font-semibold text-foreground">Package:</span> {item.packageName}</p> : null}
                      {item.bookingMeta && typeof item.bookingMeta["dates"] === "string" ? <p><span className="font-semibold text-foreground">Dates:</span> {String(item.bookingMeta["dates"])}</p> : null}
                      {item.bookingMeta && typeof item.bookingMeta["route"] === "string" ? <p><span className="font-semibold text-foreground">Route:</span> {String(item.bookingMeta["route"])}</p> : null}
                      {item.bookingMeta && typeof item.bookingMeta["details"] === "string" ? <p><span className="font-semibold text-foreground">Details:</span> {String(item.bookingMeta["details"])}</p> : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <p className="text-base font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                      <span className="text-xs text-muted-foreground">Qty {item.quantity}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="section-label">Summary</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">{packageLabel}</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="rounded-2xl bg-secondary p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>Coupon</span>
                  <span className="rounded-full bg-background px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">TREKO100</span>
                </div>
                <div className="flex gap-2">
                  <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter code" className="h-11" />
                  <Button type="button" onClick={handleApplyCoupon} className="h-11 rounded-lg">Apply</Button>
                </div>
                {couponError ? <p className="mt-2 text-sm text-destructive">{couponError}</p> : null}
                {couponApplied ? <p className="mt-2 text-sm font-medium text-emerald-600">Coupon applied: {couponApplied}</p> : null}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Demo Discount</span><span>-{formatCurrency(discount)}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-base font-semibold text-foreground">Final Demo Total</span>
                <span className="font-display text-3xl font-semibold text-primary">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
            <Button onClick={handleCompleteBooking} disabled={!items.length} className="mt-8 h-12 w-full rounded-full text-base">
              Complete booking
            </Button>
          </aside>
        </div>
      </section>
    </main>
  );
}
