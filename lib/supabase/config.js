// Public Supabase configuration shared by server and browser clients.
// Vercel variables remain the preferred source; the anon key is public by design and is RLS-protected.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cwbenhuiextfoiyfboxo.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmVuaHVpZXh0Zm9peWZib3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDIwMjcsImV4cCI6MjA5OTMxODAyN30.coWbBaPvT08K_zk8ZQyedJ-gFcr_q9HQS8r5mXqu50I";
