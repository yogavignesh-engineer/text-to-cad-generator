/**
 * Performance Utilities
 * Optimization helpers for React components
 * Phase 8: Polish - Performance Optimization
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook - delays execution until user stops typing
 */
export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Throttle hook - limits execution frequency
 */
export function useThrottle(callback, delay = 100) {
    const lastRun = useRef(Date.now());

    return useCallback((...args) => {
        const now = Date.now();
        if (now - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = now;
        }
    }, [callback, delay]);
}

/**
 * Lazy import with retry
 */
export function lazyWithRetry(componentImport) {
    return lazy(() =>
        componentImport().catch((error) => {
            console.error('Lazy load failed, retrying...', error);
            return componentImport();
        })
    );
}

/**
 * Virtual scrolling helper for large lists
 */
export function useVirtualScroll(items, itemHeight, containerHeight) {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    const visibleItems = items.slice(visibleStart, visibleEnd);
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleStart * itemHeight;

    return {
        visibleItems,
        totalHeight,
        offsetY,
        onScroll: (e) => setScrollTop(e.target.scrollTop)
    };
}

/**
 * Image lazy loading
 */
export function useLazyImage(src) {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
        };
        img.onerror = () => {
            setIsLoading(false);
        };
    }, [src]);

    return { imageSrc, isLoading };
}

/**
 * Performance monitor (for development)
 */
export class PerformanceMonitor {
    static marks = {};

    static start(label) {
        this.marks[label] = performance.now();
    }

    static end(label) {
        const start = this.marks[label];
        if (!start) {
            console.warn(`No start mark for "${label}"`);
            return 0;
        }

        const duration = performance.now() - start;
        delete this.marks[label];

        if (duration > 100) {
            console.warn(`⚠️ Slow operation "${label}": ${duration.toFixed(2)}ms`);
        } else {
            console.log(`✓ "${label}": ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    static measure(label, callback) {
        this.start(label);
        const result = callback();
        this.end(label);
        return result;
    }

    static async measureAsync(label, callback) {
        this.start(label);
        const result = await callback();
        this.end(label);
        return result;
    }
}

/**
 * Component render counter (for debugging)
 */
export function useRenderCount(componentName) {
    const renders = useRef(0);

    useEffect(() => {
        renders.current += 1;
        console.log(`${componentName} rendered ${renders.current} times`);
    });

    return renders.current;
}

/**
 * Optimize heavy computations with memoization
 */
export function memoize(fn) {
    const cache = new Map();

    return (...args) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);

        // Limit cache size
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    };
}

/**
 * Cancel pending async operations on unmount
 */
export function useCancelablePromise() {
    const pendingPromises = useRef([]);

    const appendPendingPromise = (promise) => {
        pendingPromises.current.push(promise);
    };

    const removePendingPromise = (promise) => {
        pendingPromises.current = pendingPromises.current.filter(p => p !== promise);
    };

    const clearPendingPromises = () => {
        pendingPromises.current = [];
    };

    useEffect(() => {
        return () => {
            // Cancel all pending promises on unmount
            pendingPromises.current.forEach(promise => {
                if (promise.cancel) {
                    promise.cancel();
                }
            });
        };
    }, []);

    return {
        appendPendingPromise,
        removePendingPromise,
        clearPendingPromises
    };
}

/**
 * Bundle size analyzer (run in production build)
 */
export function analyzeBundleSize() {
    if (process.env.NODE_ENV !== 'production') return;

    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
        fetch(script.src, { method: 'HEAD' })
            .then(response => {
                const size = parseInt(response.headers.get('content-length'), 10);
                totalSize += size;
                console.log(`${script.src}: ${(size / 1024).toFixed(2)} KB`);
            });
    });

    setTimeout(() => {
        console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }, 2000);
}

export default {
    useDebounce,
    useThrottle,
    lazyWithRetry,
    useVirtualScroll,
    useLazyImage,
    PerformanceMonitor,
    useRenderCount,
    memoize,
    useCancelablePromise,
    analyzeBundleSize
};
