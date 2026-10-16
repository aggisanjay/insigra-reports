import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  // Sign out user on Supabase auth service and clear local session cookies
  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(`${requestUrl.origin}/login`, {
    status: 302,
  });
}

export async function GET(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(`${requestUrl.origin}/login`, {
    status: 302,
  });
}
