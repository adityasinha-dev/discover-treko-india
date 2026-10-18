import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Compass, Languages, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/TrekoLanding";
import { ImageCarousel } from "@/components/ImageCarousel";
import { buildHotelRoomOptions, getDestinationBySlug, getListingBySlug } from "@/data/treko";
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

function getSuitableRooms(rooms: { maxGuests: number }[], guestCount: number) {
  if (guestCount <= 2) return rooms.filter((room) => room.maxGuests <= 2);
  if (guestCount <= 4) return rooms.filter((room) => room.maxGuests <= 4);
  return rooms.filter((room) => room.maxGuests >= 4);
}

function ListingHero({
  title,
  destination,
  description,
  images,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  destination: string;
  description: string;
  images: string[];
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="relative bg-hero">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-8">
        <a href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> {backLabel}
        </a>
        <div className="mt-8 grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-label">{destination}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold">{children}</div>
          </div>
          <ImageCarousel
            images={images}
            label={`${title} hero`}
            className="aspect-[4/3] rounded-3xl shadow-hero"
          />
        </div>
      </div>
    </div>
  );
}

export function ListingDetailPage() {
  const { destination, listingSlug } = useParams({ from: "/$destination/$listingSlug" });
  const navigate = useNavigate();
  const listing = getListingBySlug(destination, listingSlug);
  const destinationInfo = getDestinationBySlug(destination);

  const [hotelForm, setHotelForm] = useState({
    checkIn: "2026-10-15",
    checkOut: "2026-10-17",
    adults: "2",
    children: "0",
    rooms: "1",
    selectedRoomId: "",
  });
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
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
  const totalHotelGuests = Number(hotelForm.adults || 1) + Number(hotelForm.children || 0);
  const hotelRoomOptions =
    listing?.kind === "stay"
      ? listing.data.roomOptions ?? buildHotelRoomOptions(listing.data.price, listing.data.image)
      : [];
  const suitableHotelRooms = getSuitableRooms(hotelRoomOptions, totalHotelGuests);
  const selectedHotelRoom =
    suitableHotelRooms.find((room) => room.id === hotelForm.selectedRoomId) ??
    suitableHotelRooms[0] ??
    hotelRoomOptions[0] ??
    null;

  useEffect(() => {
    if (!selectedHotelRoom || hotelForm.selectedRoomId === selectedHotelRoom.id) return;
    setHotelForm((current) => ({ ...current, selectedRoomId: selectedHotelRoom.id }));
  }, [hotelForm.selectedRoomId, selectedHotelRoom]);

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
    const roomOptions = detail.roomOptions ?? buildHotelRoomOptions(detail.price, detail.image);
    const totalGuests = Number(hotelForm.adults || 0) + Number(hotelForm.children || 0);
    const suitableRooms = getSuitableRooms(roomOptions, totalGuests);
    const selectedRoom = suitableRooms.find((room) => room.id === hotelForm.selectedRoomId) ?? suitableRooms[0] ?? roomOptions[0];

    if (!selectedRoom) return;

    const roomPrice = selectedRoom.price;
    const roomNights = getNights(hotelForm.checkIn, hotelForm.checkOut);
    const roomTotal = roomPrice * roomNights * Number(hotelForm.rooms || 1);
    const selectedItem: TripItem = {
      id: detail.id,
      type: "stay",
      category: "Hotel",
      name: detail.name,
      image: detail.image,
      location: detail.location,
      packageName: selectedRoom.name,
      price: roomTotal,
      quantity: 1,
      destination: destinationInfo.name,
      bookingMeta: {
        dates: `${toDateLabel(hotelForm.checkIn)} → ${toDateLabel(hotelForm.checkOut)}`,
        checkInDate: hotelForm.checkIn,
        checkOutDate: hotelForm.checkOut,
        guests: `${totalGuests} Guests`,
        adults: `${hotelForm.adults} Adults`,
        children: `${hotelForm.children} Children`,
        roomType: selectedRoom.name,
        roomBedType: selectedRoom.bedType,
        rooms: `${hotelForm.rooms} Room`,
        roomPrice: roomPrice,
        totalPrice: roomTotal,
        nights: roomNights,
        selectedAmenities: selectedRoom.amenities.join(" • "),
        details: `${selectedRoom.name} • ${selectedRoom.bedType} • ${selectedRoom.amenities.join(" • ")} • ${detail.checkInTime} check-in · ${detail.checkOutTime} check-out`,
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

  const updateGuestValue = (field: "adults" | "children", change: number) => {
    setHotelForm((current) => {
      const currentValue = Number(current[field] || 0);
      const minimum = field === "adults" ? 1 : 0;
      const nextValue = Math.max(minimum, Math.min(8, currentValue + change));
      return { ...current, [field]: String(nextValue) };
    });
  };

  if (listing.kind === "stay") {
    const detail = listing.data;
    const hotelImages = [...new Set([detail.image, ...detail.images])];
    const expandedHotelImage = expandedImageIndex === null ? null : hotelImages[expandedImageIndex] ?? null;
    const totalGuests = totalHotelGuests;
    const suitableRooms = suitableHotelRooms;
    const selectedRoom = selectedHotelRoom;
    const hotelNights = getNights(hotelForm.checkIn, hotelForm.checkOut);
    const hotelNightlyRate = selectedRoom?.price ?? detail.price;
    const hotelTotal = hotelNightlyRate * hotelNights * Number(hotelForm.rooms || 1);
    const showHotelImage = (image: string) => {
      const index = hotelImages.indexOf(image);
      setExpandedImageIndex(index >= 0 ? index : 0);
    };
    const moveHotelImage = (direction: -1 | 1) => {
      setExpandedImageIndex((current) => {
        if (current === null || hotelImages.length < 2) return current;
        return (current + direction + hotelImages.length) % hotelImages.length;
      });
    };
    return (
      <main className="min-h-screen bg-background">
        <ListingHero title={detail.name} destination={detail.destination} description={detail.description} images={hotelImages} backHref="/explore" backLabel="Back to Explore">
          <span className="tag"><Star className="size-3 fill-primary text-primary" />{detail.rating}</span>
          <span className="tag"><MapPin className="size-3" />{detail.location}</span>
        </ListingHero>
        <section className="section-pad"><div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1.2fr_0.8fr] md:px-8"><div className="space-y-8"><div><h2 className="font-display text-3xl font-semibold">Hotel Information</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{detail.images.map((image, index) => { const alt = `${detail.name} gallery ${index + 1}`; return <button key={`${detail.id}-${index}`} type="button" onClick={() => showHotelImage(image)} aria-label={`View larger image: ${alt}`} className="cursor-zoom-in overflow-hidden rounded-2xl text-left"><img src={image} alt={alt} className="h-56 w-full object-cover transition-transform duration-300 hover:scale-[1.03]" /></button>; })}</div><div className="mt-6 grid gap-6 md:grid-cols-2"><div className="rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Availability</p><p className="mt-2 font-semibold">{detail.availability}</p></div><div className="rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p><p className="mt-2 font-semibold text-primary">{formatCurrency(detail.price)} / night</p></div></div><div className="mt-6 rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Amenities</p><div className="mt-4 flex flex-wrap gap-2">{detail.amenities.map((item) => <span key={item} className="tag"><Check className="size-3" />{item}</span>)}</div></div></div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="section-label">Travel details</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">Who is travelling?</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-secondary p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10"><Users className="size-4 text-primary" /></span>
                    <div>
                      <p className="font-semibold">Adults</p>
                      <p className="text-xs text-muted-foreground">Ages 13+</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background px-2 py-1.5">
                    <button type="button" aria-label="Decrease adults" onClick={() => updateGuestValue("adults", -1)} className="grid size-7 place-items-center rounded-full bg-secondary text-lg font-semibold hover:bg-muted">−</button>
                    <span className="min-w-6 text-center text-sm font-semibold">{hotelForm.adults}</span>
                    <button type="button" aria-label="Increase adults" onClick={() => updateGuestValue("adults", 1)} className="grid size-7 place-items-center rounded-full bg-secondary text-lg font-semibold hover:bg-muted">+</button>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-secondary p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10"><Users className="size-4 text-primary" /></span>
                    <div>
                      <p className="font-semibold">Children</p>
                      <p className="text-xs text-muted-foreground">Optional</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background px-2 py-1.5">
                    <button type="button" aria-label="Decrease children" onClick={() => updateGuestValue("children", -1)} className="grid size-7 place-items-center rounded-full bg-secondary text-lg font-semibold hover:bg-muted">−</button>
                    <span className="min-w-6 text-center text-sm font-semibold">{hotelForm.children}</span>
                    <button type="button" aria-label="Increase children" onClick={() => updateGuestValue("children", 1)} className="grid size-7 place-items-center rounded-full bg-secondary text-lg font-semibold hover:bg-muted">+</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium">
              <span>Total travellers</span>
              <span className="text-primary">{totalGuests} guests</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold">Check-in</span>
                <Input type="date" value={hotelForm.checkIn} onChange={(event) => setHotelForm((current) => ({ ...current, checkIn: event.target.value }))} />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold">Check-out</span>
                <Input type="date" value={hotelForm.checkOut} onChange={(event) => setHotelForm((current) => ({ ...current, checkOut: event.target.value }))} />
              </label>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold">Suitable rooms</h3>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">{suitableRooms.length} options</span>
            </div>
            {suitableRooms.length ? (
              <div className="mt-5 space-y-4">
                {suitableRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <article key={room.id} className={`overflow-hidden rounded-3xl border bg-card transition-colors ${isSelected ? "border-primary shadow-card ring-2 ring-primary/20" : "border-border"}`}>
                      <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                        <button type="button" onClick={() => showHotelImage(room.image)} aria-label={`View larger image of ${room.name}`} className="cursor-zoom-in overflow-hidden text-left">
                          <img src={room.image} alt={`${detail.name} ${room.name}`} className="h-56 w-full object-cover transition-transform duration-300 hover:scale-[1.03] md:h-full md:min-h-[200px]" />
                        </button>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="section-label">{room.name}</p>
                              <h4 className="mt-1 text-2xl font-semibold">{room.bedType}</h4>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-2xl font-semibold text-primary">{formatCurrency(room.price)}</p>
                              <p className="text-xs text-muted-foreground">per night</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-secondary px-2 py-1">Sleeps {room.maxGuests}</span>
                            <span className="rounded-full bg-secondary px-2 py-1">{room.beds} bed{room.beds > 1 ? "s" : ""}</span>
                          </div>
                          <p className="mt-4 text-sm text-muted-foreground">{room.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">{room.amenities.map((item) => <span key={`${room.id}-${item}`} className="tag"><Check className="size-3" />{item}</span>)}</div>
                          <Button type="button" onClick={() => setHotelForm((current) => ({ ...current, selectedRoomId: room.id }))} className="mt-5 h-11 rounded-full px-5" variant={isSelected ? "secondary" : "default"}>
                            {isSelected ? "Selected Room" : "Select Room"}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-secondary p-6 text-sm text-muted-foreground">
                No room suits your guest count yet. Try fewer travellers or choose another hotel.
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-2xl font-semibold">Terms & Conditions</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">{detail.terms.map((term) => <li key={term} className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 text-primary" />{term}</li>)}</ul>
          </div>
        </div>
          <aside className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <p className="section-label">Booking summary</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">{detail.name}</h3>
            <div className="mt-5 rounded-2xl bg-secondary p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selected room</p>
              {selectedRoom ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{selectedRoom.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRoom.bedType}</p>
                    </div>
                    <p className="font-display text-2xl font-semibold text-primary">{formatCurrency(selectedRoom.price)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedRoom.amenities.join(" • ")}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Choose a room to continue.</p>
              )}
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium">{totalGuests}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Nights</span><span className="font-medium">{hotelNights}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Check-in</span><span className="font-medium">{toDateLabel(hotelForm.checkIn)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Check-out</span><span className="font-medium">{toDateLabel(hotelForm.checkOut)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Price / night</span><span className="font-medium">{formatCurrency(hotelNightlyRate)}</span></div>
            </div>
            <div className="mt-6 rounded-2xl bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Total price</p>
              <p className="mt-2 font-display text-3xl font-semibold text-primary">{formatCurrency(hotelTotal)}</p>
              <p className="mt-2 text-xs text-muted-foreground">{hotelNights} nights • 1 room • {totalGuests} guests</p>
            </div>
            <Button onClick={bookStay} disabled={!selectedRoom} className="mt-6 h-12 w-full rounded-full">Continue Booking</Button>
          </aside>
        </div>
        <Dialog open={expandedHotelImage !== null} onOpenChange={(open) => { if (!open) setExpandedImageIndex(null); }}>
          <DialogContent
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") moveHotelImage(-1);
              if (event.key === "ArrowRight") moveHotelImage(1);
            }}
            className="w-[calc(100vw-1.5rem)] max-w-6xl border-0 bg-black/95 p-3 text-white shadow-2xl sm:rounded-2xl md:p-5"
          >
            <DialogTitle className="sr-only">{detail.name} image {expandedImageIndex === null ? "" : expandedImageIndex + 1}</DialogTitle>
            {expandedHotelImage ? (
              <div className="relative">
                <img key={expandedHotelImage} src={expandedHotelImage} alt={`${detail.name} image ${expandedImageIndex! + 1}`} className="max-h-[82vh] w-full rounded-xl object-contain transition-opacity duration-300" />
                {hotelImages.length > 1 ? (
                  <>
                    <button type="button" onClick={() => moveHotelImage(-1)} aria-label="Previous hotel image" className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85 sm:left-4">
                      <ChevronLeft className="size-6" />
                    </button>
                    <button type="button" onClick={() => moveHotelImage(1)} aria-label="Next hotel image" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85 sm:right-4">
                      <ChevronRight className="size-6" />
                    </button>
                    <p aria-live="polite" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-sm text-white">
                      {expandedImageIndex! + 1} / {hotelImages.length}
                    </p>
                  </>
                ) : null}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
        </section>
      </main>
    );
  }

  if (listing.kind === "cab") {
    const detail = listing.data;
    const cabImages = [...new Set([detail.image, ...detail.images])];
    return (
      <main className="min-h-screen bg-background">
        <ListingHero title={detail.name} destination={detail.destination} description={detail.description} images={cabImages} backHref="/cab-operators" backLabel="Back to operators">
          <span className="tag"><Star className="size-3 fill-primary text-primary" />{detail.rating}</span>
          <span className="tag"><MapPin className="size-3" />{detail.destination}</span>
        </ListingHero>
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
  const guideImages = [...new Set([detail.image, ...(destinationInfo.images ?? [])])];
  return (
    <main className="min-h-screen bg-background">
      <ListingHero title={detail.name} destination={detail.destination} description={detail.description} images={guideImages} backHref="/explore" backLabel="Back to Explore">
        <span className="tag"><Star className="size-3 fill-primary text-primary" />{detail.rating}</span>
        <span className="tag"><Languages className="size-3" />{detail.languages.join(" • ")}</span>
      </ListingHero>
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
