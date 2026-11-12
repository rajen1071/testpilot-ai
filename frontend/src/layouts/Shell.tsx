import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, FolderKanban, Sparkles, MonitorPlay, ListChecks, Play, BarChart3, Plug, Settings, Search, Bell, LogOut } from "lucide-react";
import { api, supabase } from "../services/api";

const nav = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/projects", "Projects", FolderKanban],
  ["/generate", "Generate Test Cases", Sparkles], ["/explore", "AI Explore (Live Browser)", MonitorPlay],
  ["/test-cases", "Test Cases", ListChecks], ["/executions", "Test Execution", Play],
  ["/reports", "Reports", BarChart3], ["/integrations", "Integrations", Plug], ["/settings", "Settings", Settings],
] as const;

type Me = { email: string; memberships: { role: string; organizations: { name: string; plan: string } }[] };

export default function Shell() {
  const { pathname } = useLocation();
  const me = useQuery({ queryKey: ["me"], queryFn: () => api<Me>("/me") });
  if (me.isLoading) return null;
  if (me.error) return <p role="alert" className="p-8 text-bad">{(me.error as Error).message}. Is the backend running?</p>;
  if (me.data && me.data.memberships.length === 0) return <Navigate to="/onboarding" replace />;
  const org = me.data?.memberships[0]?.organizations;
  const crumb = nav.find(n => pathname.startsWith(n[0]))?.[1] ?? "";
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-side p-4 md:block">
        <div className="mb-6 px-2 text-lg font-bold">TestPilot AI</div>
        <nav className="space-y-1">{nav.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-brand/20 text-ink ring-1 ring-brand/50" : "text-mute hover:text-ink"}`}>
            <Icon size={16} />{label}</NavLink>))}</nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-white/10 px-6 py-3 text-sm">
          <span className="text-mute">{org?.name} / <span className="text-ink">{crumb}</span></span>
          <div className="relative ml-auto hidden sm:block"><Search size={14} className="absolute left-3 top-2.5 text-mute" />
            <input aria-label="Search" disabled title="Search arrives with test cases (Phase 3)" placeholder="Search" className="input w-56 pl-8" /></div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-mute">{org?.plan} plan</span>
          <Bell size={16} className="text-mute" aria-label="Notifications" />
          <span className="hidden text-mute lg:inline">{me.data?.email}</span>
          <button className="btn-ghost" onClick={() => supabase.auth.signOut()}><LogOut size={14} />Sign out</button>
        </header>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>);
}
