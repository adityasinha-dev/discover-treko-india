import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Route } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { Navbar } from "@/components/TrekoLanding";
import { isSupportedDestination } from "@/data/treko";
import {
  getCurrentUser,
  readBookings,
  readTripSelection,
  saveTripSelection,
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

function formatPlanDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "Not specified";
  const date = parsePlanDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : value;
}

function getStayDates(booking: BookingRecord): { checkIn: string; checkOut: string } {
  const stay = booking.items.find((item) => item.type === "stay");
  const metadata = stay?.bookingMeta;
  const dates = typeof metadata?.["dates"] === "string" ? metadata["dates"] : "";
  const range = dates.includes("→") ? dates.split("→").map((date) => date.trim()) : [];
  return {
    checkIn: formatPlanDate(metadata?.["checkInDate"] ?? range[0]),
    checkOut: formatPlanDate(metadata?.["checkOutDate"] ?? range[1]),
  };
}

export function MyPlansPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [draftItems, setDraftItems] = useState<TripItem[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [bookingSyncError, setBookingSyncError] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate({ to: "/login" });
      return;
    }
    setIsAuthenticated(true);

    const filterBookings = (allBookings: BookingRecord[]) =>
      allBookings.filter((booking) => booking.userId === currentUser.id);
    setBookings(filterBookings(readBookings()));
    let active = true;
    void apiRequest<{ bookings: BookingRecord[] }>("/api/bookings/mine")
      .then(({ bookings: serverBookings }) => {
        if (!active) return;
        writeBookings(serverBookings);
        setBookings(filterBookings(serverBookings));
        setBookingSyncError("");
      })
      .catch((error) => {
        if (!active) return;
        setBookingSyncError(
          error instanceof Error
            ? `Unable to refresh booking status: ${error.message}`
            : "Unable to refresh booking status.",
        );
      });
    const supportedDraftItems = readTripSelection().filter((item) =>
      isSupportedDestination(item.destination),
    );
    saveTripSelection(supportedDraftItems);
    setDraftItems(supportedDraftItems);
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (!bookings.length && !draftItems.length) {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative h-20 bg-hero"><Navbar /></div>
        <section className="mx-auto max-w-3xl px-5 py-20 md:px-8">
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card">
            <p className="section-label">My Plans</p>
            {bookingSyncError ? <p role="alert" className="mt-4 text-sm text-destructive">{bookingSyncError}</p> : null}
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
          {bookingSyncError ? <p role="alert" className="mt-3 text-sm text-destructive">{bookingSyncError}</p> : null}
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
            const stayDates = getStayDates(booking);
            const paymentStatus = booking.paymentStatus ?? "Unpaid";
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
                {booking.status === "Confirmed" ? (
                  <section className="mt-5 rounded-2xl bg-secondary p-5">
                    <h3 className="font-display text-xl font-semibold text-foreground">Confirmed booking details</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {booking.hotel ? (
                        <>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Check-in</p>
                            <p className="mt-2 font-semibold text-foreground">{stayDates.checkIn}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Check-out</p>
                            <p className="mt-2 font-semibold text-foreground">{stayDates.checkOut}</p>
                          </div>
                        </>
                      ) : null}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payment status</p>
                        <p className="mt-2 font-semibold text-foreground">
                          {paymentStatus === "Paid" ? "Already paid" : "Payment due"}
                        </p>
                        {paymentStatus !== "Paid" ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Amount due: {formatCurrency(booking.total)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {booking.businesses?.length ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {booking.businesses.map((business) => (
                          <article
                            key={`${business.businessName}-${business.listingName}`}
                            className="rounded-lg border border-border bg-background p-4"
                          >
                            <p className="font-semibold text-foreground">{business.businessName}</p>
                            <p className="text-sm text-muted-foreground">{business.listingName}</p>
                            <p className="mt-3 text-sm">
                              <span className="font-semibold">Address:</span>{" "}
                              {business.address || "Not provided"}
                            </p>
                            <p className="mt-2 text-sm">
                              <span className="font-semibold">Phone:</span>{" "}
                              {business.phone ? (
                                <a href={`tel:${business.phone}`} className="text-primary underline-offset-4 hover:underline">
                                  {business.phone}
                                </a>
                              ) : (
                                "Not provided"
                              )}
                            </p>
                            {business.email ? (
                              <p className="mt-2 text-sm">
                                <span className="font-semibold">Email:</span>{" "}
                                <a href={`mailto:${business.email}`} className="break-all text-primary underline-offset-4 hover:underline">
                                  {business.email}
                                </a>
                              </p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : null}
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
