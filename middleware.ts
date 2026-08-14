import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./lib/supabase/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function hasDashboardPermission(profile: { role?: string | null; permissions?: unknown } | null) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (!profile.permissions || typeof profile.permissions !== "object") return false;
  return Object.values(profile.permissions as Record<string, unknown>).some((value) => value === true);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
    }
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPath = PUBLIC_ADMIN_PATHS.includes(pathname);
  let hasAdminAccess = false;

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("role,permissions")
      .eq("id", user.id)
      .maybeSingle();
    hasAdminAccess = hasDashboardPermission(profile);
  }

  if (isAdminRoute && !isLoginPath && (!user || !hasAdminAccess)) {
    const loginUrl = new URL("/admin/login", request.url);
    if (user) loginUrl.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && user && hasAdminAccess) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // وضع الصيانة: يُستثنى /admin (يبقى متاحاً للمدير/المشرف لإيقاف الصيانة)
  // ومسار /maintenance نفسه لتفادي حلقة تحويل لا نهائية.
  const isMaintenancePage = pathname === "/maintenance";
  if (!isAdminRoute && !isMaintenancePage) {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();

    if (settings?.maintenance_mode) {
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon|icon-|images/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|xml|txt)$).*)",
  ],
};
