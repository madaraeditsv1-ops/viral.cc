import nodemailer from "nodemailer";
import type { AuthTokenPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { newSessionToken, sessionTokenHash } from "@/lib/auth";

const TOKEN_LIFETIME_MS = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
} satisfies Record<AuthTokenPurpose, number>;

function getEmailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const appUrl = process.env.APP_URL?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  if (!host || !from || !appUrl || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Email delivery is not configured. Set APP_URL and valid SMTP settings.");
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(appUrl);
  } catch {
    throw new Error("APP_URL must be an absolute HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
    throw new Error("APP_URL must be an absolute HTTP or HTTPS URL without credentials.");
  }

  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  if (Boolean(user) !== Boolean(password)) {
    throw new Error("Set both SMTP_USER and SMTP_PASSWORD, or leave both empty.");
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    from,
    baseUrl,
    auth: user && password ? { user, pass: password } : undefined,
  };
}

export function assertEmailDeliveryConfigured() {
  getEmailConfig();
}

export async function createAndSendAuthToken(
  userId: string,
  email: string,
  purpose: AuthTokenPurpose,
) {
  const config = getEmailConfig();
  const rawToken = newSessionToken();
  const tokenHash = sessionTokenHash(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS[purpose]);

  await prisma.authToken.upsert({
    where: { userId_purpose: { userId, purpose } },
    create: { userId, purpose, tokenHash, expiresAt },
    update: { tokenHash, expiresAt, createdAt: new Date() },
  });

  const isVerification = purpose === "EMAIL_VERIFICATION";
  const path = isVerification ? "/verify-email" : "/reset-password";
  const link = new URL(path, config.baseUrl);
  link.hash = new URLSearchParams({ token: rawToken }).toString();
  const subject = isVerification ? "Verify your VIRALFLOW email" : "Reset your VIRALFLOW password";
  const action = isVerification ? "Verify email address" : "Choose a new password";
  const purposeText = isVerification
    ? "This link expires in 24 hours."
    : "This link expires in 1 hour. Your password will not change unless you submit a new one.";
  const safeLink = link.toString().replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const safeAction = action.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  try {
    await nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    }).sendMail({
      from: config.from,
      to: email,
      subject,
      text: `${action}: ${link.toString()}\n\n${purposeText} If you did not request this, you can ignore this email.`,
      html: `<p>${safeAction}:</p><p><a href="${safeLink}">${safeAction}</a></p><p>${purposeText} If you did not request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    await prisma.authToken.deleteMany({ where: { tokenHash } });
    throw error;
  }
}
