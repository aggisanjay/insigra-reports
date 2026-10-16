import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.includes("sb-") || c.name.includes("auth")) {
      cookieStore.delete(c.name);
    }
  }

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(`${requestUrl.origin}/login`, {
    status: 302,
  });
}

export async function GET(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.includes("sb-") || c.name.includes("auth")) {
      cookieStore.delete(c.name);
    }
  }

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(`${requestUrl.origin}/login`, {
    status: 302,
  });
}
