import { useState } from "react";
import { ArrowLeft, BedDouble, CarFront, Check, Compass, Languages, MapPin, Star, UserRound } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/TrekoLanding";
import { createListingUrl, getDestination, getGuidesForDestination, getOperatorsForDestination, getStaysForDestination } from "@/data/treko";
import { getCurrentUser, parsePrice, readTripSelection, saveTripSelection } from "@/lib/auth";

function EmptyState({ item }: { item: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">No {item} available for this destination yet.</div>;
}

function SectionTitle({ icon: Icon, title, copy }: { icon: typeof BedDouble; title: string; copy: string }) {
  return <div className="mb-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-5" /></span><h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2></div><p className="mt-3 max-w-2xl text-muted-foreground">{copy}</p></div>;
}

function StayCard({ stay, selected, onSelect }: { stay: ReturnType<typeof getStaysForDestination>[number]; selected: boolean; onSelect: () => void }) {
  const detailUrl = createListingUrl(stay.destinationId, stay.slug);

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="aspect-[4/3] overflow-hidden">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
          {stay.images.map((image, index) => (
            <img
              key={`${stay.id}-${index}`}
              src={image}
              alt={`${stay.name}, photo ${index + 1}`}
              className="aspect-[16/10] w-full shrink-0 snap-center rounded-xl object-cover"
            />
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-primary">{stay.type}</p>
            <h3 className="mt-1 font-display text-xl font-semibold">{stay.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />{stay.location}
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-bold">
            <Star className="size-4 fill-primary text-primary" />{stay.rating}
          </span>
        </div>
        <div className="my-4 flex flex-wrap gap-2">
          {stay.amenities.map((amenity) => <span className="tag" key={amenity}><Check />{amenity}</span>)}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="font-display text-xl font-bold">
            {stay.price}<span className="text-xs font-normal text-muted-foreground"> / night</span>
          </p>
          <div className="flex items-center gap-2">
            <a href={detailUrl} className="inline-flex items-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-primary">View Hotel</a>
            <Button
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={onSelect}
            >
              {selected ? "Selected" : "Select stay"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DestinationDetailsPage() {
  const { id } = useParams({ from: "/destination/$id" });
  const navigate = useNavigate();
  const destination = getDestination(id);
  const [selection, setSelection] = useState<{ stay?: string; cab?: string; guide?: string }>(() => {
    const savedItems = readTripSelection().filter((item) => item.destination === destination?.name);
    return {
      stay: savedItems.find((item) => item.type === "stay")?.id,
      cab: savedItems.find((item) => item.type === "cab")?.id,
      guide: savedItems.find((item) => item.type === "guide")?.id,
    };
  });
  if (!destination) return <main className="min-h-screen bg-background"><div className="relative h-20 bg-hero"><Navbar /></div><div className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="font-display text-4xl font-semibold">Destination not found</h1><p className="mt-3 text-muted-foreground">This destination is not currently listed in Treko.</p><Button asChild className="mt-7 rounded-full"><a href="/explore"><ArrowLeft /> Back to Explore</a></Button></div></main>;

  const destinationStays = getStaysForDestination(id);
  const destinationOperators = getOperatorsForDestination(id);
  const destinationGuides = getGuidesForDestination(id);
  const selectedLabel = (type: "stay" | "cab" | "guide") => selection[type] ? <Check className="mr-1 inline size-3" /> : null;

  const buildSelectedItems = (nextSelection: typeof selection) =>
    (["stay", "cab", "guide"] as const)
      .flatMap((type) => {
        const chosenId = nextSelection[type];
        if (!chosenId) return [];

        if (type === "stay") {
          const stay = destinationStays.find((item) => item.id === chosenId);
          if (!stay) return [];
          const savedItem = readTripSelection().find((item) => item.type === type && item.id === stay.id);
          return [savedItem ?? {
            id: stay.id,
            type,
            category: "Hotels / Stays",
            name: stay.name,
            image: stay.image,
            location: stay.location,
            packageName: stay.type,
            price: parsePrice(stay.price),
            quantity: 1,
            destination: destination.name,
          }];
        }

        if (type === "cab") {
          const operator = destinationOperators.find((item) => item.id === chosenId);
          if (!operator) return [];
          const savedItem = readTripSelection().find((item) => item.type === type && item.id === operator.id);
          return [savedItem ?? {
            id: operator.id,
            type,
            category: "Cab Operators",
            name: operator.name,
            image: destination.image,
            location: destination.name,
            packageName: operator.services,
            price: parsePrice(operator.price),
            quantity: 1,
            destination: destination.name,
          }];
        }

        const guide = destinationGuides.find((item) => item.id === chosenId);
        if (!guide) return [];
        const savedItem = readTripSelection().find((item) => item.type === type && item.id === guide.id);
        return [savedItem ?? {
          id: guide.id,
          type,
          category: "Guides",
          name: guide.name,
          image: destination.image,
          location: destination.name,
          packageName: guide.specialization,
          price: parsePrice(guide.price),
          quantity: 1,
          destination: destination.name,
        }];
      });

  const selectedItems = buildSelectedItems(selection);
  const selectedTotal = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const toggle = (type: "stay" | "cab" | "guide", value: string) => {
    const nextSelection = { ...selection, [type]: selection[type] === value ? undefined : value };
    setSelection(nextSelection);
    saveTripSelection(buildSelectedItems(nextSelection));
  };

  const handleProceedToCheckout = () => {
    if (!selectedItems.length) {
      return;
    }

    saveTripSelection(selectedItems);

    if (!getCurrentUser()) {
      navigate({ to: "/login" });
      return;
    }

    navigate({ to: "/checkout" });
  };

  return <main className={`min-h-screen bg-background ${selectedItems.length ? "pb-24" : ""}`}>
    <div className="relative bg-hero"><Navbar /><div className="mx-auto max-w-7xl px-5 pb-14 pt-28 md:px-8 md:pb-20"><a href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to Explore</a><div className="mt-8 grid items-end gap-8 md:grid-cols-[1fr_.8fr]"><div><p className="section-label">{destination.state}</p><h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-7xl">Explore {destination.name}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{destination.description}</p><div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold"><span className="tag"><BedDouble />{destination.stays}</span><span className="tag"><CarFront />{destination.cabs}</span></div></div><div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-hero"><img src={destination.image} alt={`${destination.name}, ${destination.state}`} className="h-full w-full object-cover" /></div></div></div></div>
    <section className="section-pad"><div className="mx-auto max-w-7xl px-5 md:px-8"><SectionTitle icon={BedDouble} title="Stays" copy={`Choose a place to stay in ${destination.name}.`} />{destinationStays.length === 0 ? <EmptyState item="stays" /> : <div className="grid gap-5 md:grid-cols-3">{destinationStays.map((stay) => <StayCard key={stay.id} stay={stay} selected={selection.stay === stay.id} onSelect={() => toggle("stay", stay.id)} />)}</div>}</div></section>
    <section className="section-pad bg-secondary"><div className="mx-auto max-w-7xl px-5 md:px-8"><SectionTitle icon={CarFront} title="Cab Operators" copy={`Travel around ${destination.name} with operators serving this destination and its nearby routes.`} />{destinationOperators.length === 0 ? <EmptyState item="cab operators" /> : <div className="grid gap-5 md:grid-cols-3">{destinationOperators.map((operator) => <article key={operator.id} className="rounded-2xl border border-border bg-card p-6 shadow-card"><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-xl bg-accent font-display font-bold text-primary">{operator.initials}</span><span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold"><Star className="size-3 fill-primary text-primary" />{operator.rating}</span></div><h3 className="mt-5 font-display text-xl font-semibold">{operator.name}</h3><div className="mt-5 space-y-4 text-sm"><p><span className="font-semibold">Serving</span><br /><span className="text-muted-foreground">{operator.serving}</span></p><p><span className="font-semibold">Vehicles</span><br /><span className="text-muted-foreground">{operator.vehicles}</span></p><p><span className="font-semibold">Services</span><br /><span className="text-muted-foreground">{operator.services}</span></p></div><div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5"><p className="text-sm font-bold text-primary">{operator.price}</p><div className="flex items-center gap-2"><a href={createListingUrl(operator.destinationId, operator.slug)} className="inline-flex items-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-primary">View Cab</a><Button type="button" size="sm" variant={selection.cab === operator.id ? "default" : "outline"} aria-pressed={selection.cab === operator.id} onClick={() => toggle("cab", operator.id)}>{selection.cab === operator.id ? "Selected" : "Select cab"}</Button></div></div></article>)}</div>}</div></section>
    <section className="section-pad"><div className="mx-auto max-w-7xl px-5 md:px-8"><SectionTitle icon={UserRound} title="Local Guides" copy={`Meet local people who can help you experience ${destination.name} with more context.`} />{destinationGuides.length === 0 ? <EmptyState item="local guides" /> : <div className="grid gap-5 md:grid-cols-3">{destinationGuides.map((guide) => <article key={guide.id} className="rounded-2xl border border-border bg-card p-6 shadow-card"><div className="flex items-start justify-between gap-4"><span className="grid size-14 place-items-center rounded-full bg-accent font-display text-lg font-bold text-primary">{guide.initials}</span><span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold"><Star className="size-3 fill-primary text-primary" />{guide.rating}</span></div><h3 className="mt-5 font-display text-xl font-semibold">{guide.name}</h3><p className="mt-1 text-sm font-semibold text-primary">{guide.specialization}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.description}</p><div className="mt-5 space-y-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Compass className="size-4 text-primary" />{guide.experience} experience</p><p className="flex items-center gap-2"><Languages className="size-4 text-primary" />{guide.languages}</p></div><div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5"><p className="text-sm font-bold text-primary">{guide.price}</p><div className="flex items-center gap-2"><a href={createListingUrl(guide.destinationId, guide.slug)} className="inline-flex items-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-primary">View Guide</a><Button type="button" size="sm" variant={selection.guide === guide.id ? "default" : "outline"} aria-pressed={selection.guide === guide.id} onClick={() => toggle("guide", guide.id)}>{selection.guide === guide.id ? "Selected" : "Select guide"}</Button></div></div></article>)}</div>}</div></section>
    <section className="pb-20"><div className="mx-auto max-w-7xl px-5 md:px-8"><div className="rounded-2xl bg-foreground p-7 text-background md:flex md:items-center md:justify-between md:gap-8 md:p-10"><div><p className="section-label section-label-dark">Your trip selection</p><h2 className="mt-3 font-display text-3xl font-semibold">Build your {destination.name} package</h2><p className="mt-3 text-sm text-background/65">Select any combination now. A stay, cab and guide together make a complete travel package.</p></div><div className="mt-6 flex shrink-0 flex-wrap gap-2 md:mt-0">{(["stay", "cab", "guide"] as const).map((type) => <span key={type} className={`rounded-full px-3 py-2 text-xs font-bold ${selection[type] ? "bg-primary text-primary-foreground" : "bg-background/10 text-background/60"}`}>{selectedLabel(type)}{type === "cab" ? "Cab" : type[0].toUpperCase() + type.slice(1)}</span>)}</div></div><div className="mt-6 flex justify-end"><Button type="button" onClick={handleProceedToCheckout} disabled={!selectedItems.length} className="rounded-full">{selectedItems.length ? "Proceed to checkout" : "Select a stay or service"}</Button></div></div></section>
    {selectedItems.length > 0 ? (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-hero backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-foreground">
              {selectedItems.length} {selectedItems.length === 1 ? "service" : "services"} selected
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {selectedItems.map((item) => item.name).join(" · ")} · ₹{selectedTotal.toLocaleString("en-IN")}
            </p>
          </div>
          <Button type="button" onClick={handleProceedToCheckout} className="shrink-0 rounded-full">
            Checkout
          </Button>
        </div>
      </div>
    ) : null}
  </main>;
}
