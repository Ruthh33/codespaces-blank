import React from "react";
import { Download, CheckCircle2, Loader2, FileText } from "lucide-react";

// Local type for status to match SettingsPage usage
export type BackupOperationStatus = "idle" | "running" | "done" | "error";

interface BackupCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  formats: ("zip" | "csv")[];
  status: BackupOperationStatus;
  onBackupZip?: () => void;
  onBackupCSV?: () => void;
  children?: React.ReactNode;
}

export function BackupCard({
  icon,
  title,
  description,
  formats,
  status,
  onBackupZip,
  onBackupCSV,
  children
}: BackupCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">{icon}</div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
        {status === "done" && <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />}
      </div>
      {children}
      <div className="flex flex-wrap gap-2">
        {formats.includes("zip") && onBackupZip && (
          <button
            onClick={onBackupZip}
            disabled={status === "running"}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "running" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Descargar ZIP
          </button>
        )}
        {formats.includes("csv") && onBackupCSV && (
          <button
            onClick={onBackupCSV}
            disabled={status === "running"}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60"
          >
            {status === "running" ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
            Descargar CSV
          </button>
        )}
      </div>
      {status === "done" && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 size={12} /> Respaldo generado correctamente
        </p>
      )}
    </div>
  );
}
