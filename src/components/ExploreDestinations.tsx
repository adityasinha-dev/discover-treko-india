import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, CarFront, Compass, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { destinationDirectory, destinationTypes, type Destination, type DestinationService } from "@/data/treko";
import { TrekoFooter, TrekoNavbar } from "@/components/TrekoChrome";

const ALL = "all";

type Filters = { state: string; type: string; service: string; sort: string };

export function ExploreHero({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  return (
    <section className="relative overflow-hidden bg-hero">
      <TrekoNavbar />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 text-center md:px-8 md:pb-20 md:pt-20">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold shadow-sm"><Compass className="size-4 text-primary" />India, destination by destination</div>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-none text-foreground md:text-7xl">Explore India</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">Discover destinations, find your stay, and explore local cab operators — all in one place.</p>
        <DestinationSearch query={query} onQueryChange={onQueryChange} />
      </div>
    </section>
  );
}

export function DestinationSearch({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  return (
    <div className="relative mx-auto mt-9 max-w-2xl">
      <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-primary" />
      <label htmlFor="explore-search" className="sr-only">Search destinations in India</label>
      <input id="explore-search" type="search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Search destinations in India..." className="h-16 w-full rounded-2xl border border-border bg-card px-14 text-base font-medium text-foreground shadow-search outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" />
      {query && <button type="button" onClick={() => onQueryChange("")} aria-label="Clear destination search" className="absolute right-5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="size-4" /></button>}
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-[10px] font-bold uppercase text-muted-foreground">{label}</label><Select value={value} onValueChange={onChange}><SelectTrigger className="h-11 rounded-xl bg-card"><SelectValue /></SelectTrigger><SelectContent>{children}</SelectContent></Select></div>;
}

export function DestinationFilters({ filters, onChange, onReset, states, active }: { filters: Filters; onChange: (key: keyof Filters, value: string) => void; onReset: () => void; states: string[]; active: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="size-4 text-primary" />Refine destinations</p>{active && <Button variant="ghost" size="sm" onClick={onReset}>Reset filters</Button>}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect label="State" value={filters.state} onChange={value => onChange("state", value)}><SelectItem value={ALL}>All states</SelectItem>{states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</FilterSelect>
        <FilterSelect label="Destination type" value={filters.type} onChange={value => onChange("type", value)}><SelectItem value={ALL}>All types</SelectItem>{destinationTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</FilterSelect>
        <FilterSelect label="Services available" value={filters.service} onChange={value => onChange("service", value)}><SelectItem value={ALL}>All services</SelectItem><SelectItem value="accommodation">Accommodation</SelectItem><SelectItem value="cabs">Cab Operators</SelectItem><SelectItem value="both">Both</SelectItem></FilterSelect>
        <FilterSelect label="Sort by" value={filters.sort} onChange={value => onChange("sort", value)}><SelectItem value="popular">Popular</SelectItem><SelectItem value="az">A–Z</SelectItem><SelectItem value="recent">Recently Added</SelectItem></FilterSelect>
      </div>
    </div>
  );
}

export function DestinationCard({ destination, featured = false }: { destination: Destination; featured?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover">
      <div className={`relative overflow-hidden ${featured ? "aspect-[4/3]" : "aspect-[5/3]"}`}><img src={destination.image} width={1200} height={912} loading="lazy" alt={`${destination.name}, ${destination.state}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground backdrop-blur">{destination.type}</span></div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase text-primary">{destination.state}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">{destination.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{destination.description}</p>
        <div className="mt-4 flex flex-wrap gap-2"><span className="tag"><BedDouble />{destination.accommodationCount} Stays</span><span className="tag"><CarFront />{destination.cabOperatorCount} Cab Operators</span></div>
        <Button asChild variant="ghost" className="mt-4 w-full justify-between px-0 hover:bg-transparent hover:text-primary"><Link to="/destinations/$slug" params={{ slug: destination.slug }}>Explore {destination.name}<ArrowRight className="transition-transform group-hover:translate-x-1" /></Link></Button>
      </div>
    </article>
  );
}

export function FeaturedDestinations({ destinations }: { destinations: Destination[] }) {
  if (destinations.length === 0) return null;
  return <section aria-labelledby="popular-heading"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="section-label">Start here</p><h2 id="popular-heading" className="mt-2 font-display text-3xl font-semibold md:text-4xl">Popular Destinations</h2></div><p className="hidden max-w-sm text-right text-sm text-muted-foreground md:block">A first look at some of India’s most-loved places.</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{destinations.slice(0, 4).map(destination => <DestinationCard key={destination.slug} destination={destination} featured />)}</div></section>;
}

export function DestinationGrid({ destinations, onReset }: { destinations: Destination[]; onReset: () => void }) {
  if (destinations.length === 0) return <div className="rounded-2xl border border-dashed border-border bg-secondary px-6 py-16 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-card text-primary shadow-sm"><MapPin className="size-6" /></span><h3 className="mt-5 font-display text-2xl font-semibold">We couldn't find that destination.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try searching for another Indian city or destination, or clear your filters.</p><Button variant="outline" className="mt-6 rounded-full" onClick={onReset}>Clear search & filters</Button></div>;
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{destinations.map(destination => <DestinationCard key={destination.slug} destination={destination} />)}</div>;
}

export function ExploreDestinationsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({ state: ALL, type: ALL, service: ALL, sort: "popular" });
  const states = useMemo(() => [...new Set(destinationDirectory.map(item => item.state))].sort(), []);
  const reset = () => { setQuery(""); setFilters({ state: ALL, type: ALL, service: ALL, sort: "popular" }); };
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = destinationDirectory.filter(item => {
      const matchesQuery = !normalized || [item.name, item.state, item.description, item.type].some(value => value.toLowerCase().includes(normalized));
      const matchesState = filters.state === ALL || item.state === filters.state;
      const matchesType = filters.type === ALL || item.type === filters.type;
      const matchesService = filters.service === ALL || item.servicesAvailable === filters.service || item.servicesAvailable === "both";
      return matchesQuery && matchesState && matchesType && matchesService;
    });
    return result.sort((a, b) => filters.sort === "az" ? a.name.localeCompare(b.name) : filters.sort === "recent" ? b.dateAdded.localeCompare(a.dateAdded) : b.popularity - a.popularity);
  }, [query, filters]);
  const featured = destinationDirectory.filter(item => item.featured).sort((a, b) => b.popularity - a.popularity);
  const active = Boolean(query || filters.state !== ALL || filters.type !== ALL || filters.service !== ALL || filters.sort !== "popular");
  return <main className="overflow-hidden"><ExploreHero query={query} onQueryChange={setQuery} /><div className="mx-auto max-w-7xl space-y-20 px-5 py-16 md:px-8 md:py-20"><FeaturedDestinations destinations={featured} /><section aria-labelledby="directory-heading"><div className="mb-8"><p className="section-label">The directory</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><h2 id="directory-heading" className="font-display text-3xl font-semibold md:text-4xl">Explore More Destinations</h2><p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "destination" : "destinations"}</p></div></div><DestinationFilters filters={filters} onChange={(key, value) => setFilters(current => ({ ...current, [key]: value }))} onReset={reset} states={states} active={active} /><div className="mt-8"><DestinationGrid destinations={filtered} onReset={reset} /></div><p className="mt-6 text-center text-xs text-muted-foreground">Destination listing counts are mock data for this college project prototype.</p></section></div><TrekoFooter /></main>;
}
