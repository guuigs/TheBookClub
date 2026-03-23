import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username requis" },
      { status: 400 }
    );
  }

  // Validate username format
  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({
      available: false,
      reason: "format",
    });
  }

  if (username.length < 3) {
    return NextResponse.json({
      available: false,
      reason: "too_short",
    });
  }

  if (username.length > 30) {
    return NextResponse.json({
      available: false,
      reason: "too_long",
    });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    available: !data,
    reason: data ? "taken" : null,
  });
}
