import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// { user, token, ready, loggedOut, login(), signup(), logout(), setUser() }
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
