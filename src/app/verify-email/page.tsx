"use client";

import { FormEvent, useCallback, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const subscribeToHash = useCallback((onChange: () => void) => {
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const getTokenSnapshot = useCallback(
    () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "",
    [],
  );
  const token = useSyncExternalStore(subscribeToHash, getTokenSnapshot, () => "");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const isResend = !token;
      const response = await fetch(`/api/auth/${isResend ? "resend-verification" : "verify-email"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(isResend ? { email } : { token }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not verify this email address.");
      setSuccessMessage(result.message ?? "Request completed.");
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
        <Link href="/login" className="auth-back"><ArrowLeft size={14} /> Back to sign in</Link>
      </header>
      <section className="auth-content">
        <div className="auth-card">
          <div className="auth-icon"><MailCheck size={20} /></div>
          <div className="eyebrow">EMAIL CONFIRMATION</div>
          <h1>{token ? "Verify your email" : "Resend verification"}</h1>
          <p className="auth-subtitle">{token ? "Confirm this address to activate sign-in for your account." : "Enter your account email to request another verification link."}</p>
          <form onSubmit={submit} className="auth-form">
            {token
              ? <button type="submit" className="button button-primary auth-submit" disabled={busy || Boolean(successMessage)}>{busy ? "Please wait…" : successMessage ? "Email verified" : "Verify email address"} {!busy && !successMessage && <ArrowRight size={15} />}</button>
              : <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
            {errorMessage && <p role="alert" className="auth-error">{errorMessage}</p>}
            {successMessage && <p role="status" className="auth-success">{successMessage}</p>}
            {!token && <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : "Send verification link"} {!busy && <ArrowRight size={15} />}</button>}
          </form>
          {successMessage && <div className="auth-links"><Link href="/login">Continue to sign in</Link></div>}
        </div>
        <div className="auth-footer"><span>VIRALFLOW <i>·</i> One home for every editing style</span></div>
      </section>
    </main>
  );
}
