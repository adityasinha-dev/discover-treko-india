import { useState } from "react";
import { ArrowLeft, Check, Compass, Languages, MapPin, ShieldCheck, Star } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/TrekoLanding";
import { getDestinationBySlug, getListingBySlug } from "@/data/treko";
import { upsertTripSelection, type TripItem } from "@/lib/auth";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function toDateLabel(dateValue: string) {
  if (!dateValue) return "Select a date";
  return new Date(dateValue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getNights(start: string, end: string) {
  if (!start || !end) return 1;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) || 1);
}

export function ListingDetailPage() {
  const { destination, listingSlug } = useParams({ from: "/$destination/$listingSlug" });
  const navigate = useNavigate();
  const listing = getListingBySlug(destination, listingSlug);
  const destinationInfo = getDestinationBySlug(destination);

  const [hotelForm, setHotelForm] = useState({
    checkIn: "2026-10-15",
    checkOut: "2026-10-17",
    guests: "2",
    rooms: "1",
  });
  const [cabForm, setCabForm] = useState({
    travelDate: "2026-10-15",
    pickup: "Railway Station",
    drop: "Hotel",
    pickupTime: "08:30",
    passengers: "3",
    vehicle: "Sedan",
  });
  const [guideForm, setGuideForm] = useState({
    tourDate: "2026-10-16",
    people: "2",
    packageId: "heritage-temple-tour",
    startPoint: "Mahakaleshwar Temple",
    duration: "2 days",
  });

  if (!listing || !destinationInfo) {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative h-20 bg-hero"><Navbar /></div>
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-4xl font-semibold">Listing not found</h1>
          <p className="mt-3 text-muted-foreground">This listing is not available in Treko right now.</p>
          <Button asChild className="mt-7 rounded-full"><a href="/explore"><ArrowLeft /> Back to Explore</a></Button>
        </div>
      </main>
    );
  }

  const hotelTotal = listing.kind === "stay"
    ? listing.data.price * getNights(hotelForm.checkIn, hotelForm.checkOut) * Number(hotelForm.rooms || 1)
    : 0;
  const cabTotal = listing.kind === "cab"
    ? listing.data.price * (Number(cabForm.passengers || 1) > 4 ? 1.5 : 1)
    : 0;

  const guidePackage = listing.kind === "guide"
    ? listing.data.packages.find((pkg) => pkg.id === guideForm.packageId) ?? listing.data.packages[0] ?? null
    : null;

  const guideTotal = guidePackage ? guidePackage.price * Number(guideForm.people || 1) : 0;

  const bookStay = () => {
    if (listing.kind !== "stay") return;
    const detail = listing.data;
    const selectedItem: TripItem = {
      id: detail.id,
      type: "stay",
      category: "Hotel",
      name: detail.name,
      image: detail.image,
      location: detail.location,
      packageName: detail.roomInfo,
      price: hotelTotal,
      quantity: 1,
      destination: destinationInfo.name,
      bookingMeta: {
        dates: `${toDateLabel(hotelForm.checkIn)} → ${toDateLabel(hotelForm.checkOut)}`,
        checkInDate: hotelForm.checkIn,
        checkOutDate: hotelForm.checkOut,
        guests: `${hotelForm.guests} Guests`,
        rooms: `${hotelForm.rooms} Rooms`,
        details: `${detail.roomInfo} • ${detail.checkInTime} check-in • ${detail.checkOutTime} check-out`,
      },
    };
    upsertTripSelection(selectedItem);
    navigate({ to: "/checkout" });
  };

  const bookCab = () => {
    if (listing.kind !== "cab") return;
    const detail = listing.data;
    const selectedItem: TripItem = {
      id: detail.id,
      type: "cab",
      category: "Cab Operator",
      name: detail.name,
      image: detail.image,
      location: detail.destination,
      packageName: cabForm.vehicle,
      price: cabTotal,
      quantity: 1,
      destination: destinationInfo.name,
      bookingMeta: {
        dates: toDateLabel(cabForm.travelDate),
        travelDate: cabForm.travelDate,
        route: `${cabForm.pickup} → ${cabForm.drop}`,
        details: `${cabForm.vehicle} • ${cabForm.passengers} Passengers • ${cabForm.pickupTime}`,
      },
    };
    upsertTripSelection(selectedItem);
    navigate({ to: "/checkout" });
  };

  const bookGuide = () => {
    if (listing.kind !== "guide") return;
    const detail = listing.data;
    const selectedItem: TripItem = {
      id: detail.id,
      type: "guide",
      category: "Guide",
      name: detail.name,
      image: detail.image,
      location: detail.destination,
      packageName: guidePackage?.name ?? "Guide package",
      price: guideTotal,
      quantity: 1,
      destination: destinationInfo.name,
      bookingMeta: {
        dates: toDateLabel(guideForm.tourDate),
        tourDate: guideForm.tourDate,
        route: guideForm.startPoint,
        details: `${guidePackage?.destinationsCovered.join(" → ") ?? detail.destinationsCovered.join(" → ")}`,
        destinationsCovered: guidePackage?.destinationsCovered.join(" → ") ?? detail.destinationsCovered.join(" → "),
        people: `${guideForm.people} People`,
        duration: guideForm.duration,
      },
    };
    upsertTripSelection(selectedItem);
    navigate({ to: "/checkout" });
  };

  if (listing.kind === "stay") {
    const detail = listing.data;
    return (
      <main className="min-h-screen bg-background">
        <div className="relative bg-hero"><Navbar /><div className="mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8"><a href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to Explore</a><div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr]"><div><p className="section-label">{detail.destination}</p><h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{detail.name}</h1><p className="mt-4 max-w-2xl text-muted-foreground">{detail.description}</p><div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold"><span className="tag"><Star className="size-3 fill-primary text-primary" />{detail.rating}</span><span className="tag"><MapPin className="size-3" />{detail.location}</span></div></div><div className="overflow-hidden rounded-3xl shadow-hero"><img src={detail.image} alt={detail.name} className="h-full w-full object-cover" /></div></div></div></div>
        <section className="section-pad"><div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1.2fr_0.8fr] md:px-8"><div className="space-y-8"><div><h2 className="font-display text-3xl font-semibold">Hotel Information</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{detail.images.map((image, index) => <img key={`${detail.id}-${index}`} src={image} alt={`${detail.name} gallery ${index + 1}`} className="h-44 w-full rounded-2xl object-cover" />)}</div><div className="mt-6 grid gap-6 md:grid-cols-2"><div className="rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Availability</p><p className="mt-2 font-semibold">{detail.availability}</p></div><div className="rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p><p className="mt-2 font-semibold text-primary">{formatCurrency(detail.price)} / night</p></div></div><div className="mt-6 rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Amenities</p><div className="mt-4 flex flex-wrap gap-2">{detail.amenities.map((item) => <span key={item} className="tag"><Check className="size-3" />{item}</span>)}</div></div></div><div className="rounded-2xl border border-border bg-card p-6 shadow-card"><h3 className="font-display text-2xl font-semibold">Terms & Conditions</h3><ul className="mt-4 space-y-3 text-sm text-muted-foreground">{detail.terms.map((term) => <li key={term} className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 text-primary" />{term}</li>)}</ul></div></div>
          <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="section-label">Booking</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">Book Hotel</h3>
            <div className="mt-6 space-y-4 text-sm">
              <label className="block"><span className="mb-2 block font-semibold">Check-in</span><Input type="date" value={hotelForm.checkIn} onChange={(event) => setHotelForm((current) => ({ ...current, checkIn: event.target.value }))} /></label>
              <label className="block"><span className="mb-2 block font-semibold">Check-out</span><Input type="date" value={hotelForm.checkOut} onChange={(event) => setHotelForm((current) => ({ ...current, checkOut: event.target.value }))} /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-semibold">Guests</span><Input value={hotelForm.guests} onChange={(event) => setHotelForm((current) => ({ ...current, guests: event.target.value }))} /></label><label className="block"><span className="mb-2 block font-semibold">Rooms</span><Input value={hotelForm.rooms} onChange={(event) => setHotelForm((current) => ({ ...current, rooms: event.target.value }))} /></label></div>
            </div>
            <div className="mt-6 rounded-2xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Calculated demo amount</p><p className="mt-2 font-display text-3xl font-semibold text-primary">{formatCurrency(hotelTotal)}</p><p className="mt-2 text-xs text-muted-foreground">{getNights(hotelForm.checkIn, hotelForm.checkOut)} nights • {hotelForm.rooms} room(s) • {hotelForm.guests} guests</p></div>
            <Button onClick={bookStay} className="mt-6 h-12 w-full rounded-full">Book Hotel</Button>
          </aside>
        </div></section>
      </main>
    );
  }

  if (listing.kind === "cab") {
    const detail = listing.data;
    return (
      <main className="min-h-screen bg-background">
        <div className="relative bg-hero"><Navbar /><div className="mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8"><a href="/cab-operators" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to operators</a><div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr]"><div><p className="section-label">{detail.destination}</p><h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{detail.name}</h1><p className="mt-4 max-w-2xl text-muted-foreground">{detail.description}</p><div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold"><span className="tag"><Star className="size-3 fill-primary text-primary" />{detail.rating}</span><span className="tag"><MapPin className="size-3" />{detail.destination}</span></div></div><div className="overflow-hidden rounded-3xl shadow-hero"><img src={detail.image} alt={detail.name} className="h-full w-full object-cover" /></div></div></div></div>
        <section className="section-pad"><div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1.2fr_0.8fr] md:px-8"><div className="space-y-8"><div className="rounded-2xl bg-secondary p-6"><h2 className="font-display text-3xl font-semibold">Cab Information</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vehicle types</p><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{detail.vehicleTypes.map((vehicle) => <li key={vehicle}>• {vehicle}</li>)}</ul></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p><p className="mt-2 font-semibold text-primary">{detail.pricing}</p></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Services</p><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{detail.services.map((service) => <li key={service}>• {service}</li>)}</ul></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pickup / Drop</p><p className="mt-2 text-sm text-muted-foreground">{detail.pickupInfo} → {detail.dropInfo}</p></div></div></div><div className="rounded-2xl border border-border bg-card p-6 shadow-card"><h3 className="font-display text-2xl font-semibold">Cab Terms & Conditions</h3><ul className="mt-4 space-y-3 text-sm text-muted-foreground">{detail.terms.map((term) => <li key={term} className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 text-primary" />{term}</li>)}</ul></div></div>
          <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="section-label">Booking</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">Book Cab</h3>
            <div className="mt-6 space-y-4 text-sm">
              <label className="block"><span className="mb-2 block font-semibold">Travel date</span><Input type="date" value={cabForm.travelDate} onChange={(event) => setCabForm((current) => ({ ...current, travelDate: event.target.value }))} /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-semibold">Pickup</span><Input value={cabForm.pickup} onChange={(event) => setCabForm((current) => ({ ...current, pickup: event.target.value }))} /></label><label className="block"><span className="mb-2 block font-semibold">Drop</span><Input value={cabForm.drop} onChange={(event) => setCabForm((current) => ({ ...current, drop: event.target.value }))} /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-semibold">Pickup time</span><Input type="time" value={cabForm.pickupTime} onChange={(event) => setCabForm((current) => ({ ...current, pickupTime: event.target.value }))} /></label><label className="block"><span className="mb-2 block font-semibold">Passengers</span><Input value={cabForm.passengers} onChange={(event) => setCabForm((current) => ({ ...current, passengers: event.target.value }))} /></label></div>
              <label className="block"><span className="mb-2 block font-semibold">Vehicle / package</span><select value={cabForm.vehicle} onChange={(event) => setCabForm((current) => ({ ...current, vehicle: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Tempo Traveller">Tempo Traveller</option></select></label>
            </div>
            <div className="mt-6 rounded-2xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Estimated demo price</p><p className="mt-2 font-display text-3xl font-semibold text-primary">{formatCurrency(cabTotal)}</p><p className="mt-2 text-xs text-muted-foreground">{cabForm.vehicle} • {cabForm.passengers} passengers</p></div>
            <Button onClick={bookCab} className="mt-6 h-12 w-full rounded-full">Book Cab</Button>
          </aside>
        </div></section>
      </main>
    );
  }

  const detail = listing.data;
  return (
    <main className="min-h-screen bg-background">
      <div className="relative bg-hero"><Navbar /><div className="mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8"><a href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to Explore</a><div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr]"><div><p className="section-label">{detail.destination}</p><h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{detail.name}</h1><p className="mt-4 max-w-2xl text-muted-foreground">{detail.description}</p><div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold"><span className="tag"><Star className="size-3 fill-primary text-primary" />{detail.rating}</span><span className="tag"><Languages className="size-3" />{detail.languages.join(" • ")}</span></div></div><div className="overflow-hidden rounded-3xl shadow-hero"><img src={detail.image} alt={detail.name} className="h-full w-full object-cover" /></div></div></div></div>
      <section className="section-pad"><div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1.2fr_0.8fr] md:px-8"><div className="space-y-8"><div className="rounded-2xl bg-secondary p-6"><h2 className="font-display text-3xl font-semibold">Guide Profile</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Languages</p><p className="mt-2 text-sm text-muted-foreground">{detail.languages.join(" • ")}</p></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Experience</p><p className="mt-2 text-sm text-muted-foreground">{detail.experience}</p></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Specialization</p><p className="mt-2 text-sm text-muted-foreground">{detail.specialization}</p></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p><p className="mt-2 font-semibold text-primary">{detail.priceLabel}</p></div></div></div><div className="rounded-2xl border border-border bg-card p-6 shadow-card"><h3 className="font-display text-2xl font-semibold">Your Guide Package Covers</h3>{guidePackage ? <div className="mt-5"><p className="font-semibold text-primary">{guidePackage.name}</p><div className="mt-4 grid gap-4 md:grid-cols-2">{guidePackage.itinerary.map((day) => <div key={day.day} className="rounded-xl bg-secondary p-4"><p className="font-semibold text-foreground">{day.day}</p><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{day.stops.map((stop) => <li key={stop}>• {stop}</li>)}</ul></div>)}</div></div> : null}<div className="mt-6"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destinations Covered</p><div className="mt-3 flex flex-wrap gap-2">{detail.destinationsCovered.map((location) => <span key={location} className="tag"><Compass className="size-3" />{location}</span>)}</div></div></div><div className="rounded-2xl border border-border bg-card p-6 shadow-card"><h3 className="font-display text-2xl font-semibold">Terms & Conditions</h3><ul className="mt-4 space-y-3 text-sm text-muted-foreground">{detail.terms.map((term) => <li key={term} className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 text-primary" />{term}</li>)}</ul></div></div>
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <p className="section-label">Booking</p>
          <h3 className="mt-2 font-display text-3xl font-semibold">Book Guide</h3>
          <div className="mt-6 space-y-4 text-sm">
            <label className="block"><span className="mb-2 block font-semibold">Tour date</span><Input type="date" value={guideForm.tourDate} onChange={(event) => setGuideForm((current) => ({ ...current, tourDate: event.target.value }))} /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-semibold">People</span><Input value={guideForm.people} onChange={(event) => setGuideForm((current) => ({ ...current, people: event.target.value }))} /></label><label className="block"><span className="mb-2 block font-semibold">Duration</span><Input value={guideForm.duration} onChange={(event) => setGuideForm((current) => ({ ...current, duration: event.target.value }))} /></label></div>
            <label className="block"><span className="mb-2 block font-semibold">Package</span><select value={guideForm.packageId} onChange={(event) => setGuideForm((current) => ({ ...current, packageId: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal">{detail.packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}</select></label>
            <label className="block"><span className="mb-2 block font-semibold">Starting point</span><Input value={guideForm.startPoint} onChange={(event) => setGuideForm((current) => ({ ...current, startPoint: event.target.value }))} /></label>
          </div>
          <div className="mt-6 rounded-2xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Selected package</p><p className="mt-2 font-semibold">{guidePackage?.name ?? "Guide package"}</p><p className="mt-2 text-sm text-muted-foreground">{guidePackage?.destinationsCovered.join(" → ") ?? detail.destinationsCovered.join(" → ")}</p><p className="mt-4 font-display text-3xl font-semibold text-primary">{formatCurrency(guideTotal)}</p></div>
          <Button onClick={bookGuide} className="mt-6 h-12 w-full rounded-full">Book Guide</Button>
        </aside>
      </div></section>
    </main>
  );
}
