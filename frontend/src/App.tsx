import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/api";
import Shell from "./layouts/Shell";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (session === undefined) return null;
  if (!session) return <Login />;
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Shell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/generate" element={<ComingSoon title="Generate Test Cases" phase={2} />} />
        <Route path="/explore" element={<ComingSoon title="AI Explore (Live Browser)" phase={4} />} />
        <Route path="/test-cases" element={<ComingSoon title="Test Cases" phase={3} />} />
        <Route path="/executions" element={<ComingSoon title="Test Execution" phase={5} />} />
        <Route path="/reports" element={<ComingSoon title="Reports" phase={6} />} />
        <Route path="/integrations" element={<ComingSoon title="Integrations" phase={6} />} />
        <Route path="/settings" element={<ComingSoon title="Settings" phase={6} />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
