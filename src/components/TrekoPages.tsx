import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, BedDouble, CarFront, Check, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/TrekoLanding";
import { ImageCarousel } from "@/components/ImageCarousel";
import { createListingUrl, destinations, operators, stays } from "@/data/treko";
import { PartnerPage as PartnerPortalPage } from "@/components/PartnerPortal";
import { apiRequest } from "@/lib/api";

function PageFrame({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-background"><div className="relative h-20 bg-hero"><Navbar /></div>{children}</main>;
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="mx-auto mb-10 max-w-3xl text-center"><p className="section-label">{eyebrow}</p><h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">{title}</h1><p className="mt-4 leading-7 text-muted-foreground">{copy}</p></div>;
}

export function ExplorePage() {
  return <PageFrame><section className="section-pad"><div className="mx-auto max-w-7xl px-5 md:px-8"><PageIntro eyebrow="Made for journeys across India" title="Explore India" copy="Find the places, stays and local travel that make your next trip yours."/><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{destinations.map((item) => <a key={item.id} href={`/destination/${item.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"><div className="aspect-[4/3] w-full overflow-hidden"><img src={item.image} alt={`${item.name}, ${item.state}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/></div><div className="flex flex-1 flex-col p-5"><p className="text-xs font-bold uppercase text-primary">{item.state}</p><h2 className="mt-1 font-display text-2xl font-semibold">{item.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-4 flex flex-wrap gap-2"><span className="tag"><BedDouble/>{item.stays}</span><span className="tag"><CarFront/>{item.cabs}</span></div><span className="mt-auto flex items-center justify-between pt-4 text-sm font-semibold text-primary">Explore {item.name}<ArrowRight className="size-4"/></span></div></a>)}</div></div></section></PageFrame>;
}

export function StaysPage() {
  const [partnerStays, setPartnerStays] = useState<Array<{ id: string; name: string; description: string; destination: string; city: string; state: string; address: string; price: number | null; priceLabel: string; images: string[]; amenities: string[]; rating: number | null; roomTypes: string[]; roomTypePhotos: Array<{ name: string; bedType: string; maxGuests: number; beds: number; price: number | null; description: string; amenities: string[]; images: string[] }>; availability: string; terms: string[]; checkIn: string; checkOut: string }>>([]);
  useEffect(() => {
    apiRequest<{ listings: typeof partnerStays }>("/api/partners/public/listings?type=hotel")
      .then((result) => setPartnerStays(result.listings))
      .catch(() => setPartnerStays([]));
  }, []);
  const additionalPartnerStays = partnerStays.filter(
    (partnerStay) =>
      !stays.some(
        (existingStay) =>
          existingStay.name.trim().toLowerCase() === partnerStay.name.trim().toLowerCase() &&
          existingStay.destination === partnerStay.destination,
      ),
  );
  return (
    <PageFrame>
      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <PageIntro eyebrow="Accommodation" title="Stays across India" copy="Browse every stay currently listed in Treko. Details and prices are prototype information." />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {additionalPartnerStays.map((item) => (
              <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card">
                {item.images[0] ? <img src={item.images[0]} alt={item.name} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-secondary" />}
                  {item.images.length > 1 ? (
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {item.images.slice(1, 5).map((image, index) => (
                        <img key={`${image.slice(0, 40)}-${index}`} src={image} alt={`${item.name} gallery ${index + 2}`} className="aspect-square w-full rounded-md object-cover" />
                      ))}
                    </div>
                  ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-xl font-semibold">{item.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{item.city || item.destination}{item.state ? `, ${item.state}` : ""}</p>
                  {item.rating ? <p className="mt-2 flex items-center gap-1 text-sm font-bold"><Star className="size-4 fill-primary text-primary" />{item.rating}</p> : null}
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  {item.availability ? <p className="mt-3 text-xs text-muted-foreground">Availability: {item.availability}</p> : null}
                  {item.amenities.length ? <div className="my-4 flex flex-wrap gap-2">{item.amenities.slice(0, 5).map((amenity) => <span className="tag" key={amenity}><Check />{amenity}</span>)}</div> : null}
                  {item.roomTypes?.length ? (
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Room types</p>
                      {item.roomTypes.map((roomName) => {
                        const room = item.roomTypePhotos?.find((roomOption) => roomOption.name === roomName);
                        const photos = room?.images ?? [];
                        return (
                          <div key={roomName} className="rounded-lg bg-secondary p-2">
                            <p className="text-sm font-semibold">{roomName}</p>
                            {room?.bedType ? <p className="mt-1 text-xs text-muted-foreground">{room.bedType} · Sleeps {room.maxGuests} · {room.beds} bed(s)</p> : null}
                            {room?.price != null ? <p className="mt-1 text-xs font-bold text-primary">₹{room.price.toLocaleString("en-IN")} / night</p> : null}
                            {room?.description ? <p className="mt-1 text-xs text-muted-foreground">{room.description}</p> : null}
                            {room?.amenities?.length ? <p className="mt-1 text-xs text-muted-foreground">{room.amenities.join(" • ")}</p> : null}
                            {photos.length ? (
                              <div className="mt-2 grid grid-cols-4 gap-1">
                                {photos.slice(0, 4).map((photo, index) => (
                                  <img key={`${photo.slice(0, 40)}-${index}`} src={photo} alt={`${roomName} room ${index + 1}`} className="aspect-square w-full rounded-md object-cover" />
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4"><p className="font-display text-xl font-bold">{item.priceLabel || (item.price != null ? `₹${item.price.toLocaleString("en-IN")}/night` : "Contact for price")}</p></div>
                </div>
              </article>
            ))}
            {stays.map((item) => (
              <article key={item.name} className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ImageCarousel images={item.images} label={item.name} className="absolute inset-0" />
                  <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1.5 text-xs font-bold">{item.type}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold">{item.name}</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{item.location}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold"><Star className="size-4 fill-primary text-primary" />{item.rating}</span>
                  </div>
                  <div className="my-4 flex flex-wrap gap-2">{item.amenities.map((amenity) => <span className="tag" key={amenity}><Check />{amenity}</span>)}</div>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="min-w-0"><span className="font-display text-xl font-bold">{item.priceLabel ?? item.price}</span></p>
                    <a href={createListingUrl(item.destinationId, item.slug)} className="shrink-0 text-sm font-semibold text-primary">View Hotel</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">Prototype listings and prices shown for demonstration only.</p>
        </div>
      </section>
    </PageFrame>
  );
}

export function CabOperatorsPage() {
  const [partnerCabs, setPartnerCabs] = useState<Array<{ id: string; name: string; description: string; destination: string; priceLabel: string; images: string[]; seatingCapacity: number | null; serviceAreas: string[] }>>([]);
  useEffect(() => {
    apiRequest<{ listings: typeof partnerCabs }>("/api/partners/public/listings?type=cab")
      .then((result) => setPartnerCabs(result.listings))
      .catch(() => setPartnerCabs([]));
  }, []);
  return <PageFrame>
    <section className="section-pad">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <PageIntro eyebrow="Local travel" title="Cab operators" copy="Explore all operator listings currently available in Treko and the areas they serve." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {partnerCabs.map((item) => (
            <article key={item.id} className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
              {item.images[0] ? <img src={item.images[0]} alt={item.name} className="mb-5 aspect-[16/9] rounded-xl object-cover" /> : null}
              <h2 className="font-display text-xl font-semibold">{item.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              {item.serviceAreas.length ? <p className="mt-3 text-sm text-muted-foreground">Areas: {item.serviceAreas.join(" • ")}</p> : null}
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5"><p className="text-sm font-bold text-primary">{item.priceLabel || "Contact for fare"}{item.seatingCapacity ? ` · ${item.seatingCapacity} seats` : ""}</p></div>
            </article>
          ))}
          {operators.map((item) => (
            <article key={item.name} className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5 lg:p-6">
              <ImageCarousel images={item.images} label={item.name} className="mb-5 aspect-[16/9] rounded-xl" />
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-xl bg-accent font-display font-bold text-primary">{item.initials}</span>
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold"><Star className="size-3 fill-primary text-primary" />{item.rating}</span>
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold">{item.name}</h2>
              <div className="mt-3 text-sm">
                <p className="font-semibold">Services</p>
                <p className="mt-1 text-muted-foreground">
                  {item.services.slice(0, 2).join(" • ")}
                  {item.services.length > 2 ? " etc." : ""}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
                <p className="text-sm font-bold text-primary">{item.pricing}</p>
                <a href={createListingUrl(item.destinationId, item.slug)} className="shrink-0 text-sm font-semibold text-primary">View Cab</a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">Prototype operator details are illustrative and not verified listings.</p>
      </div>
    </section>
  </PageFrame>;
}

export function PartnerPage() {
  return <PartnerPortalPage />;
}
