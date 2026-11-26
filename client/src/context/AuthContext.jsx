import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api/api';
import { AuthContext } from './useAuth';

// Provides { user, token, ready, loggedOut, login(), signup(), logout(), setUser() }.
// `ready` is false until a saved token has been checked with the server.
// `loggedOut` is true after the person chose Log out, so guarded screens send
// them Home instead of to Login (an expired session still goes to Login).
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get());
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(() => !tokenStore.get());
  const [loggedOut, setLoggedOut] = useState(false);

  const endSession = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    setLoggedOut(true);
    endSession();
  }, [endSession]);

  useEffect(() => setUnauthorizedHandler(endSession), [endSession]);

  useEffect(() => {
    if (!token || user) return;
    let cancelled = false;
    api('/auth/me')
      .then((data) => !cancelled && setUser(data.user))
      .catch((err) => {
        // Offline or server down: keep the token and try again next load.
        if (!cancelled && err.status) endSession();
      })
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [token, user, endSession]);

  const startSession = useCallback((data) => {
    tokenStore.set(data.token);
    setToken(data.token);
    setUser(data.user);
    setReady(true);
    setLoggedOut(false);
    return data.user;
  }, []);

  const login = useCallback(
    async (email, password) => startSession(await api('/auth/login', { method: 'POST', body: { email, password } })),
    [startSession]
  );

  const signup = useCallback(
    async (name, email, password) =>
      startSession(await api('/auth/signup', { method: 'POST', body: { name, email, password } })),
    [startSession]
  );

  const value = useMemo(
    () => ({ user, token, ready, loggedOut, login, signup, logout, setUser }),
    [user, token, ready, loggedOut, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
