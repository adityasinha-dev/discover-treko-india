import { Link } from "@tanstack/react-router";
import { ArrowRight, Route, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { label: "Home", to: "/" as const },
  { label: "Explore Destinations", to: "/explore" as const },
  { label: "Stays", to: "/stays" as const },
  { label: "Cab Operators", to: "/cab-operators" as const },
  { label: "How It Works", hash: "how-it-works" },
  { label: "Become a Partner", hash: "partner" },
  { label: "About", hash: "about" },
];

export function TrekoLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Treko home">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><Route className="size-4" /></span>
      <span className={`font-display text-xl font-bold ${inverse ? "text-background" : "text-foreground"}`}>Treko</span>
    </Link>
  );
}

function HomeSectionLink({ label, hash, mobile = false }: { label: string; hash: string; mobile?: boolean }) {
  return <Link to="/" hash={hash} className={mobile ? "rounded-md px-3 py-3 text-lg font-semibold hover:bg-accent" : "text-sm font-medium text-foreground/70 transition-colors hover:text-primary"}>{label}</Link>;
}

export function TrekoNavbar({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`${overlay ? "absolute" : "relative border-b border-border bg-background/95"} inset-x-0 top-0 z-40`}>
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center px-5 lg:grid-cols-[auto_1fr_auto] lg:px-8">
        <TrekoLogo />
        <nav className="hidden items-center justify-center gap-7 lg:flex" aria-label="Primary navigation">
          {nav.map(item => item.to ? <Link key={item.label} to={item.to} activeProps={{ className: "text-primary" }} className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary">{item.label}</Link> : <HomeSectionLink key={item.label} label={item.label} hash={item.hash ?? ""} />)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost"><Link to="/login">Login</Link></Button>
          <Button asChild className="rounded-full px-5"><Link to="/signup">Get Started <ArrowRight /></Link></Button>
        </div>
        <Sheet>
          <SheetTrigger asChild><Button size="icon" variant="outline" className="rounded-full lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
          <SheetContent className="w-[86%]">
            <SheetHeader><SheetTitle><TrekoLogo /></SheetTitle><SheetDescription>Discover stays and local travel across India.</SheetDescription></SheetHeader>
            <nav className="mt-10 flex flex-col gap-2" aria-label="Mobile navigation">
              {nav.map(item => <SheetClose asChild key={item.label}>{item.to ? <Link to={item.to} className="rounded-md px-3 py-3 text-lg font-semibold hover:bg-accent">{item.label}</Link> : <HomeSectionLink label={item.label} hash={item.hash ?? ""} mobile />}</SheetClose>)}
              <SheetClose asChild><Button asChild className="mt-5 h-12 rounded-full"><Link to="/explore">Start Exploring</Link></Button></SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; to: "/" | "/explore" | "/stays" | "/cab-operators" }[] }) {
  return <div><h3 className="text-sm font-bold">{title}</h3><ul className="mt-4 space-y-3">{links.map(link => <li key={link.label}><Link to={link.to} className="text-sm text-background/55 transition-colors hover:text-background">{link.label}</Link></li>)}</ul></div>;
}

export function TrekoFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div id="final-cta" className="mx-auto max-w-7xl px-5 py-20 text-center md:px-8 md:py-24">
        <p className="section-label section-label-dark">Your next Indian journey</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold md:text-6xl">Planning Your Next Trip in India?</h2>
        <p className="mx-auto mt-5 max-w-xl text-background/65">Find your stay and local cab options for your destination with Treko.</p>
        <Button asChild className="mt-8 h-12 rounded-full px-7"><Link to="/explore">Explore Destinations <ArrowRight /></Link></Button>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
          <div><div className="inline-flex rounded-md bg-background p-1"><TrekoLogo /></div><p className="mt-5 max-w-xs text-sm leading-6 text-background/55">India-focused discovery for stays and trusted local cab operators.</p></div>
          <FooterLinks title="Explore" links={[{ label: "Destinations", to: "/explore" }, { label: "Stays", to: "/stays" }, { label: "Cab Operators", to: "/cab-operators" }]} />
          <FooterLinks title="Company" links={[{ label: "About Treko", to: "/" }, { label: "Become a Partner", to: "/" }, { label: "Contact", to: "/" }]} />
          <FooterLinks title="Support" links={[{ label: "Help", to: "/" }, { label: "FAQs", to: "/" }, { label: "Terms", to: "/" }, { label: "Privacy", to: "/" }]} />
        </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-background/10 px-5 py-6 text-xs text-background/45 sm:flex-row sm:justify-between md:px-8"><p>© 2026 Treko. College project prototype.</p><p>Made for journeys across India.</p></div>
      </div>
    </footer>
  );
}
