import { useState } from 'react';

/**
 * Hook para atrapar errores asíncronos en el ErrorBoundary de React.
 * Los Error Boundaries no atrapan errores en promesas (onClick, fetch, etc.).
 * Usando este hook, forzamos un re-render que arroja el error para que el boundary lo atrape.
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) {
    throw error;
  }
  
  return setError;
}
