import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { saveAdSettings } from "@/lib/admin";

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminSupabase();
  await saveAdSettings(admin, {
    ad_text: body.ad_text ?? "",
    ad_enabled: !!body.ad_enabled,
  });

  return NextResponse.json({ ok: true });
}
