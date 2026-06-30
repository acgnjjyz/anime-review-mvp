import { NextResponse } from "next/server";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/", request.url));
}
