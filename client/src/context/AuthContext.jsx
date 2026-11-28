import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  api,
  setUnauthorizedHandler,
  tokenStore,
} from '../api/api';

import { clearPrepareCache } from '../api/prepareCache';
import { AuthContext } from './useAuth';

const USER_KEY = 'safesteps.cachedUser';

function cacheUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable
  }
}

function readCachedUser(token) {
  try {
    if (!token) return null;

    const payload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const claims = JSON.parse(atob(payload));

    // Do not restore an expired session
    if (!claims.exp || claims.exp * 1000 <= Date.now()) {
      return null;
    }

    const user = JSON.parse(
      localStorage.getItem(USER_KEY) || 'null'
    );

    // Ensure the cached account matches the saved token
    if (!user || user.id !== claims.id) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

function clearCachedUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Storage unavailable
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get());
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(() => !tokenStore.get());
  const [loggedOut, setLoggedOut] = useState(false);
  const [offlineSession, setOfflineSession] = useState(false);

  const endSession = useCallback(() => {
    tokenStore.clear();
    clearCachedUser();
    clearPrepareCache();

    setToken(null);
    setUser(null);
    setOfflineSession(false);
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    setLoggedOut(true);
    endSession();
  }, [endSession]);

  useEffect(() => {
    setUnauthorizedHandler(endSession);

    return () => setUnauthorizedHandler(() => {});
  }, [endSession]);

  // Verify saved sessions and revalidate after reconnecting
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let requestId = 0;

    async function verifySession() {
      const currentRequest = ++requestId;

      try {
        const data = await api('/auth/me');

        if (cancelled || currentRequest !== requestId) return;

        setUser(data.user);
        cacheUser(data.user);
        setOfflineSession(false);
      } catch (err) {
        if (cancelled || currentRequest !== requestId) return;

        if (err.status === 0) {
          const cachedUser = readCachedUser(token);

          if (cachedUser) {
            setUser(cachedUser);
            setOfflineSession(true);
          } else {
            setUser(null);
            setOfflineSession(false);
          }
        } else if (err.status === 401 || err.status === 403) {
          endSession();
        } else {
          setUser(null);
          setOfflineSession(false);
        }
      } finally {
        if (!cancelled && currentRequest === requestId) {
          setReady(true);
        }
      }
    }

    verifySession();

    window.addEventListener('online', verifySession);

    return () => {
      cancelled = true;
      window.removeEventListener('online', verifySession);
    };
  }, [token, endSession]);

  const startSession = useCallback((data) => {
    clearPrepareCache();
    clearCachedUser();

    tokenStore.set(data.token);
    cacheUser(data.user);

    setToken(data.token);
    setUser(data.user);
    setReady(true);
    setLoggedOut(false);
    setOfflineSession(false);

    return data.user;
  }, []);

  const login = useCallback(
    async (email, password) =>
      startSession(
        await api('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
      ),
    [startSession]
  );

  const signup = useCallback(
    async (name, email, password) =>
      startSession(
        await api('/auth/signup', {
          method: 'POST',
          body: { name, email, password },
        })
      ),
    [startSession]
  );

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);

    if (updatedUser) {
      cacheUser(updatedUser);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      loggedOut,
      offlineSession,
      login,
      signup,
      logout,
      setUser: updateUser,
    }),
    [
      user,
      token,
      ready,
      loggedOut,
      offlineSession,
      login,
      signup,
      logout,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}