import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { api, Project } from "../services/api";

export default function Projects() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["projects"], queryFn: () => api<Project[]>("/projects") });
  const [form, setForm] = useState({ name: "", description: "", base_url: "" });
  const [err, setErr] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["projects"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); };
  const create = useMutation({
    mutationFn: () => api("/projects", { method: "POST", body: JSON.stringify({ ...form, description: form.description || null, base_url: form.base_url || null }) }),
    onSuccess: () => { setForm({ name: "", description: "", base_url: "" }); setErr(""); refresh(); }, onError: e => setErr((e as Error).message) });
  const del = useMutation({ mutationFn: (id: string) => api(`/projects/${id}`, { method: "DELETE" }), onSuccess: refresh, onError: e => setErr((e as Error).message) });
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api(`/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
    onSuccess: refresh, onError: e => setErr((e as Error).message) });
  const submit = (e: FormEvent) => { e.preventDefault(); create.mutate(); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <form onSubmit={submit} className="card grid gap-3 p-5 md:grid-cols-4">
        <input className="input" required minLength={2} placeholder="Project name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Application URL (https://…)" value={form.base_url} onChange={e => setForm({ ...form, base_url: e.target.value })} />
        <input className="input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button className="btn justify-center" disabled={create.isPending}><Plus size={14} />Create project</button>
      </form>
      {err && <p role="alert" className="text-sm text-bad">{err}</p>}
      {list.isLoading ? <p className="text-mute">Loading…</p> : list.data?.length === 0 ? <p className="text-sm text-mute">No projects yet. Add one above.</p> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.data?.map(p => (
          <article key={p.id} className="card p-5">
            <div className="flex items-start justify-between gap-2"><h2 className="font-medium">{p.name}</h2>
              <div className="flex gap-2">
                <button className="text-xs text-accent" onClick={() => { const n = prompt("Rename project", p.name); if (n && n.length > 1) rename.mutate({ id: p.id, name: n }); }}>Rename</button>
                <button aria-label={`Delete ${p.name}`} className="text-mute hover:text-bad" onClick={() => confirm(`Delete "${p.name}"?`) && del.mutate(p.id)}><Trash2 size={14} /></button></div></div>
            <p className="mt-1 text-sm text-mute">{p.description ?? "No description"}</p>
            <p className="mt-3 truncate text-xs text-accent">{p.base_url ?? "No URL set"}</p>
          </article>))}</div>}
    </div>);
}
