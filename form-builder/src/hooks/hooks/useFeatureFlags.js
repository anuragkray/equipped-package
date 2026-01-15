import { useMemo } from 'react';
import { getUserData } from '../services/api';

/**
 * Cache implementation using Map (Hash Table)
 */
class FeatureFlagCache {
  constructor() {
    this.cache = new Map(); 
    this.cacheDuration = 5000;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.cacheDuration;

    if (isExpired) {
      this.cache.delete(key); 
      return null;
    }

    return cached.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}
const featureFlagCache = new FeatureFlagCache();

/**
 * Get feature flags with caching
 * Time Complexity: O(1) for cache hit, O(n) for cache miss
 * Space Complexity: O(1) - single cache entry
 */
const getFeatureFlagsWithCache = () => {
  const CACHE_KEY = 'feature_flags';
  const cached = featureFlagCache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }

  const userData = getUserData();
  const hasAccess = userData?.form === true;

  const flags = Object.freeze({
    hasAccess,
  });

  // Store in cache (O(1) insertion)
  featureFlagCache.set(CACHE_KEY, flags);

  return flags;
};

/**
 * Custom hook for feature flag management
 * 
 * Optimizations:
 * 1. useMemo - React memoization
 * 2. Map (Hash Table) - O(1) cache lookups
 * 3. Object.freeze() - Immutability
 * 4. TTL (Time To Live) - Cache expiration
 */
export const useFeatureFlags = () => {

  const featureFlags = useMemo(() => {
    return getFeatureFlagsWithCache();
  }, []); 

  return featureFlags;
};

export const clearFeatureFlagCache = () => {
  featureFlagCache.clear();
};
