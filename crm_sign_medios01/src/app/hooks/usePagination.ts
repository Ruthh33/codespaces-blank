import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

/**
 * usePagination Hook
 * Lógica de paginación (página actual, tamaño de página, navegación)
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  pageSize = 10,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );

  const goTo = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const next = useCallback(() => {
    goTo(currentPage + 1);
  }, [currentPage, goTo]);

  const prev = useCallback(() => {
    goTo(currentPage - 1);
  }, [currentPage, goTo]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    next,
    prev,
    goTo,
    canNext: currentPage < totalPages,
    canPrev: currentPage > 1,
  };
}
