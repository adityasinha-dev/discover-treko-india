import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/TrekoLanding";
import { registerDemo, signInDemo } from "@/lib/auth";

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthShell({ children, eyebrow, title, description }: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-hero px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <Link to="/" className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary">Back to Treko</Link>
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[.9fr_1.1fr]">
        <aside className="hidden max-w-md lg:block">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary"><MapPin className="size-6" /></span>
          <p className="section-label mt-7">{eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-foreground">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium text-foreground/80">
            <Sparkles className="size-4 text-primary" />Plan your next journey with Treko
          </div>
        </aside>
        <section className="mx-auto w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-hero sm:p-9">
          <p className="section-label lg:hidden">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl lg:mt-0">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-5 rounded-xl border border-border bg-secondary/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
            Demo mode: this frontend preview doesn’t create or authenticate accounts. Form data isn’t saved or sent.
          </div>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </main>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-destructive">{message}</p> : null;
}

function PasswordField({ id, label, value, onChange, error, autoComplete }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative mt-2">
        <Input id={id} name={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="h-11 pr-12" />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Enter your email address.";
  if (!emailPattern.test(email.trim())) return "Enter a valid email address.";
  return undefined;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = { email: validateEmail(email) };
    if (!password) nextErrors.password = "Enter your password.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signInDemo({ email: email.trim(), password });
      await navigate({ to: "/explore" });
    } catch {
      setErrors({ form: "We couldn’t continue. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Welcome back to Treko" title="Welcome Back" description="Log in to continue exploring stays and local travel across India.">
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="text-sm font-semibold text-foreground">Email</label>
          <Input id="login-email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined, form: undefined })); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} className="mt-2 h-11" />
          <FieldError id="login-email-error" message={errors.email} />
        </div>
        <PasswordField id="login-password" label="Password" value={password} onChange={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined, form: undefined })); }} error={errors.password} autoComplete="current-password" />
        {errors.form && <p role="alert" className="text-sm font-medium text-destructive">{errors.form}</p>}
        <Button type="submit" disabled={submitting} className="h-12 w-full rounded-full text-base">{submitting ? "Logging in…" : "Login"} {!submitting && <ArrowRight />}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Don’t have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create Account</Link></p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Enter your full name.";
    nextErrors.email = validateEmail(email);
    if (password.length < 8) nextErrors.password = "Use at least 8 characters for your password.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await registerDemo({ fullName: fullName.trim(), email: email.trim(), password });
      await navigate({ to: "/explore" });
    } catch {
      setErrors({ form: "We couldn’t create the account. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Start your next journey" title="Create Your Account" description="Create your Treko profile and find your next destination in India.">
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="text-sm font-semibold text-foreground">Full Name</label>
          <Input id="register-name" name="name" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setErrors((current) => ({ ...current, fullName: undefined, form: undefined })); }} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "register-name-error" : undefined} className="mt-2 h-11" />
          <FieldError id="register-name-error" message={errors.fullName} />
        </div>
        <div>
          <label htmlFor="register-email" className="text-sm font-semibold text-foreground">Email</label>
          <Input id="register-email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined, form: undefined })); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "register-email-error" : undefined} className="mt-2 h-11" />
          <FieldError id="register-email-error" message={errors.email} />
        </div>
        <PasswordField id="register-password" label="Password" value={password} onChange={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined, form: undefined })); }} error={errors.password} autoComplete="new-password" />
        <PasswordField id="register-confirm-password" label="Confirm Password" value={confirmPassword} onChange={(value) => { setConfirmPassword(value); setErrors((current) => ({ ...current, confirmPassword: undefined, form: undefined })); }} error={errors.confirmPassword} autoComplete="new-password" />
        {errors.form && <p role="alert" className="text-sm font-medium text-destructive">{errors.form}</p>}
        <Button type="submit" disabled={submitting} className="h-12 w-full rounded-full text-base">{submitting ? "Creating account…" : "Create Account"} {!submitting && <ArrowRight />}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link></p>
    </AuthShell>
  );
}
