import { createContext, useContext, type ReactNode } from 'react';

type AuthContextValue = {
  onUnauthorized: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  onUnauthorized,
  children,
}: {
  onUnauthorized: () => void;
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ onUnauthorized }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
