import {
  savePrepareCache,
  readPrepareCache,
} from './prepareCache';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'safesteps.token';

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// Identify the account associated with the current token
function getUserId(token) {
  try {
    if (!token) return null;

    const payload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const claims = JSON.parse(atob(payload));

    if (!claims.exp || claims.exp * 1000 <= Date.now()) {
      return null;
    }

    const cachedUser = JSON.parse(
      localStorage.getItem('safesteps.cachedUser') || 'null'
    );

    return cachedUser?.id === claims.id
      ? claims.id
      : null;
  } catch {
    return null;
  }
}

// Only these endpoints support offline caching
function getCacheType(path) {
  if (path === '/prepare') return 'summary';
  if (path === '/checklist') return 'checklist';

  return null;
}

// Update cached preparedness data after successful writes
function updateCachedPrepare(userId, path, data) {
  const cached = readPrepareCache(userId, 'summary');

  if (!cached) return;

  const updated = { ...cached.data };

  if (path === '/prepare/plan') {
    updated.plan = data.plan;
  }

  if (path === '/prepare/checklist') {
    updated.checkedItems = data.checkedItems;

    const checklist = readPrepareCache(
      userId,
      'checklist'
    );

    if (checklist) {
      const items = checklist.data.items ?? [];

      const publishedIds = new Set(
        items.map(item => item._id)
      );

      const checked = [
        ...new Set(updated.checkedItems),
      ].filter(id => publishedIds.has(id));

      updated.score = items.length
        ? Math.round(
            (checked.length / items.length) * 100
          )
        : 0;
    } else {
      updated.score = null;
    }
  }

  if (path.startsWith('/prepare/contacts')) {
    updated.contacts = data.contacts;
  }

  savePrepareCache(userId, 'summary', updated);
}

export async function api(
  path,
  { method = 'GET', body } = {}
) {
  const token = tokenStore.get();
  const userId = getUserId(token);
  const requestMethod = method.toUpperCase();
  const isRead = requestMethod === 'GET';

  const cacheType = isRead
    ? getCacheType(path)
    : null;

  function getCachedResponse() {
    if (
      !userId ||
      !cacheType ||
      tokenStore.get() !== token ||
      getUserId(token) !== userId
    ) {
      return null;
    }

    return readPrepareCache(userId, cacheType);
  }

  // Block write operations while offline
  if (!navigator.onLine && !isRead) {
    throw new ApiError(
      0,
      'Connect to the internet to make changes.'
    );
  }

  // Retrieve previously saved data while offline
  if (!navigator.onLine && cacheType) {
    const cached = getCachedResponse();

    if (cached) return cached.data;

    throw new ApiError(
      0,
      'No saved offline data is available yet.'
    );
  }

  let res;

  try {
    res = await fetch(BASE_URL + path, {
      method: requestMethod,
      cache: 'no-store',
      headers: {
        ...(body !== undefined && {
          'Content-Type': 'application/json',
        }),
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch {
    const cached = getCachedResponse();

    if (cached) return cached.data;

    throw new ApiError(
      0,
      "Can't reach SafeSteps. Check your internet and try again"
    );
  }

  // Ignore responses belonging to an ended session
  if (tokenStore.get() !== token) {
    throw new ApiError(
      401,
      'Your session has changed. Please try again.'
    );
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) {
      onUnauthorized();
    }

    throw new ApiError(
      res.status,
      data.error || 'Something went wrong. Try again',
      data.fields
    );
  }

  // Cache successful read requests
  if (userId && cacheType) {
    savePrepareCache(userId, cacheType, data);
  }

  // Refresh cached data after successful changes
  if (
    userId &&
    !isRead &&
    path.startsWith('/prepare/')
  ) {
    updateCachedPrepare(userId, path, data);
  }

  return data;
}