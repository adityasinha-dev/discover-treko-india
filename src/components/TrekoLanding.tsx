import { ArrowRight, BedDouble, Building2, CarFront, Compass, Headphones, MapPin, Menu, Route, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-ujjain.jpg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { destinations } from "@/data/treko";
import { getCurrentUser, logoutDemo, type TrekoUser } from "@/lib/auth";

const nav = [
  ["Home", "/"],
  ["Explore Destinations", "/explore"],
  ["My Plans", "/my-plans"],
  ["Stays", "/stays"],
  ["Cabs", "/cab-operators"],
  ["Become a Partner", "/partner"],
];

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="Treko home">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <Route className="size-4" />
      </span>
      <span className="font-display text-xl font-bold text-foreground">Treko</span>
    </a>
  );
}

export function Navbar() {
  const [currentUser, setCurrentUser] = useState<TrekoUser | null>(getCurrentUser);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());
    syncUser();
    window.addEventListener("treko-auth-change", syncUser);
    return () => window.removeEventListener("treko-auth-change", syncUser);
  }, []);

  const handleLogout = () => {
    logoutDemo();
    window.location.href = "/";
  };

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center px-5 lg:grid-cols-[auto_1fr_auto] lg:px-8">
        <Logo />
        <nav className="hidden items-center justify-center gap-7 lg:flex">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <>
              <div className="rounded-full bg-secondary px-3 py-2 text-sm font-semibold text-foreground">
                Hi, {currentUser.firstName}
              </div>
              <Button variant="ghost" asChild>
                <a href="/my-plans">My Plans</a>
              </Button>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <a href="/login">Login</a>
              </Button>
              <Button asChild className="rounded-full px-5">
                <a href="/explore">
                  Explore India <ArrowRight />
                </a>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-full lg:hidden" aria-label="Open navigation">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[86%]">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <SheetDescription>Discover stays and local travel across India.</SheetDescription>
            </SheetHeader>
            <nav className="mt-10 flex flex-col gap-2">
              {nav.map(([label, href]) => (
                <SheetClose asChild key={href}>
                  <a href={href} className="rounded-md px-3 py-3 text-lg font-semibold hover:bg-accent">
                    {label}
                  </a>
                </SheetClose>
              ))}
              {currentUser ? (
                <>
                  <Button variant="outline" asChild className="mt-4">
                    <a href="/my-plans">My Plans</a>
                  </Button>
                  <Button onClick={handleLogout} className="mt-2">Logout</Button>
                </>
              ) : (
                <SheetClose asChild>
                  <a href="/login" className="rounded-md px-3 py-3 text-lg font-semibold hover:bg-accent">
                    Login
                  </a>
                </SheetClose>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function Hero() {
  const [currentUser, setCurrentUser] = useState<TrekoUser | null>(getCurrentUser);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());
    syncUser();
    window.addEventListener("treko-auth-change", syncUser);
    return () => window.removeEventListener("treko-auth-change", syncUser);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-hero">
      <Navbar />
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 pb-20 pt-28 md:grid-cols-[1.02fr_.98fr] md:px-8 md:pb-24 md:pt-32">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            <span className="grid size-5 place-items-center rounded-full bg-accent text-accent-foreground">
              <MapPin className="size-3" />
            </span>
            Discover India, destination by destination
          </div>

          <h1 className="font-display text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[.96] text-foreground">
            {currentUser ? (
              <>
                Hi, <span className="text-primary">{currentUser.firstName}</span>
              </>
            ) : (
              <>
                Explore India.
                <br />
                <span className="text-primary">Stay Better.</span>
                <br />
                Travel Local.
              </>
            )}
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Discover trusted stays and local cab operators for your destination ? all in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-foreground/75">
            <span className="flex items-center gap-2">
              <BedDouble className="size-4 text-primary" />
              Stays for every journey
            </span>
            <span className="flex items-center gap-2">
              <CarFront className="size-4 text-primary" />
              Local operators
            </span>
          </div>

          <Button asChild className="mt-9 h-12 rounded-full px-7 text-base">
            <a href={currentUser ? "/my-plans" : "/login"}>
              {currentUser ? "My Plans" : "Get Started"} <ArrowRight />
            </a>
          </Button>

        </div>

        <div className="relative mx-auto w-full max-w-[510px] md:translate-y-5">
          <div className="image-frame aspect-[4/5] overflow-hidden rounded-[2rem] shadow-hero">
            <img
              src={heroImage}
              width={1200}
              height={1504}
              alt="Ujjain temples and Shipra river at sunrise"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute left-4 top-5 rounded-xl bg-card/90 px-4 py-3 shadow-lg backdrop-blur md:-left-8 md:top-10">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Featured destination</p>
            <p className="mt-0.5 font-display text-sm font-bold text-foreground">Ujjain, Madhya Pradesh</p>
          </div>

          <div className="absolute -bottom-6 right-4 rounded-xl bg-card px-4 py-3 shadow-lg md:-right-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-accent text-primary">
                <BedDouble className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold">Stay + Cab</p>
                <p className="text-[11px] text-muted-foreground">One destination, together</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="section-label">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 leading-7 text-muted-foreground">{copy}</p>
    </div>
  );
}

