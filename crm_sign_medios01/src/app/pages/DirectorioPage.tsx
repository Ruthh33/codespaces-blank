import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";

export function DirectorioPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar selectedNode="directorio" onSelectNode={() => {}} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-slate-800">Directorio</h1>
          </div>

          {/* Empty state */}
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-slate-500">Esta sección está vacía</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
