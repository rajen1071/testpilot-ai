import { FormEvent, useState } from "react";
import { api } from "../services/api";

export default function Onboarding() {
  const [name, setName] = useState(""); const [err, setErr] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr("");
    try { await api("/orgs", { method: "POST", body: JSON.stringify({ name }) }); window.location.assign("/dashboard"); }
    catch (x) { setErr((x as Error).message); }
  }
  return (<main className="grid min-h-screen place-items-center px-4">
    <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
      <h1 className="text-xl font-semibold">Name your workspace</h1>
      <p className="text-sm text-mute">Your team's projects and test cases live here.</p>
      <input className="input" required minLength={2} placeholder="Acme QA" value={name} onChange={e => setName(e.target.value)} />
      {err && <p role="alert" className="text-sm text-bad">{err}</p>}
      <button className="btn w-full justify-center">Create workspace</button>
    </form></main>);
}