function Destinations() {
  return (
    <section id="destinations" className="section-pad pt-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Explore India"
          copy="Discover popular destinations and find everything you need for your stay and local travel."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((item) => (
            <article
              key={item.name}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  width={1200}
                  height={912}
                  loading="lazy"
                  alt={`${item.name}, ${item.state}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <p className="text-xs font-bold uppercase text-primary">{item.state}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{item.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="tag">
                    <BedDouble />
                    {item.stays}
                  </span>
                  <span className="tag">
                    <CarFront />
                    {item.cabs}
                  </span>
                </div>
                <Button variant="ghost" asChild className="mt-4 w-full justify-between px-0 hover:bg-transparent hover:text-primary">
                  <a href="/stays">
                    Explore {item.name}
                    <ArrowRight />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  [MapPin, "Choose Your Destination", "Select a city or destination anywhere across India."],
  [BedDouble, "Find Your Stay", "Explore hotels, resorts, homestays and other accommodation options."],
  [CarFront, "Find Local Cab Operators", "Discover operators serving the destination and surrounding regions."],
  [Compass, "Plan Your Trip", "Compare your options and contact or book through the provider."],
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Simple by design"
          title="Everything You Need for Your Destination"
          copy="Start with a place. Treko brings the two essentials of your journey together."
        />

        <div className="relative grid gap-4 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-7 hidden border-t border-dashed border-primary/40 md:block" />
          {steps.map(([Icon, title, copy], index) => {
            const StepIcon = Icon as any;
            return (
              <div key={String(title)} className="relative rounded-2xl bg-secondary p-6">
                <div className="grid size-14 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground">
                  <StepIcon className="size-5" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase text-primary">Step {index + 1}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyTreko() {
  return (
    <section id="why-treko" className="section-pad bg-secondary">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Why choose Treko"
          title="Built for smarter travel planning"
          copy="Explore a destination, compare stays and discover trusted local operators in one purposeful trip flow."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {[
            [ShieldCheck, "Verified local focus", "Discover routes and stays with a destination-first mindset."],
            [Building2, "Easy trip planning", "Bring the stay, transport and guide together without the noise."],
            [Headphones, "Travel support", "Plan a trip with local guidance and the essentials you need for a smoother stay."],
          ].map(([Icon, title, copy]) => {
            const FeatureIcon = Icon as any;
            return (
              <div key={String(title)} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="grid size-12 place-items-center rounded-xl bg-accent text-primary">
                  <FeatureIcon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="What you can do"
          title="Plan with confidence"
          copy="Treko brings the essentials of a destination into one simple, accessible journey."
        />

        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["4.8/5 average rating", "Travelers appreciate the clarity and ease of planning at a destination level."],
            ["100+ curated places", "Browse destination-focused stays, stays and local operators across India."],
            ["Trusted local context", "Experience the destination with local knowledge and practical planning support."],
            ["Fast trip discovery", "Compare options quickly to find the right fit for your timetable and budget."],
          ].map(([title, copy]) => (
            <div key={String(title)} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Star className="size-5 fill-primary text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="section-pad pb-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="rounded-[2rem] bg-foreground px-6 py-10 text-background shadow-card md:px-10 md:py-12">
          <div className="md:flex md:items-end md:justify-between md:gap-8">
            <div className="max-w-2xl">
              <p className="section-label section-label-dark">Ready to plan?</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
                Find your next journey in India.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-background/75">
                Browse a destination, compare stays and discover local operators in one place.
              </p>
            </div>
            <Button asChild className="mt-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 md:mt-0">
              <a href="/explore">
                Explore the country <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrekoLanding() {
  return (
    <>
      <Hero />
      <Destinations />
      <HowItWorks />
      <WhyTreko />
      <Highlights />
      <CTA />
    </>
  );
}
