import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("[auth/callback] URL:", request.url);
  console.log("[auth/callback] code:", code ? `${code.slice(0, 10)}...` : "NULL");
  console.log("[auth/callback] error param:", errorParam);
  console.log("[auth/callback] error_description:", errorDescription);

  if (!code) {
    console.log("[auth/callback] No code found, redirecting to / with error");
    return NextResponse.redirect(`${origin}/?error=auth&reason=no_code`);
  }

  const cookieStore = cookies();
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options });
            try {
              cookieStore.set(name, value, options);
            } catch {
              // ignored
            }
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("[auth/callback] exchangeCodeForSession error:", error?.message ?? "none");
  console.log("[auth/callback] session user:", data?.user?.email ?? "no user");
  console.log("[auth/callback] pending cookies count:", pendingCookies.length);
  console.log("[auth/callback] pending cookie names:", pendingCookies.map(c => c.name));

  if (error) {
    console.log("[auth/callback] FAILED, redirecting to /?error=auth");
    return NextResponse.redirect(`${origin}/?error=auth&reason=${encodeURIComponent(error.message)}`);
  }

  const redirectUrl = `${origin}/`;
  console.log("[auth/callback] SUCCESS, redirecting to:", redirectUrl);

  const response = NextResponse.redirect(redirectUrl);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  console.log("[auth/callback] Response cookies set, returning redirect");
  return response;
}
