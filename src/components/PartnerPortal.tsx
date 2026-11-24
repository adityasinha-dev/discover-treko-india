import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/TrekoLanding";
import { buildCabVehicleOptions, destinations } from "@/data/treko";
import { ApiRequestError, apiRequest } from "@/lib/api";
import {
  clearAdminAuthToken,
  clearAuthSession,
  getAdminAuthToken,
  getAuthToken,
  getCurrentUser,
  saveAdminAuthToken,
  saveAuthSession,
} from "@/lib/auth";

type PartnerStatus = "pending" | "approved" | "rejected" | "suspended";
type BusinessType = "Hotel" | "Cab Operator" | "Travel Guide";

type PartnerListing = {
  id: string;
  name: string;
  type: BusinessType;
  destination: string;
  description: string;
  createdAt: string;
  active: boolean;
  images: string[];
  city: string;
  state: string;
  address: string;
  price: number | null;
  priceLabel: string;
  amenities: string[];
  roomTypes: string[];
  roomTypePhotos: Array<{ name: string; bedType: string; maxGuests: number; beds: number; price: number | null; description: string; amenities: string[]; images: string[] }>;
  contactPhone: string;
  contactEmail: string;
  checkIn: string;
  checkOut: string;
  availability: string;
  terms: string[];
  serviceAreas: string[];
  pickupLocations: string[];
  seatingCapacity: number | null;
  tourDuration: string;
  languages: string[];
  includedServices: string[];
  vehicleOptions: Array<{
    name: string;
    seatingCapacity: string;
    images: string[];
  }>;
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
  customerPhone?: string;
  customerGender?: string;
  customerPreferences?: string;
  destination: string;
  bookingDate: string;
  status: string;
  confirmedByCurrentBusiness: boolean;
  total: number;
  items: Array<{ name: string; type: string; packageName: string }>;
};

type DashboardData = {
  application: PartnerApplication;
  bookings: BusinessBooking[];
};

const panelClass = "rounded-3xl border border-border bg-card p-6 shadow-card md:p-8";
const maxVehicleImageCount = 4;
const maxVehicleImageBytes = 512 * 1024;
const maxHotelImages = 12;
const maxRoomTypeImages = 4;

