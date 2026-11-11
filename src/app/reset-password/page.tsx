"use client";

import { FormEvent, useCallback, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not reset the password.");
      setPassword("");
      setSuccessMessage(result.message ?? "Password updated. Sign in with your new password.");
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
          <h1>Choose a new password</h1>
          <p className="auth-subtitle">{token ? "Use a new password of at least 12 characters." : "This reset link is missing or invalid. Request a new one to continue."}</p>
          {token
            ? <form onSubmit={submit} className="auth-form">
              <label>New password<input type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" /></label>
              {errorMessage && <p role="alert" className="auth-error">{errorMessage}</p>}
              {successMessage && <p role="status" className="auth-success">{successMessage}</p>}
              <button type="submit" className="button button-primary auth-submit" disabled={busy || Boolean(successMessage)}>{busy ? "Please wait…" : successMessage ? "Password updated" : "Update password"} {!busy && !successMessage && <ArrowRight size={15} />}</button>
            </form>
            : <div className="auth-links"><Link href="/forgot-password">Request a new reset link</Link></div>}
          {successMessage && <div className="auth-links"><Link href="/login">Continue to sign in</Link></div>}
        </div>
        <div className="auth-footer"><span>VIRALFLOW <i>·</i> One home for every editing style</span></div>
      </section>
    </main>
  );
}
