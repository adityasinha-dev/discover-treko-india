import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Route } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/TrekoLanding";
import { getCurrentUser, readBookings, readTripSelection, type BookingRecord, type TripItem } from "@/lib/auth";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function getBookingDestinations(booking: BookingRecord): string[] {
  return booking.items.flatMap((item) => {
    const destinationValue = item.bookingMeta?.["destinationsCovered"];
    return typeof destinationValue === "string" ? [destinationValue] : [];
  });
}

function parsePlanDate(value: string): Date | null {
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isCurrentOrFuturePlan(booking: BookingRecord, today: Date): boolean {
  const travelDates = booking.items.flatMap((item) => {
    const metadata = item.bookingMeta;
    const dateValues = [
      metadata?.["checkOutDate"],
      metadata?.["travelDate"],
      metadata?.["tourDate"],
      metadata?.["dates"],
    ];

    return dateValues.flatMap((value) => {
      if (typeof value !== "string" || !value) return [];
      const lastDateInRange = value.includes("→") ? value.split("→").at(-1)?.trim() : value;
      const date = parsePlanDate(lastDateInRange);
      return date ? [date] : [];
    });
  });

  const fallbackDate = parsePlanDate(booking.bookingDate);
  const planEndDate = travelDates.length
    ? new Date(Math.max(...travelDates.map((date) => date.getTime())))
    : fallbackDate;

  return planEndDate !== null && planEndDate >= today;
}

export function MyPlansPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [draftItems, setDraftItems] = useState<TripItem[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate({ to: "/login" });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setBookings(
      readBookings().filter(
        (booking) => booking.userId === currentUser.id && isCurrentOrFuturePlan(booking, today),
      ),
    );
    setDraftItems(readTripSelection());
  }, [navigate]);

  if (!getCurrentUser()) {
    return null;
  }

  if (!bookings.length && !draftItems.length) {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative h-20 bg-hero"><Navbar /></div>
        <section className="mx-auto max-w-3xl px-5 py-20 md:px-8">
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card">
            <p className="section-label">My Plans</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">You don't have any trips planned yet.</h1>
            <p className="mt-4 text-muted-foreground">Build your next memorable journey across India.</p>
            <Button asChild className="mt-8 rounded-full">
              <a href="/explore">Plan Your Trip</a>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-20 bg-hero"><Navbar /></div>
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="mb-8">
          <p className="section-label">My Plans</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
            {bookings.length ? "Your trips" : "Your trip selection"}
          </h1>
        </div>
        <div className="grid gap-6">
          {draftItems.length > 0 ? (
            <article className="rounded-3xl border border-primary/30 bg-card p-6 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Not booked yet</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                    {draftItems[0].destination} trip selection
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your selected services are saved. Continue to checkout to confirm this demo trip.
                  </p>
                </div>
                <p className="font-display text-2xl font-semibold text-primary">
                  {formatCurrency(draftItems.reduce((total, item) => total + item.price * item.quantity, 0))}
                </p>
              </div>
              <ul className="mt-5 space-y-3">
                {draftItems.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="rounded-2xl bg-secondary p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category} · {item.packageName}</p>
                        {typeof item.bookingMeta?.dates === "string" ? (
                          <p className="mt-1 text-sm text-muted-foreground">{item.bookingMeta.dates}</p>
                        ) : null}
                        {typeof item.bookingMeta?.route === "string" ? (
                          <p className="mt-1 text-sm text-muted-foreground">{item.bookingMeta.route}</p>
                        ) : null}
                        {typeof item.bookingMeta?.details === "string" ? (
                          <p className="mt-1 text-sm text-muted-foreground">{item.bookingMeta.details}</p>
                        ) : null}
                      </div>
                      <p className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button type="button" onClick={() => navigate({ to: "/checkout" })} className="mt-5 rounded-full">
                Continue to Checkout
              </Button>
            </article>
          ) : null}
          {bookings.map((booking) => {
            const isExpanded = activeBookingId === booking.id;
            return (
              <article key={booking.id} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${booking.status === "Pending" ? "text-amber-700" : "text-emerald-600"}`}>
                      {booking.status === "Pending" ? "Awaiting business approval" : booking.status}
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">{booking.destination}</h2>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-primary" />{booking.hotel || "Hotel not selected"}</span>
                      <span className="inline-flex items-center gap-2"><Route className="size-4 text-primary" />{booking.cab || "Cab not selected"}</span>
                      <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{new Date(booking.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="mt-1 font-display text-xl font-semibold text-foreground">{booking.id}</p>
                    <p className="mt-2 text-lg font-bold text-primary">{formatCurrency(booking.total)}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Hotel: {booking.hotel || "?"}</span>
                    <span>Cab: {booking.cab || "?"}</span>
                    <span>Guide: {booking.guide || "?"}</span>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setActiveBookingId(isExpanded ? null : booking.id)} className="rounded-full">{isExpanded ? "Hide Details" : "View Plan Details"}</Button>
                </div>
                {isExpanded ? (
                  <div className="mt-5 rounded-2xl bg-secondary p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destination</p>
                        <p className="mt-2 font-semibold text-foreground">{booking.destination}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                        <p className="mt-2 font-semibold text-foreground">{formatCurrency(booking.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                        <p className={`mt-2 font-semibold ${booking.status === "Pending" ? "text-amber-700" : "text-emerald-600"}`}>
                          {booking.status === "Pending" ? "Awaiting business approval" : booking.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Coupon Used</p>
                        <p className="mt-2 font-semibold text-foreground">{booking.couponUsed || "None"}</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trip Summary</p>
                      <ul className="mt-3 space-y-2 text-sm text-foreground">
                        {booking.items.map((item) => (
                          <li key={`${item.type}-${item.id}`} className="flex flex-col gap-1 rounded-xl bg-background px-3 py-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-muted-foreground">{item.category}{item.packageName ? ` · ${item.packageName}` : ""}</p>
                              {typeof item.bookingMeta?.dates === "string" ? (
                                <p className="mt-1 text-muted-foreground">{item.bookingMeta.dates}</p>
                              ) : null}
                              {typeof item.bookingMeta?.route === "string" ? (
                                <p className="mt-1 text-muted-foreground">{item.bookingMeta.route}</p>
                              ) : null}
                              {typeof item.bookingMeta?.details === "string" ? (
                                <p className="mt-1 text-muted-foreground">{item.bookingMeta.details}</p>
                              ) : null}
                            </div>
                            <span className="text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-5 rounded-xl bg-background p-4 text-sm text-foreground">
                      <p className="font-semibold">Destinations covered</p>
                      <p className="mt-2 text-muted-foreground">
                        {getBookingDestinations(booking).join(" → ") || "Trip route details available in the summary."}
                      </p>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
