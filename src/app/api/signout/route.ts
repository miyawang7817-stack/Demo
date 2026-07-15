import { NextResponse } from "next/server";
import { signOut } from "@/lib/session";

export async function POST(req: Request) {
  signOut();
  // Redirect back to where the form was submitted from.
  const referer = req.headers.get("referer") || "/";
  return NextResponse.redirect(new URL(referer).origin + "/", { status: 303 });
}
