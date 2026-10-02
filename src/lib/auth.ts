import { getApiUrl } from "@/lib/api";

const USERS_KEY = "treko-demo-users";
const CURRENT_USER_KEY = "treko-demo-current-user";
const AUTH_TOKEN_KEY = "treko-auth-token";
const BOOKINGS_KEY = "treko-demo-bookings";
const CART_KEY = "treko-demo-cart";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegistrationDetails = AuthCredentials & {
  firstName: string;
  lastName: string;
};

export type TrekoUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  createdAt: string;
};

export type TripItem = {
  id: string;
  type: "stay" | "cab" | "guide";
  category: string;
  name: string;
  image: string;
  location: string;
  packageName: string;
  price: number;
  quantity: number;
  destination: string;
  bookingMeta?: Record<string, string | number | boolean | null>;
};

export type BookingRecord = {
  id: string;
  userId: string;
  userName: string;
  destination: string;
  hotel: string | null;
  cab: string | null;
  guide: string | null;
  items: TripItem[];
  total: number;
  couponUsed: string | null;
  bookingDate: string;
  status: "Pending" | "Confirmed";
};

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota or storage access errors in demo mode
  }
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures in demo mode
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUserPayload(payload: any): TrekoUser | null {
  if (!payload || !payload.email) {
    return null;
  }

  const fullName = typeof payload.name === "string" ? payload.name.trim() : "";
  const nameParts = fullName ? fullName.split(/\s+/) : [];
  const firstName = payload.firstName || nameParts[0] || "Treko";
  const lastName = payload.lastName || nameParts.slice(1).join(" ") || "";

  return {
    id: payload.id || payload._id || "",
    firstName,
    lastName,
    email: payload.email,
    plan: payload.plan || "Free",
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

export function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("treko-auth-change"));
  }
}

export function getStoredUsers(): Array<TrekoUser & { passwordHash: string }> {
  const raw = readStorage(USERS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Array<TrekoUser & { passwordHash: string }>;
  } catch {
    return [];
  }
}

export function getCurrentUser(): TrekoUser | null {
  const raw = readStorage(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    const user = JSON.parse(raw) as TrekoUser;
    if (!user?.id || !user.email) return null;
    return user;
  } catch {
    return null;
  }
}

export function getCurrentPlan(): string {
  return getCurrentUser()?.plan || "Free";
}

export function getAuthToken(): string | null {
  return readStorage(AUTH_TOKEN_KEY);
}

export function saveAuthSession(token: string, user: TrekoUser): void {
  writeStorage(AUTH_TOKEN_KEY, token);
  writeStorage(CURRENT_USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

export function clearAuthSession(): void {
  removeStorage(AUTH_TOKEN_KEY);
  removeStorage(CURRENT_USER_KEY);
  notifyAuthChange();
}

export function logoutDemo(): void {
  clearAuthSession();
}

export async function signInDemo({ email, password }: AuthCredentials): Promise<TrekoUser> {
  const response = await fetch(getApiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Invalid email or password.");
  }

  const normalizedUser = normalizeUserPayload(data.user);
  if (!normalizedUser) {
    throw new Error("Unable to load your profile.");
  }

  saveAuthSession(data.token, normalizedUser);
  return normalizedUser;
}

export async function registerDemo({ firstName, lastName, email, password }: RegistrationDetails): Promise<TrekoUser> {
  const response = await fetch(getApiUrl("/api/auth/signup"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to create your account.");
  }

  const normalizedUser = normalizeUserPayload(data.user);
  if (!normalizedUser) {
    throw new Error("Unable to save your profile.");
  }

  saveAuthSession(data.token, normalizedUser);
  return normalizedUser;
}

export async function refreshCurrentUser(): Promise<TrekoUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(getApiUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAuthSession();
      return null;
    }

    const data = await response.json();
    const normalizedUser = normalizeUserPayload(data.user);

    if (!normalizedUser) {
      clearAuthSession();
      return null;
    }

    saveAuthSession(token, normalizedUser);
    return normalizedUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveTripSelection(items: TripItem[]): void {
  writeStorage(CART_KEY, JSON.stringify(items));
}

export function upsertTripSelection(item: TripItem): TripItem[] {
  const existing = readTripSelection();
  const filtered = existing.filter((entry) => entry.type !== item.type);
  const next = [...filtered, item];
  saveTripSelection(next);
  return next;
}

export function readTripSelection(): TripItem[] {
  const raw = readStorage(CART_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TripItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearTripSelection(): void {
  removeStorage(CART_KEY);
}

export function readBookings(): BookingRecord[] {
  const raw = readStorage(BOOKINGS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as BookingRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeBookings(bookings: BookingRecord[]): void {
  writeStorage(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getValidCouponCode(): string {
  return "TREKO100";
}

export function isValidCoupon(code: string): boolean {
  return code.trim().toUpperCase() === getValidCouponCode();
}

export function parsePrice(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const numericString = value.replace(/[^\d]/g, "");
  return Number(numericString || 0);
}
