import { useState, useEffect, useMemo } from 'react';

interface UseSearchOptions<T> {
  data: T[];
  searchKeys: Array<keyof T>;
  debounceMs?: number;
  onSearch?: (results: T[]) => void;
}

/**
 * useSearch Hook
 * Búsqueda y filtrado de resultados
 */
export function useSearch<T extends Record<string, any>>({
  data,
  searchKeys,
  debounceMs = 300,
  onSearch,
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) {
      return data;
    }

    const lowerQuery = query.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((field) =>
        String(item[field]).toLowerCase().includes(lowerQuery)
      )
    );
  }, [data, query, searchKeys]);

  useEffect(() => {
    if (onSearch) {
      const handler = setTimeout(() => {
        onSearch(results);
      }, debounceMs);
      return () => clearTimeout(handler);
    }
  }, [results, debounceMs, onSearch]);

  const resetSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    results,
    resetSearch,
  };
}
