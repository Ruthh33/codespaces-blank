// CSV Utilities
// Utilidades para generación y parseo de CSV

export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: Array<keyof T>
): string {
  const headers = columns.join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col];
        const stringValue = String(value ?? '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [headers, ...rows].join('\n');
}

export function rowsToCSV(rows: Array<Array<string | number>>): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
}

export function addBOM(csv: string): string {
  return '﻿' + csv;
}

export function createCSVWithBOM(rows: Array<Array<string | number>>): string {
  const csv = rowsToCSV(rows);
  return addBOM(csv);
}
