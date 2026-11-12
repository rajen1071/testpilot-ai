import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const API = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error { constructor(public status: number, msg: string) { super(msg); } }

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(API + path, { ...init, headers: {
    "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}`, ...init.headers } });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new ApiError(res.status, typeof b.detail === "string" ? b.detail : "Request failed"); }
  return res.status === 204 ? (undefined as T) : res.json();
}
export type Project = { id: string; name: string; description: string | null; base_url: string | null; created_at: string };
