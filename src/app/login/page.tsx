"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthResponse = {
  user?: { email: string };
  message?: string;
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password, ...(mode === "register" && username.trim() ? { username: username.trim() } : {}) }),
      });
      const result = (await response.json()) as AuthResponse;
      if (!response.ok) throw new Error(result.error ?? "Could not authenticate this account.");
      if (mode === "register") {
        setPassword("");
        setSuccessMessage(result.message ?? "Check your email for a verification link before signing in.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The account service is unavailable.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <header className="auth-topbar">
        <Link href="/" className="brand-mark auth-brand"><span className="brand-symbol"><span /><span /><span /></span><span className="brand-word">VIRAL<span>FLOW</span></span></Link>
        <Link href="/" className="auth-back"><ArrowLeft size={14} /> Back to workspace</Link>
      </header>
      <section className="auth-content">
        <div className="auth-card">
          <div className="auth-icon"><Sparkles size={20} /></div>
          <div className="eyebrow">{mode === "register" ? "START YOUR CREATOR WORKSPACE" : "WELCOME BACK"}</div>
          <h1>{mode === "register" ? "Create your account" : "Sign in to VIRALFLOW"}</h1>
          <p className="auth-subtitle">Your creator workspace, saved securely to your account.</p>
          <div className="auth-tabs"><button type="button" className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setErrorMessage(""); setSuccessMessage(""); }}>Sign in</button><button type="button" className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setErrorMessage(""); setSuccessMessage(""); }}>Create account</button></div>
          <form onSubmit={submit} className="auth-form">
            {mode === "register" && <label>Creator name<input autoComplete="nickname" value={username} maxLength={40} onChange={(event) => setUsername(event.target.value)} placeholder="How should we address you?" /></label>}
            <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 12 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "register" ? "At least 12 characters" : "Your password"} /></label>
            {errorMessage && <p role="alert" className="auth-error">{errorMessage}</p>}
            {successMessage && <p role="status" className="auth-success">{successMessage}</p>}
            <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"} {!busy && <ArrowRight size={15} />}</button>
          </form>
          {mode === "login" && <div className="auth-links"><Link href="/forgot-password">Forgot password?</Link><Link href="/verify-email">Resend verification email</Link></div>}
          <div className="auth-security"><ShieldCheck size={14} /><span>Passwords are hashed before storage. Sessions use HTTP-only cookies.</span></div>
          <p className="auth-provider-note">Google and Discord sign-in will be available after provider credentials are configured.</p>
        </div>
        <div className="auth-footer"><span>VIRALFLOW <i>·</i> One home for every editing style</span></div>
      </section>
    </main>
  );
}
