import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Eye,
  EyeOff,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/TrekoLanding";
import { destinations } from "@/data/treko";
import { ApiRequestError, apiRequest } from "@/lib/api";
import {
  clearAdminAuthToken,
  getAdminAuthToken,
  getAuthToken,
  getCurrentUser,
  saveAdminAuthToken,
} from "@/lib/auth";

type PartnerStatus = "pending" | "approved" | "rejected";
type BusinessType = "Hotel" | "Cab Operator" | "Travel Guide";

type PartnerListing = {
  id: string;
  name: string;
  type: BusinessType;
  destination: string;
  description: string;
  createdAt: string;
};

type PartnerApplication = {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  businessType: BusinessType;
  destination: string;
  description: string;
  status: PartnerStatus;
  reviewNote: string;
  createdAt: string;
  reviewedAt: string | null;
  listings: PartnerListing[];
};

type BusinessBooking = {
  id: string;
  customerName: string;
  customerEmail: string;
  destination: string;
  bookingDate: string;
  status: string;
  total: number;
  items: Array<{ name: string; type: string; packageName: string }>;
};

type DashboardData = {
  application: PartnerApplication;
  bookings: BusinessBooking[];
};

const panelClass = "rounded-3xl border border-border bg-card p-6 shadow-card md:p-8";

function adminApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminAuthToken();
  if (!token) {
    return Promise.reject(new Error("Admin sign-in is required."));
  }
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return apiRequest<T>(path, { ...options, headers });
}

function PortalFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-20 bg-hero">
        <Navbar />
      </div>
      {children}
    </main>
  );
}

