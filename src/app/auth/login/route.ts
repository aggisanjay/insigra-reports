import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cookieStore = cookies();

    // 1. Flush any stale session cookies to avoid session crossover
    const existing = cookieStore.getAll();
    for (const c of existing) {
      if (c.name.includes("sb-") || c.name.includes("auth")) {
        try {
          cookieStore.delete(c.name);
        } catch {
          // ignore
        }
      }
    }

    // 2. Authenticate on server
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      email: data.user?.email,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal login error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
