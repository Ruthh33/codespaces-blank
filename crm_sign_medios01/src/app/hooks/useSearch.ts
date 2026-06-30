import { useState, useEffect, useCallback } from 'react';

interface UseSearchOptions<T> {
  data: T[];
  searchFields: Array<keyof T>;
  debounceMs?: number;
  onSearch?: (results: T[]) => void;
}

/**
 * useSearch Hook
 * Búsqueda con debounce y filtrado de resultados
 */
export function useSearch<T extends Record<string, any>>({
  data,
  searchFields,
  debounceMs = 300,
  onSearch,
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(data);

  const filterData = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        return data;
      }

      const lowerQuery = searchQuery.toLowerCase();
      return data.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(lowerQuery)
        )
      );
    },
    [data, searchFields]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const filteredResults = filterData(query);
      setResults(filteredResults);
      if (onSearch) {
        onSearch(filteredResults);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs, filterData, onSearch]);

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults(data);
  }, [data]);

  return {
    query,
    setQuery,
    results,
    resetSearch,
  };
}
