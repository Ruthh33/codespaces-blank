import { useState, useCallback } from 'react';

/**
 * useModal Hook
 * Control de visibilidad de modales
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * useMultipleModals Hook
 * Gestión de múltiples estados de modales en un solo objeto
 */
export function useMultipleModals<T extends string>(modalNames: T[]) {
  const [modals, setModals] = useState(
    modalNames.reduce((acc, name) => {
      acc[name] = false;
      return acc;
    }, {} as Record<T, boolean>)
  );

  const open = useCallback((name: T) => {
    setModals((prev) => ({ ...prev, [name]: true }));
  }, []);

  const close = useCallback((name: T) => {
    setModals((prev) => ({ ...prev, [name]: false }));
  }, []);

  const toggle = useCallback((name: T) => {
    setModals((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const isAnyOpen = Object.values(modals).some(Boolean);

  return {
    modals,
    open,
    close,
    toggle,
    isAnyOpen,
  };
}