function StatusBadge({ status }: { status: PartnerStatus }) {
  const label =
    status === "pending"
      ? "Pending approval"
      : status === "approved"
        ? "Approved"
        : "Application rejected";
  const classes =
    status === "approved"
      ? "bg-emerald-100 text-emerald-800"
      : status === "rejected"
        ? "bg-destructive/10 text-destructive"
        : "bg-amber-100 text-amber-800";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${classes}`}
    >
      <span className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function PartnerPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [authReady, setAuthReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setAuthReady(true), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest<{ application: PartnerApplication }>("/api/partners", {
        method: "POST",
        body: JSON.stringify({
          businessName: form.get("businessName"),
          ownerName: form.get("ownerName"),
          phone: form.get("phone"),
          businessType: form.get("businessType"),
          destination: form.get("destination"),
          description: form.get("description"),
        }),
      });
      await navigate({ to: "/business-dashboard" });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to submit your application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalFrame>
      <section className="section-pad">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[.9fr_1.1fr] md:px-8">
          <div>
            <p className="section-label">Grow with Treko</p>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
              Become a Partner
            </h1>
            <p className="mt-5 leading-7 text-muted-foreground">
              Apply to list your hotel, cab service, or local guide business with Treko.
            </p>
            <div className="mt-8 space-y-4">
              {["Hotel", "Cab Operator", "Travel Guide"].map((type) => (
                <div key={type} className="flex items-center gap-3 rounded-xl bg-secondary p-4">
                  <span className="grid size-9 place-items-center rounded-full bg-accent text-primary">
                    <Building2 className="size-4" />
                  </span>
                  <span className="font-semibold">{type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={panelClass}>
            {!authReady ? (
              <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                Loading account…
              </div>
            ) : !getAuthToken() ? (
              <div className="py-8 text-center">
                <ShieldCheck className="mx-auto size-10 text-primary" />
                <h2 className="mt-4 font-display text-2xl font-semibold">Sign in to apply</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your application will be linked to your Treko account.
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <a href="/login">Sign in</a>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="font-display text-2xl font-semibold">Business application</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Applications are reviewed by the Treko team before dashboard access is enabled.
                </p>
                <label className="mt-6 block text-sm font-semibold">
                  Business name
                  <input
                    required
                    name="businessName"
                    maxLength={120}
                    className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Owner / primary contact
                  <input
                    required
                    name="ownerName"
                    maxLength={120}
                    defaultValue={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
                    className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Account email
                  <input
                    readOnly
                    value={user?.email ?? ""}
                    className="mt-2 h-11 w-full rounded-lg border border-input bg-secondary px-3 font-normal text-muted-foreground"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Contact phone
                  <input
                    required
                    name="phone"
                    type="tel"
                    maxLength={30}
                    className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Business type
                    <select
                      required
                      name="businessType"
                      defaultValue=""
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="Hotel">Hotel</option>
                      <option value="Cab Operator">Cab Operator</option>
                      <option value="Travel Guide">Travel Guide</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Destination
                    <select
                      required
                      name="destination"
                      defaultValue=""
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                    >
                      <option value="" disabled>
                        Select destination
                      </option>
                      {destinations.map((destination) => (
                        <option key={destination.id} value={destination.name}>
                          {destination.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-4 block text-sm font-semibold">
                  Business description
                  <textarea
                    required
                    name="description"
                    maxLength={1000}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 h-12 w-full rounded-full"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Submitting application…
                    </>
                  ) : (
                    "Submit partnership application"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PortalFrame>
  );
}

export function BusinessDashboardPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setChecking(true);
      else setLoading(true);
      setError("");
      try {
        const result = await apiRequest<{ application: PartnerApplication | null }>(
          "/api/business/status",
        );
        setApplication(result.application);
        if (result.application?.status === "approved") {
          const approvedDashboard = await apiRequest<DashboardData>("/api/business/dashboard");
          setDashboard(approvedDashboard);
        } else {
          setDashboard(null);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to check your application status.",
        );
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!getAuthToken()) {
      void navigate({ to: "/login" });
      return;
    }
    void loadStatus();
  }, [loadStatus, navigate]);

  if (loading) {
    return (
      <PortalFrame>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center gap-3 px-5 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          Loading your business dashboard…
        </div>
      </PortalFrame>
    );
  }

  if (error && !application) {
    return (
      <PortalFrame>
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className={`${panelClass} text-center`}>
            <XCircle className="mx-auto size-10 text-destructive" />
            <h1 className="mt-4 font-display text-3xl font-semibold">
              Could not load your application
            </h1>
            <p role="alert" className="mt-3 text-muted-foreground">
              {error}
            </p>
            <Button
              onClick={() => void loadStatus(true)}
              disabled={checking}
              className="mt-6 rounded-full"
            >
              <RefreshCw className={checking ? "animate-spin" : ""} />
              Try again
            </Button>
          </div>
        </section>
      </PortalFrame>
    );
  }

  if (!application) {
    return (
      <PortalFrame>
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className={`${panelClass} text-center`}>
            <Building2 className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 font-display text-3xl font-semibold">No application yet</h1>
            <p className="mt-3 text-muted-foreground">
              Submit a business partnership application to get started.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <a href="/partner">Become a Partner</a>
            </Button>
          </div>
        </section>
      </PortalFrame>
    );
  }

  if (application.status === "pending") {
    return (
      <PortalFrame>
        <section className="mx-auto max-w-3xl px-5 py-14 md:py-20">
          <div className={`${panelClass} text-center`}>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-amber-100 text-amber-700">
              <Clock3 className="size-9 animate-pulse" />
            </span>
            <div className="mt-6">
              <StatusBadge status="pending" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
              Awaiting Approval
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Your partnership application has been submitted successfully! The Treko team is
              reviewing your details. Your business dashboard will become available once your
              application is approved.
            </p>
            <div className="mt-7 rounded-2xl bg-secondary p-5 text-left">
              <p className="font-semibold">{application.businessName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {application.businessType} · {application.destination}
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                Submitted {new Date(application.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                The Treko team will review your application and update its status here.
              </p>
            </div>
            {error ? (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              onClick={() => void loadStatus(true)}
              disabled={checking}
              variant="outline"
              className="mt-6 rounded-full"
            >
              <RefreshCw className={checking ? "animate-spin" : ""} />
              {checking ? "Checking…" : "Refresh / check status"}
            </Button>
          </div>
        </section>
      </PortalFrame>
    );
  }

  if (application.status === "rejected") {
    return (
      <PortalFrame>
        <section className="mx-auto max-w-3xl px-5 py-14 md:py-20">
          <div className={`${panelClass} text-center`}>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="size-9" />
            </span>
            <div className="mt-6">
              <StatusBadge status="rejected" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold">Application not approved</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              The Treko team could not approve this application at this time. Review the note below
              and contact Treko support if you need clarification.
            </p>
            {application.reviewNote ? (
              <p className="mt-5 rounded-xl bg-secondary p-4 text-left text-sm">
                {application.reviewNote}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-muted-foreground">
              Application: {application.businessName} · {application.businessType}
            </p>
            <Button
              onClick={() => void loadStatus(true)}
              disabled={checking}
              variant="outline"
              className="mt-6 rounded-full"
            >
              <RefreshCw className={checking ? "animate-spin" : ""} />
              Check status
            </Button>
          </div>
        </section>
      </PortalFrame>
    );
  }

  if (error && !dashboard) {
    return (
      <PortalFrame>
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className={`${panelClass} text-center`}>
            <XCircle className="mx-auto size-10 text-destructive" />
            <h1 className="mt-4 font-display text-3xl font-semibold">Dashboard unavailable</h1>
            <p role="alert" className="mt-3 text-muted-foreground">
              {error}
            </p>
            <Button
              onClick={() => void loadStatus(true)}
              disabled={checking}
              className="mt-6 rounded-full"
            >
              <RefreshCw className={checking ? "animate-spin" : ""} />
              Try again
            </Button>
          </div>
        </section>
      </PortalFrame>
    );
  }

  const approvedApplication = dashboard?.application ?? application;
  return (
    <PortalFrame>
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Business portal</p>
              <h1 className="mt-2 font-display text-4xl font-semibold">
                Welcome, {approvedApplication.businessName}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {approvedApplication.businessType} · {approvedApplication.destination}
              </p>
            </div>
            <StatusBadge status="approved" />
          </div>
          {error ? (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <div className="grid gap-8 lg:grid-cols-2">
            <section className={panelClass}>
              <h2 className="font-display text-2xl font-semibold">Bookings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bookings associated with your Treko listing.
              </p>
              {!dashboard?.bookings.length ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
                  <CalendarDays className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-semibold">No bookings yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    New bookings for your listing will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {dashboard.bookings.map((booking) => (
                    <article key={booking.id} className="rounded-2xl bg-secondary p-5">
                      <div className="flex flex-wrap justify-between gap-2">
                        <h3 className="font-semibold">{booking.id}</h3>
                        <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold">
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm">
                        <span className="font-semibold">Customer:</span> {booking.customerName} ·{" "}
                        {booking.customerEmail}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Booked:</span>{" "}
                        {new Date(booking.bookingDate).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Destination:</span>{" "}
                        {booking.destination}
                      </p>
                      <ul className="mt-3 space-y-1 text-sm">
                        {booking.items.map((item, index) => (
                          <li key={`${booking.id}-${index}`}>
                            {item.name}
                            {item.packageName ? ` · ${item.packageName}` : ""}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm font-semibold">
                        Booking total: ₹{booking.total.toLocaleString("en-IN")}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <section className={panelClass}>
              <h2 className="font-display text-2xl font-semibold">Listings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Business listings connected to your approved application.
              </p>
              <div className="mt-5 space-y-4">
                {approvedApplication.listings.map((listing) => (
                  <article key={listing.id} className="rounded-2xl bg-secondary p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{listing.name}</h3>
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-emerald-800">
                        <BadgeCheck className="mr-1 inline size-3" />
                        Approved
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-primary">
                      {listing.type} · {listing.destination}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {listing.description}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                For listing updates, contact Treko support and include your business name and
                destination.
              </p>
            </section>
          </div>
        </div>
      </section>
    </PortalFrame>
  );
}

export function AdminPartnerApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const loadApplications = useCallback(async () => {
    if (!getAdminAuthToken()) {
      await navigate({ to: "/admin/login" });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await adminApiRequest<{ applications: PartnerApplication[] }>(
        "/api/admin/partners",
      );
      setApplications(result.applications);
    } catch (loadError) {
      if (loadError instanceof ApiRequestError && [401, 403].includes(loadError.status)) {
        clearAdminAuthToken();
        await navigate({ to: "/admin/login" });
        return;
      }
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load partner applications.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getAdminAuthToken()) {
      void navigate({ to: "/admin/login" });
      return;
    }
    setAuthReady(true);
    void loadApplications();
  }, [loadApplications, navigate]);

  const review = async (applicationId: string, status: "approved" | "rejected") => {
    setActiveId(applicationId);
    setError("");
    try {
      await adminApiRequest<{ application: PartnerApplication }>(
        `/api/admin/partners/${applicationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status, reviewNote }),
        },
      );
      setReviewNote("");
      await loadApplications();
    } catch (reviewError) {
      if (reviewError instanceof ApiRequestError && [401, 403].includes(reviewError.status)) {
        clearAdminAuthToken();
        await navigate({ to: "/admin/login" });
        return;
      }
      setError(
        reviewError instanceof Error ? reviewError.message : "Unable to update this application.",
      );
    } finally {
      setActiveId("");
    }
  };

  const handleLogout = async () => {
    try {
      await adminApiRequest<{ message: string }>("/api/admin/logout", { method: "POST" });
    } catch {
      // Always clear the local token, even if the server session cannot be reached.
    } finally {
      clearAdminAuthToken();
      setApplications([]);
      await navigate({ to: "/admin/login" });
    }
  };

  if (!authReady) {
    return (
      <PortalFrame>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center gap-3 px-5 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          Checking admin access…
        </div>
      </PortalFrame>
    );
  }

  return (
    <PortalFrame>
      <section className="section-pad">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Treko administration</p>
              <h1 className="mt-2 font-display text-4xl font-semibold">Admin Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Review submissions and approve or reject business access.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => void loadApplications()}
                disabled={loading}
                className="rounded-full"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleLogout()}
                className="rounded-full"
              >
                <LogOut />
                Logout
              </Button>
            </div>
          </div>
          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          {loading ? (
            <div className="mt-10 flex items-center justify-center gap-3 text-muted-foreground">
              <LoaderCircle className="animate-spin" />
              Loading applications…
            </div>
          ) : applications.length === 0 ? (
            <div className={`${panelClass} mt-8 text-center text-muted-foreground`}>
              No partner applications have been submitted.
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {applications.map((application) => (
                <article key={application.id} className={panelClass}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">
                        {application.businessName}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.businessType} · {application.destination}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Owner:</span> {application.ownerName}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {application.ownerEmail}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {application.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Submitted:</span>{" "}
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <details className="mt-5 rounded-xl bg-secondary p-4">
                    <summary className="cursor-pointer font-semibold">Application details</summary>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {application.description}
                    </p>
                    {application.reviewNote ? (
                      <p className="mt-3 text-sm">
                        <span className="font-semibold">Review note:</span> {application.reviewNote}
                      </p>
                    ) : null}
                    {application.reviewedAt ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Reviewed {new Date(application.reviewedAt).toLocaleString()}
                      </p>
                    ) : null}
                  </details>
                  {application.status === "pending" ? (
                    <div className="mt-5">
                      <label className="block text-sm font-semibold">
                        Optional review note
                        <textarea
                          value={reviewNote}
                          onChange={(event) => setReviewNote(event.target.value)}
                          maxLength={1000}
                          rows={2}
                          className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
                        />
                      </label>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          onClick={() => void review(application.id, "approved")}
                          disabled={Boolean(activeId)}
                          className="rounded-full"
                        >
                          <BadgeCheck />
                          {activeId === application.id ? "Saving…" : "Approve"}
                        </Button>
                        <Button
                          onClick={() => void review(application.id, "rejected")}
                          disabled={Boolean(activeId)}
                          variant="outline"
                          className="rounded-full"
                        >
                          <XCircle />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
          <p className="mt-7 text-xs text-muted-foreground">
            Review partner applications before granting access to the business dashboard.
          </p>
        </div>
      </section>
    </PortalFrame>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAdminAuthToken()) {
      void navigate({ to: "/admin/dashboard" });
      return;
    }
    setAuthReady(true);
  }, [navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await apiRequest<{ token: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ adminId, password }),
      });
      saveAdminAuthToken(result.token);
      setPassword("");
      await navigate({ to: "/admin/dashboard" });
    } catch (loginError) {
      if (loginError instanceof ApiRequestError && loginError.status === 429) {
        setError(loginError.message);
      } else if (loginError instanceof ApiRequestError && loginError.status === 503) {
        setError("Admin sign-in is temporarily unavailable. Please contact support.");
      } else {
        setError("Unable to sign in. Check your credentials and try again.");
      }
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalFrame>
      <section className="section-pad">
        <div className="mx-auto max-w-md px-5 md:px-8">
          <div className={panelClass}>
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                <ShieldCheck className="size-7" />
              </span>
              <p className="section-label mt-5">Treko administration</p>
              <h1 className="mt-2 font-display text-3xl font-semibold">Admin Login</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to review partner applications.
              </p>
            </div>
            {!authReady ? (
              <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Checking session…
              </div>
            ) : (
              <form onSubmit={handleLogin} className="mt-8">
                <label className="block text-sm font-semibold">
                  Admin Email
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    maxLength={256}
                    value={adminId}
                    onChange={(event) => setAdminId(event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Password
                  <span className="relative mt-2 block">
                    <input
                      required
                      autoComplete="current-password"
                      maxLength={1024}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-12 font-normal outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((shown) => !shown)}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </span>
                </label>
                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 h-12 w-full rounded-full"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PortalFrame>
  );
}
