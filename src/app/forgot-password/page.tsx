"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not request a password reset.");
      setSuccessMessage(result.message ?? "If an eligible account exists, a reset link will be sent shortly.");
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
          <div className="auth-icon"><KeyRound size={20} /></div>
          <div className="eyebrow">ACCOUNT RECOVERY</div>
          <h1>Reset your password</h1>
          <p className="auth-subtitle">Enter your account email and we will send a secure reset link if it matches an eligible account.</p>
          <form onSubmit={submit} className="auth-form">
            <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            {errorMessage && <p role="alert" className="auth-error">{errorMessage}</p>}
            {successMessage && <p role="status" className="auth-success">{successMessage}</p>}
            <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : "Send reset link"} {!busy && <ArrowRight size={15} />}</button>
          </form>
        </div>
        <div className="auth-footer"><span>VIRALFLOW <i>·</i> One home for every editing style</span></div>
      </section>
    </main>
  );
}
