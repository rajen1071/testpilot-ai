import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type D = { total_projects: number; recent_projects: { id: string; name: string; base_url: string | null; created_at: string }[] };

export default function Dashboard() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => api<D>("/dashboard") });
  if (q.isLoading) return <p className="text-mute">Loading…</p>;
  if (q.error) return <p role="alert" className="text-bad">{(q.error as Error).message}</p>;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5"><p className="text-sm text-mute">Total projects</p><p className="mt-2 text-3xl font-bold">{d.total_projects}</p></div>
        {["Test cases", "Executed", "Pass rate"].map(l => (
          <div key={l} className="card p-5"><p className="text-sm text-mute">{l}</p><p className="mt-2 text-3xl font-bold text-mute">—</p>
            <p className="mt-1 text-xs text-mute">Available once test cases exist (Phase 2–5)</p></div>))}
      </section>
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-medium">Recent projects</h2><Link to="/projects" className="text-sm text-accent">View all</Link></div>
        {d.recent_projects.length === 0 ? <p className="text-sm text-mute">No projects yet. <Link to="/projects" className="text-accent">Create your first project</Link>.</p> :
          <ul className="divide-y divide-white/5">{d.recent_projects.map(p => (
            <li key={p.id} className="flex justify-between py-2 text-sm"><span>{p.name}</span><span className="text-mute">{p.base_url ?? "No URL"}</span></li>))}</ul>}
      </section>
    </div>);
}
