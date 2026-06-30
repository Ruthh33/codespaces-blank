// Download Utilities
// Funciones de descarga reutilizables (extraído de SettingsPage)

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function downloadCSV(rows: string[][], filename: string): void {
  const csv = rows
    .map((r) =>
      r
        .map((c) => `"${String(c).replace(/"/g, '""')}"`) 
        .join(',')
    )
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function downloadZip(blob: Blob, filename: string): void {
  downloadBlob(blob, filename);
}
