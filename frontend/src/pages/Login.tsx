import { FormEvent, useState } from "react";
import { supabase } from "../services/api";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const { error, data } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else if (mode === "up" && !data.session) setMsg("Check your email to confirm your account, then sign in.");
    setBusy(false);
  }
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8 shadow-[0_0_60px_-20px_#7C3AED]">
        <h1 className="text-2xl font-bold tracking-tight">TestPilot AI</h1>
        <p className="text-sm text-mute">{mode === "in" ? "Sign in to your workspace." : "Create your account."}</p>
        <input className="input" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password (8+ characters)" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
        {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
        <button className="btn w-full justify-center" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
        <button type="button" className="text-sm text-mute hover:text-ink" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}</button>
      </form>
    </main>);
}
