import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Endpoint logout aman (FR-AUTH-6).
 * Menghapus cookie sesi httpOnly dengan menetapkan maxAge: 0.
 */
export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
