import React, { useMemo, useCallback } from 'react';

// Debounce hook for search inputs
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized filter function
export const useFilteredData = <T>(
  data: T[],
  searchQuery: string,
  filterFn: (item: T, query: string) => boolean
) => {
  return useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter(item => filterFn(item, searchQuery.toLowerCase()));
  }, [data, searchQuery, filterFn]);
};

// Optimized list rendering
export const usePaginatedData = <T>(data: T[], pageSize: number = 20) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const paginatedData = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);
  
  const hasMore = currentPage * pageSize < data.length;
  
  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);
  
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  return { paginatedData, hasMore, loadMore, reset };
};

// Image optimization
export const getOptimizedImageUrl = (url: string, width: number, height: number) => {
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&h=${height}&fit=crop&crop=faces`;
  }
  return url;
};

// Cache management
export const createCache = <T>() => {
  const cache = new Map<string, { data: T; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  const get = (key: string): T | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  };
  
  const set = (key: string, data: T) => {
    cache.set(key, { data, timestamp: Date.now() });
  };
  
  const clear = () => {
    cache.clear();
  };
  
  return { get, set, clear };
};