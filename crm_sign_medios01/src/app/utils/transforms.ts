// Transforms Utilities
// Funciones de transformación de datos reutilizables

export function groupBy<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T
): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function flatten<T>(items: Array<T | T[]>): T[] {
  return items.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return acc.concat(flatten(item));
    }
    return acc.concat(item);
  }, [] as T[]);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function normalizeData<T extends Record<string, unknown>>(data: T): T {
  return Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value.trim() as never;
      } else {
        acc[key] = value as never;
      }
      return acc;
    },
    {} as T
  );
}

export function denormalizeData<T extends Record<string, unknown>>(data: T): T {
  return { ...data };
}

export function filterBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

export function searchIn<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  searchFields: Array<keyof T>
): T[] {
  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) =>
      String(item[field]).toLowerCase().includes(lowerQuery)
    )
  );
}

export function removeDuplicates<T>(
  items: T[],
  getKey: (item: T) => string | number = (item) => String(item)
): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
