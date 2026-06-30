// ZIP Utilities
// Wrapper alrededor de JSZip para crear y descargar archivos ZIP (extraído de SettingsPage)

import JSZip from 'jszip';
import { downloadBlob } from './download';

export async function createZip(
  files: Array<{
    path: string;
    content: string | Blob | ArrayBuffer | Uint8Array;
  }>,
  filename: string
): Promise<void> {
  const zip = new JSZip();
  files.forEach((file) => {
    zip.file(file.path, file.content);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, filename);
}

export function addFileToZip(
  zip: JSZip,
  path: string,
  content: string | Blob | ArrayBuffer | Uint8Array
): JSZip {
  return zip.file(path, content);
}

export function addJSONToZip(zip: JSZip, path: string, data: unknown): JSZip {
  const json = JSON.stringify(data, null, 2);
  return zip.file(path, json);
}

export function createFolderInZip(zip: JSZip, folderPath: string): JSZip {
  return zip.folder(folderPath);
}