async function prepareVehicleImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Your browser could not prepare this image.");
  }

  let scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  let imageBlob: Blob | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    imageBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", Math.max(0.55, 0.84 - attempt * 0.05)),
    );
    if (imageBlob && imageBlob.size <= maxVehicleImageBytes) break;
    scale *= 0.8;
  }
  bitmap.close();

  if (!imageBlob || imageBlob.size > maxVehicleImageBytes) {
    throw new Error("This photo could not be compressed below 512 KB. Choose a smaller image.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read the selected photo."));
    };
    reader.onerror = () => reject(new Error("Unable to read the selected photo."));
    reader.readAsDataURL(imageBlob);
  });
}

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
        : status === "suspended"
          ? "Suspended"
          : "Application rejected";
  const classes =
    status === "approved"
      ? "bg-emerald-100 text-emerald-800"
      : status === "rejected" || status === "suspended"
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
  const [partnerMode, setPartnerMode] = useState<"login" | "register">("login");

  useEffect(() => setAuthReady(true), []);

  const handlePartnerLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiRequest<{ token: string; partner: PartnerApplication; user: { id: string; name: string; email: string } }>("/api/partners/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const nameParts = result.user.name.trim().split(/\s+/);
      saveAuthSession(result.token, {
        id: result.user.id,
        firstName: nameParts[0] ?? "Partner",
        lastName: nameParts.slice(1).join(" "),
        email: result.user.email,
        plan: "Partner",
        createdAt: new Date().toISOString(),
      });
      await navigate({ to: "/business-dashboard" });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePartnerRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/api/partners/register", {
        method: "POST",
        body: JSON.stringify({
          ownerName: form.get("ownerName"),
          businessName: form.get("businessName"),
          email: form.get("email"),
          phone: form.get("phone"),
          password: form.get("password"),
          businessType: form.get("businessType"),
          destination: form.get("destination"),
          address: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          description: form.get("description"),
        }),
      });
      setPartnerMode("login");
      setError("Registration successful. Your application is pending admin approval.");
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

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
              <div>
                <div className="grid grid-cols-2 rounded-xl bg-secondary p-1">
                  <button type="button" onClick={() => { setPartnerMode("login"); setError(""); }} className={`rounded-lg py-2 text-sm font-semibold ${partnerMode === "login" ? "bg-card shadow-sm" : ""}`}>Partner Login</button>
                  <button type="button" onClick={() => { setPartnerMode("register"); setError(""); }} className={`rounded-lg py-2 text-sm font-semibold ${partnerMode === "register" ? "bg-card shadow-sm" : ""}`}>Register</button>
                </div>
                {partnerMode === "login" ? (
                  <form onSubmit={handlePartnerLogin} className="mt-6">
                    <h2 className="font-display text-2xl font-semibold">Login as Partner</h2>
                    <label className="mt-5 block text-sm font-semibold">Email<input required name="email" type="email" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                    <label className="mt-4 block text-sm font-semibold">Password<input required name="password" type="password" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                    {error ? <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
                    <Button type="submit" disabled={submitting} className="mt-6 h-12 w-full rounded-full">{submitting ? "Signing in…" : "Login to Partner Dashboard"}</Button>
                  </form>
                ) : (
                  <form onSubmit={handlePartnerRegister} className="mt-6">
                    <h2 className="font-display text-2xl font-semibold">Partner registration</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold">Full name<input required name="ownerName" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">Business name<input required name="businessName" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">Email<input required name="email" type="email" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">Phone<input required name="phone" type="tel" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">Password<input required name="password" type="password" minLength={8} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">Partner category<select required name="businessType" defaultValue="" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3"><option value="" disabled>Select category</option><option value="Hotel">Hotels &amp; Accommodation</option><option value="Cab Operator">Cab &amp; Transportation</option><option value="Travel Guide">Local Guide / Tour</option></select></label>
                      <label className="block text-sm font-semibold">Destination<select required name="destination" defaultValue="" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3"><option value="" disabled>Select destination</option>{destinations.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
                      <label className="block text-sm font-semibold">City<input name="city" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">State<input name="state" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                      <label className="block text-sm font-semibold">Business address<input name="address" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                    </div>
                    <label className="mt-4 block text-sm font-semibold">Business description<textarea required name="description" rows={4} maxLength={1000} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
                    {error ? <p role="alert" className="mt-4 rounded-lg bg-secondary p-3 text-sm">{error}</p> : null}
                    <Button type="submit" disabled={submitting} className="mt-6 h-12 w-full rounded-full">{submitting ? "Submitting…" : "Submit Partner Application"}</Button>
                  </form>
                )}
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
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);
  const [bookingActionError, setBookingActionError] = useState("");
  const [savingVehicleKey, setSavingVehicleKey] = useState("");
  const [vehiclePhotoErrors, setVehiclePhotoErrors] = useState<Record<string, string>>({});
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [listingError, setListingError] = useState("");
  const [hotelPhotos, setHotelPhotos] = useState<string[]>([]);
  const [roomTypeNames, setRoomTypeNames] = useState<string[]>([]);
  const [roomTypePhotos, setRoomTypePhotos] = useState<Record<string, string[]>>({});
  const [roomTypeDetails, setRoomTypeDetails] = useState<Record<string, { bedType: string; maxGuests: number; beds: number; price: number; description: string; amenities: string }>>({});

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

  const updateListingInState = (updatedListing: PartnerListing) => {
    const updateApplication = (current: PartnerApplication | null) =>
      current
        ? {
            ...current,
            listings: current.listings.map((listing) =>
              listing.id === updatedListing.id ? updatedListing : listing,
            ),
          }
        : current;
    setApplication(updateApplication);
    setDashboard((current) =>
      current
        ? { ...current, application: updateApplication(current.application)! }
        : current,
    );
  };

  const confirmBooking = async (bookingId: string) => {
    setConfirmingBookingId(bookingId);
    setBookingActionError("");
    try {
      const result = await apiRequest<{
        booking: Pick<BusinessBooking, "status" | "confirmedByCurrentBusiness">;
      }>(`/api/business/bookings/${encodeURIComponent(bookingId)}/confirm`, {
        method: "PATCH",
      });
      setDashboard((current) =>
        current
          ? {
              ...current,
              bookings: current.bookings.map((booking) =>
                booking.id === bookingId ? { ...booking, ...result.booking } : booking,
              ),
            }
          : current,
      );
    } catch (confirmError) {
      setBookingActionError(
        confirmError instanceof Error ? confirmError.message : "Unable to confirm this booking.",
      );
    } finally {
      setConfirmingBookingId(null);
    }
  };

  const handleHotelPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    if (hotelPhotos.length + files.length > maxHotelImages) {
      setListingError(`General hotel photos are limited to ${maxHotelImages} images.`);
      return;
    }
    setListingSubmitting(true);
    setListingError("");
    try {
      const prepared = await Promise.all(files.map(prepareVehicleImage));
      setHotelPhotos((current) => [...current, ...prepared].slice(0, maxHotelImages));
    } catch (uploadError) {
      setListingError(uploadError instanceof Error ? uploadError.message : "Unable to prepare hotel photos.");
    } finally {
      setListingSubmitting(false);
    }
  };

  const handleRoomTypePhotoUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    roomName: string,
  ) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    const currentPhotos = roomTypePhotos[roomName] ?? [];
    if (currentPhotos.length + files.length > maxRoomTypeImages) {
      setListingError(`${roomName} photos are limited to ${maxRoomTypeImages} images.`);
      return;
    }
    setListingSubmitting(true);
    setListingError("");
    try {
      const prepared = await Promise.all(files.map(prepareVehicleImage));
      setRoomTypePhotos((current) => ({
        ...current,
        [roomName]: [...(current[roomName] ?? []), ...prepared].slice(0, maxRoomTypeImages),
      }));
    } catch (uploadError) {
      setListingError(uploadError instanceof Error ? uploadError.message : "Unable to prepare room photos.");
    } finally {
      setListingSubmitting(false);
    }
  };

  const createListing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setListingSubmitting(true);
    setListingError("");
    const form = new FormData(formElement);
    try {
      const body = {
        name: form.get("listingName"),
        description: form.get("listingDescription"),
        type: application?.businessType,
        price: form.get("listingPrice"),
        priceLabel: form.get("listingPrice"),
        images: hotelPhotos,
        amenities: String(form.get("listingAmenities") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
        roomTypes: roomTypeNames,
        roomTypePhotos: roomTypeNames.map((name) => ({
          name,
          ...(roomTypeDetails[name] ?? { bedType: "", maxGuests: 2, beds: 1, price: 0, description: "", amenities: "" }),
          amenities: String(roomTypeDetails[name]?.amenities ?? "").split(",").map((item) => item.trim()).filter(Boolean),
          images: roomTypePhotos[name] ?? [],
        })),
        city: form.get("listingCity"),
        state: form.get("listingState"),
        address: form.get("listingAddress"),
        category: form.get("listingCategory"),
        rating: form.get("listingRating"),
        checkIn: form.get("checkInTime"),
        checkOut: form.get("checkOutTime"),
        availability: form.get("listingAvailability"),
        contactPhone: form.get("listingContactPhone"),
        contactEmail: form.get("listingContactEmail"),
        terms: String(form.get("listingTerms") ?? "").split("\n").map((item) => item.trim()).filter(Boolean),
        active: true,
      };
      const result = await apiRequest<{ listing: PartnerListing }>("/api/business/listings", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setApplication((current) => current ? { ...current, listings: [...current.listings, result.listing] } : current);
      setDashboard((current) => current ? { ...current, application: { ...current.application, listings: [...current.application.listings, result.listing] } } : current);
      formElement?.reset();
      setHotelPhotos([]);
      setRoomTypeNames([]);
      setRoomTypePhotos({});
      setRoomTypeDetails({});
    } catch (createError) {
      setListingError(createError instanceof Error ? createError.message : "Unable to create listing.");
    } finally {
      setListingSubmitting(false);
    }
  };

  const saveListingChanges = async (listingId: string, changes: Partial<PartnerListing>) => {
    try {
      const result = await apiRequest<{ listing: PartnerListing }>(`/api/business/listings/${listingId}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      updateListingInState(result.listing);
    } catch (changeError) {
      setListingError(changeError instanceof Error ? changeError.message : "Unable to update listing.");
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await apiRequest(`/api/business/listings/${listingId}`, { method: "DELETE" });
      setApplication((current) => current ? { ...current, listings: current.listings.filter((item) => item.id !== listingId) } : current);
      setDashboard((current) => current ? { ...current, application: { ...current.application, listings: current.application.listings.filter((item) => item.id !== listingId) } } : current);
    } catch (deleteError) {
      setListingError(deleteError instanceof Error ? deleteError.message : "Unable to delete listing.");
    }
  };

  const saveVehicleImages = async (
    listing: PartnerListing,
    vehicleName: string,
    images: string[],
  ) => {
    const key = `${listing.id}:${vehicleName}`;
    setSavingVehicleKey(key);
    setVehiclePhotoErrors((current) => ({ ...current, [key]: "" }));
    try {
      const result = await apiRequest<{ listing: PartnerListing }>(
        `/api/business/listings/${listing.id}/vehicles/${encodeURIComponent(vehicleName)}/images`,
        { method: "PUT", body: JSON.stringify({ images }) },
      );
      updateListingInState(result.listing);
    } catch (saveError) {
      setVehiclePhotoErrors((current) => ({
        ...current,
        [key]: saveError instanceof Error ? saveError.message : "Unable to save vehicle photos.",
      }));
    } finally {
      setSavingVehicleKey("");
    }
  };

  const handleVehicleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    listing: PartnerListing,
    vehicle: PartnerListing["vehicleOptions"][number],
  ) => {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);
    input.value = "";
    if (!selectedFiles.length) return;

    const key = `${listing.id}:${vehicle.name}`;
    const remainingSlots = maxVehicleImageCount - vehicle.images.length;
    if (selectedFiles.length > remainingSlots) {
      setVehiclePhotoErrors((current) => ({
        ...current,
        [key]: `You can add ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} (maximum ${maxVehicleImageCount}).`,
      }));
      return;
    }

    setSavingVehicleKey(key);
    setVehiclePhotoErrors((current) => ({ ...current, [key]: "" }));
    try {
      const newImages = await Promise.all(selectedFiles.map(prepareVehicleImage));
      await saveVehicleImages(listing, vehicle.name, [...vehicle.images, ...newImages]);
    } catch (uploadError) {
      setVehiclePhotoErrors((current) => ({
        ...current,
        [key]: uploadError instanceof Error ? uploadError.message : "Unable to prepare the selected photos.",
      }));
      setSavingVehicleKey("");
    }
  };

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

  if (application.status === "suspended") {
    return (
      <PortalFrame>
        <section className="mx-auto max-w-3xl px-5 py-14 md:py-20">
          <div className={`${panelClass} text-center`}>
            <XCircle className="mx-auto size-10 text-destructive" />
            <div className="mt-6"><StatusBadge status="suspended" /></div>
            <h1 className="mt-5 font-display text-3xl font-semibold">Partner account suspended</h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Restricted partner features are unavailable while this account is suspended.
            </p>
            {application.reviewNote ? <p className="mt-5 rounded-xl bg-secondary p-4 text-left text-sm">{application.reviewNote}</p> : null}
            <Button onClick={() => { clearAuthSession(); void navigate({ to: "/partner" }); }} variant="outline" className="mt-6 rounded-full"><LogOut />Logout</Button>
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
          <details className={`${panelClass} mb-8`}>
            <summary className="cursor-pointer font-display text-xl font-semibold">Add new listing</summary>
            <form onSubmit={createListing} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Listing overview</p>
              </div>
              <label className="block text-sm font-semibold">{application?.businessType === "Hotel" ? "Hotel name" : "Listing name"}<input required name="listingName" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
              <label className="block text-sm font-semibold">{application?.businessType === "Hotel" ? "Starting price per night" : "Price / fare"}<input name="listingPrice" type="number" min="0" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
              {application?.businessType === "Hotel" ? (
                <>
                  <label className="block text-sm font-semibold">Hotel category<select name="listingCategory" defaultValue="" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3"><option value="" disabled>Select category</option><option>Budget Hotel</option><option>Hotel</option><option>Resort</option><option>Mountain Resort</option><option>Homestay</option><option>Boutique Hotel</option><option>Luxury Hotel</option></select></label>
                  <label className="block text-sm font-semibold">Guest rating<input name="listingRating" type="number" min="0" max="5" step="0.1" placeholder="4.5" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                </>
              ) : null}
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Location and contact</p>
              </div>
              <label className="block text-sm font-semibold">City<input name="listingCity" required className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
              <label className="block text-sm font-semibold">State<input name="listingState" required className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
              <label className="block text-sm font-semibold sm:col-span-2">Full address<input name="listingAddress" required className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
              <label className="block text-sm font-semibold">
                Business phone <span className="font-normal text-muted-foreground">(shown at checkout)</span>
                <input name="listingContactPhone" type="tel" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" />
              </label>
              <label className="block text-sm font-semibold">
                Business email <span className="font-normal text-muted-foreground">(shown at checkout)</span>
                <input name="listingContactEmail" type="email" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" />
              </label>
              {application?.businessType === "Hotel" ? (
                <>
                  <label className="block text-sm font-semibold sm:col-span-2">
                    General hotel photos
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleHotelPhotoUpload} className="mt-2 block w-full rounded-lg border border-input bg-background p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground" />
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">{hotelPhotos.length}/{maxHotelImages} selected</span>
                  </label>
                  {hotelPhotos.length ? (
                    <div className="grid grid-cols-3 gap-2 sm:col-span-2 md:grid-cols-6">
                      {hotelPhotos.map((photo, index) => (
                        <div key={`${photo.slice(0, 40)}-${index}`} className="relative">
                          <img src={photo} alt={`Hotel photo ${index + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                          <button type="button" onClick={() => setHotelPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} className="absolute right-1 top-1 rounded-full bg-background/90 p-1" aria-label={`Remove hotel photo ${index + 1}`}><XCircle className="size-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <label className="block text-sm font-semibold sm:col-span-2">
                    Room types
                    <input
                      name="listingRoomTypes"
                      placeholder="Deluxe, Suite, Family Room"
                      onChange={(event) => {
                        const names = event.target.value.split(",").map((name) => name.trim()).filter(Boolean).filter((name, index, names) => names.indexOf(name) === index).slice(0, 20);
                        setRoomTypeNames(names);
                        setRoomTypePhotos((current) => Object.fromEntries(Object.entries(current).filter(([name]) => names.includes(name))));
                      }}
                      className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3"
                    />
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">Enter names separated by commas.</span>
                  </label>
                  {roomTypeNames.map((roomName) => (
                    <div key={roomName} className="rounded-2xl border border-border p-4 sm:col-span-2">
                      <p className="font-semibold">{roomName} room details</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="block text-xs font-semibold">Bed type<input value={roomTypeDetails[roomName]?.bedType ?? ""} onChange={(event) => setRoomTypeDetails((current) => ({ ...current, [roomName]: { ...(current[roomName] ?? { maxGuests: 2, beds: 1, price: 0, description: "", amenities: "" }), bedType: event.target.value } }))} placeholder="Double Bed" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
                        <label className="block text-xs font-semibold">Sleeps<input type="number" min="1" value={roomTypeDetails[roomName]?.maxGuests ?? 2} onChange={(event) => setRoomTypeDetails((current) => ({ ...current, [roomName]: { ...(current[roomName] ?? { bedType: "", beds: 1, price: 0, description: "", amenities: "" }), maxGuests: Number(event.target.value) } }))} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
                        <label className="block text-xs font-semibold">Beds<input type="number" min="1" value={roomTypeDetails[roomName]?.beds ?? 1} onChange={(event) => setRoomTypeDetails((current) => ({ ...current, [roomName]: { ...(current[roomName] ?? { bedType: "", maxGuests: 2, price: 0, description: "", amenities: "" }), beds: Number(event.target.value) } }))} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
                        <label className="block text-xs font-semibold">Price per night<input type="number" min="0" value={roomTypeDetails[roomName]?.price ?? 0} onChange={(event) => setRoomTypeDetails((current) => ({ ...current, [roomName]: { ...(current[roomName] ?? { bedType: "", maxGuests: 2, beds: 1, description: "", amenities: "" }), price: Number(event.target.value) } }))} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
                      </div>
                      <label className="mt-3 block text-xs font-semibold">Room description<textarea value={roomTypeDetails[roomName]?.description ?? ""} onChange={(event) => setRoomTypeDetails((current) => ({ ...current, [roomName]: { ...(current[roomName] ?? { bedType: "", maxGuests: 2, beds: 1, price: 0, amenities: "" }), description: event.target.value } }))} rows={2} placeholder="Describe the room's comfort, view, and features." className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
                      <label className="mt-3 block text-xs font-semibold">Room amenities (comma-separated)<input value={roomTypeDetails[roomName]?.amenities ?? ""} onChange={(event) => setRoomTypeDetails((current) => ({ ...current, [roomName]: { ...(current[roomName] ?? { bedType: "", maxGuests: 2, beds: 1, price: 0, description: "" }), amenities: event.target.value } }))} placeholder="AC, Wi-Fi, Breakfast" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
                      <p className="mt-4 text-xs font-semibold">Room photos</p>
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void handleRoomTypePhotoUpload(event, roomName)} className="mt-2 block w-full rounded-lg border border-input bg-background p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground" />
                      <span className="mt-1 block text-xs text-muted-foreground">{(roomTypePhotos[roomName] ?? []).length}/{maxRoomTypeImages} selected</span>
                      {(roomTypePhotos[roomName] ?? []).length ? (
                        <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6">
                          {(roomTypePhotos[roomName] ?? []).map((photo, index) => (
                            <div key={`${photo.slice(0, 40)}-${index}`} className="relative">
                              <img src={photo} alt={`${roomName} photo ${index + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                              <button type="button" onClick={() => setRoomTypePhotos((current) => ({ ...current, [roomName]: (current[roomName] ?? []).filter((_, photoIndex) => photoIndex !== index) }))} className="absolute right-1 top-1 rounded-full bg-background/90 p-1" aria-label={`Remove ${roomName} photo ${index + 1}`}><XCircle className="size-4" /></button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </>
              ) : null}
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Facilities and policies</p>
              </div>
              <label className="block text-sm font-semibold sm:col-span-2">Amenities (comma-separated)<input name="listingAmenities" placeholder="Wi-Fi, Parking, Restaurant, Room service" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
              {application?.businessType === "Hotel" ? (
                <>
                  <label className="block text-sm font-semibold">Availability<input name="listingAvailability" placeholder="Available throughout the season" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm font-semibold">Check-in<input name="checkInTime" type="time" defaultValue="14:00" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                    <label className="block text-sm font-semibold">Check-out<input name="checkOutTime" type="time" defaultValue="12:00" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3" /></label>
                  </div>
                  <label className="block text-sm font-semibold sm:col-span-2">Terms and conditions (one per line)<textarea name="listingTerms" rows={4} placeholder={"Free cancellation up to 24 hours before arrival.\nGovernment ID required at check-in."} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
                </>
              ) : null}
              <label className="block text-sm font-semibold sm:col-span-2">Description<textarea required name="listingDescription" rows={4} maxLength={3000} className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              {listingError ? <p role="alert" className="sm:col-span-2 text-sm text-destructive">{listingError}</p> : null}
              <Button type="submit" disabled={listingSubmitting} className="sm:col-span-2 rounded-full">{listingSubmitting ? "Publishing…" : "Publish listing"}</Button>
            </form>
          </details>
          <div className="grid gap-8 lg:grid-cols-2">
            <section className={panelClass}>
              <h2 className="font-display text-2xl font-semibold">Bookings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bookings associated with your Treko listing.
              </p>
              {bookingActionError ? <p role="alert" className="mt-4 text-sm text-destructive">{bookingActionError}</p> : null}
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
                        <span className="font-semibold">Customer details:</span>{" "}
                        {booking.customerName} · {booking.customerEmail}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Phone:</span>{" "}
                        {booking.customerPhone ? (
                          <a href={`tel:${booking.customerPhone}`} className="text-primary underline-offset-4 hover:underline">
                            {booking.customerPhone}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Gender:</span>{" "}
                        {booking.customerGender || "Not provided"}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Preferences:</span>{" "}
                        {booking.customerPreferences || "None provided"}
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
                      {booking.status === "Pending" && booking.confirmedByCurrentBusiness ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Availability confirmed. Waiting for the other selected businesses.
                        </p>
                      ) : null}
                      {booking.status === "Pending" && !booking.confirmedByCurrentBusiness ? (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-4 rounded-full"
                          disabled={confirmingBookingId === booking.id}
                          onClick={() => void confirmBooking(booking.id)}
                        >
                          {confirmingBookingId === booking.id ? "Confirming…" : "Confirm availability"}
                        </Button>
                      ) : null}
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
                        {listing.active === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-primary">
                      {listing.type} · {listing.destination}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {listing.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => void saveListingChanges(listing.id, { active: listing.active === false })}>
                        {listing.active === false ? "Activate" : "Deactivate"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => void deleteListing(listing.id)}>
                        <Trash2 /> Delete
                      </Button>
                    </div>
                    {listing.type === "Cab Operator" ? (
                      <div className="mt-5 border-t border-border pt-5">
                        <h4 className="font-semibold">Vehicle photos</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Add up to four photos per vehicle. Photos are resized before saving.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {(listing.vehicleOptions.length
                            ? listing.vehicleOptions
                            : buildCabVehicleOptions(
                                ["Sedan", "SUV", "Tempo Traveller", "Mini Van"],
                                [
                                  "Up to 4 passengers",
                                  "Up to 6 passengers",
                                  "Up to 12 passengers",
                                  "Up to 8 passengers",
                                ],
                              ).map((vehicle) => ({ ...vehicle, images: [] }))
                          ).map((vehicle) => {
                            const key = `${listing.id}:${vehicle.name}`;
                            const saving = savingVehicleKey === key;
                            const photosSaving = Boolean(savingVehicleKey);
                            const fallbackImages = buildCabVehicleOptions(
                              [vehicle.name],
                              [vehicle.seatingCapacity],
                            )[0]?.images ?? [];
                            const previewImages = vehicle.images.length
                              ? vehicle.images
                              : fallbackImages;
                            return (
                              <div key={vehicle.name} className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <h5 className="font-semibold">{vehicle.name}</h5>
                                    <p className="text-xs text-muted-foreground">
                                      {vehicle.seatingCapacity}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {vehicle.images.length}/{maxVehicleImageCount} photos
                                  </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                  {previewImages.map((image, index) => (
                                    <div
                                      key={`${vehicle.name}-${index}`}
                                      className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"
                                    >
                                      <img
                                        src={image}
                                        alt={`${listing.name} ${vehicle.name} ${vehicle.images.length ? "uploaded" : "sample"} photo ${index + 1}`}
                                        className="h-full w-full object-cover"
                                      />
                                      {vehicle.images.length ? (
                                        <button
                                          type="button"
                                          aria-label={`Remove ${vehicle.name} photo ${index + 1}`}
                                          disabled={photosSaving}
                                          onClick={() =>
                                            void saveVehicleImages(
                                              listing,
                                              vehicle.name,
                                              vehicle.images.filter((_, photoIndex) => photoIndex !== index),
                                            )
                                          }
                                          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                                        >
                                          <Trash2 className="size-4" />
                                        </button>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                                <label
                                  className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary ${
                                    photosSaving || vehicle.images.length >= maxVehicleImageCount
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }`}
                                >
                                  {saving ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                  ) : (
                                    <ImagePlus className="size-4" />
                                  )}
                                  {saving ? "Saving photos…" : "Add vehicle photos"}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    disabled={photosSaving || vehicle.images.length >= maxVehicleImageCount}
                                    onChange={(event) =>
                                      void handleVehicleImageUpload(event, listing, vehicle)
                                    }
                                    className="sr-only"
                                  />
                                </label>
                                {vehiclePhotoErrors[key] ? (
                                  <p role="alert" className="mt-2 text-sm text-destructive">
                                    {vehiclePhotoErrors[key]}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Other listing details can be updated by contacting Treko support.
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  const review = async (applicationId: string, status: "approved" | "rejected" | "suspended" | "reactivated") => {
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

  const filteredApplications = applications.filter((application) => {
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || [application.businessName, application.ownerName, application.ownerEmail].some((value) => value.toLowerCase().includes(needle));
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || application.businessType === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
          <div className="mt-6 grid gap-3 rounded-2xl bg-secondary p-4 sm:grid-cols-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or business" className="h-11 rounded-lg border border-input bg-background px-3 text-sm" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm"><option value="all">All categories</option><option value="Hotel">Hotels</option><option value="Cab Operator">Cabs</option><option value="Travel Guide">Guides</option></select>
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
              {filteredApplications.map((application) => (
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
                  {application.status === "approved" ? (
                    <Button onClick={() => void review(application.id, "suspended")} disabled={Boolean(activeId)} variant="outline" className="mt-5 rounded-full">
                      <XCircle /> Suspend partner
                    </Button>
                  ) : null}
                  {application.status === "suspended" ? (
                    <Button onClick={() => void review(application.id, "reactivated")} disabled={Boolean(activeId)} className="mt-5 rounded-full">
                      <BadgeCheck /> Reactivate partner
                    </Button>
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
