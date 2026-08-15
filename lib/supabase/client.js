import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Ouedna stability: one browser client prevents duplicate GoTrueClient instances
// when routes are code-split or hot-reloaded. Server code must use server.js instead.
const clientKey = "__ouednaSupabaseBrowserClient";

export function getSupabaseBrowserClient() {
  const globalScope = globalThis;
  if (!globalScope[clientKey]) {
    globalScope[clientKey] = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return globalScope[clientKey];
}

export const supabase = getSupabaseBrowserClient();
