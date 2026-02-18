"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtlCache = exports.ONE_HOUR_MS = void 0;
exports.ONE_HOUR_MS = 60 * 60 * 1000;
class TtlCache {
    constructor() {
        this.storage = new Map();
    }
    set(key, value, ttlMs = exports.ONE_HOUR_MS) {
        const now = Date.now();
        this.storage.set(key, {
            value,
            cachedAt: now,
            expiresAt: now + ttlMs
        });
    }
    getFresh(key) {
        const entry = this.storage.get(key);
        if (!entry) {
            return null;
        }
        return Date.now() < entry.expiresAt ? entry.value : null;
    }
    getStale(key) {
        return this.storage.get(key)?.value ?? null;
    }
    isFresh(key) {
        const entry = this.storage.get(key);
        if (!entry) {
            return false;
        }
        return Date.now() < entry.expiresAt;
    }
    clear(key) {
        if (key === undefined) {
            this.storage.clear();
            return;
        }
        this.storage.delete(key);
    }
}
exports.TtlCache = TtlCache;
