export const ONE_HOUR_MS = 60 * 60 * 1000

interface CacheEntry<T> {
  value: T
  cachedAt: number
  expiresAt: number
}

export class TtlCache<K, V> {
  private readonly storage = new Map<K, CacheEntry<V>>()

  set(key: K, value: V, ttlMs: number = ONE_HOUR_MS): void {
    const now = Date.now()

    this.storage.set(key, {
      value,
      cachedAt: now,
      expiresAt: now + ttlMs
    })
  }

  getFresh(key: K): V | null {
    const entry = this.storage.get(key)

    if (!entry) {
      return null
    }

    return Date.now() < entry.expiresAt ? entry.value : null
  }

  getStale(key: K): V | null {
    return this.storage.get(key)?.value ?? null
  }

  isFresh(key: K): boolean {
    const entry = this.storage.get(key)

    if (!entry) {
      return false
    }

    return Date.now() < entry.expiresAt
  }

  clear(key?: K): void {
    if (key === undefined) {
      this.storage.clear()
      return
    }

    this.storage.delete(key)
  }
}
