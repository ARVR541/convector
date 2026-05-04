const isBrowser = typeof window !== "undefined"

export const readStorage = (key, fallbackValue) => {
  if (!isBrowser) {
    return fallbackValue
  }

  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return fallbackValue
  }

  try {
    return JSON.parse(raw)
  } catch {
    return fallbackValue
  }
}

export const writeStorage = (key, value) => {
  if (!isBrowser) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export const removeStorage = (key) => {
  if (!isBrowser) {
    return
  }

  window.localStorage.removeItem(key)
}
