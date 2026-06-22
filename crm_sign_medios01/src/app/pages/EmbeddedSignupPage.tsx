import EmbeddedSignupPanel from "../components/admin/EmbeddedSignupPanel";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";

export function EmbeddedSignupPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar selectedNode="embedded-signup" onSelectNode={() => {}} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          <EmbeddedSignupPanel />
        </main>
      </div>
    </div>
  );
}
