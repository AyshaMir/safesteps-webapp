const CACHE_PREFIX = 'safesteps.prepare.'

function getKey(userId, type) {
  return `${CACHE_PREFIX}${userId}.${type}`
}

// Save data for a specific user
export function savePrepareCache(userId, type, data) {
  if (!userId) return

  try {
    localStorage.setItem(
      getKey(userId, type),
      JSON.stringify({
        data,
        updatedAt: Date.now(),
      })
    )
  } catch {
    // Storage may be unavailable or full
  }
}

// Retrieve previously saved data
export function readPrepareCache(userId, type) {
  if (!userId) return null

  try {
    const stored = localStorage.getItem(
      getKey(userId, type)
    )

    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Clear preparedness data on logout
export function clearPrepareCache() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)

      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // Storage may be unavailable
  }
}