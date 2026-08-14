import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * عميل Supabase للاستخدام داخل Server Components و Route Handlers.
 * يقرأ/يكتب جلسة المصادقة عبر الكوكيز (يتوافق مع middleware.ts).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // يُستدعى من Server Component لا يمكنه تعديل الكوكيز — يتم تجاهله
            // لأن middleware.ts يتكفّل بتحديث الجلسة في هذه الحالة.
          }
        },
      },
    }
  );
}
