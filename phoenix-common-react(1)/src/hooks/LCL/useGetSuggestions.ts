import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '../../core/api/client';

interface UseGetSuggestionsProps<TRequest, TResponse> {
  endpoint: string;
  minChars?: number;
  debounceMs?: number;
  transformRequest?: (query: string) => TRequest;
  transformResponse?: (data: any) => TResponse[];
  initialQuery?: string;

}

/**
 * A reusable hook to fetch suggestions from an API as the user types.
 * Supports debouncing, minimum character threshold, and custom request/response mapping.
 */
export const useGetSuggestions = <TRequest = any, TResponse = any>({
  endpoint,
  minChars = 3,
  debounceMs = 500,
  transformRequest,
  transformResponse = (data) => data,
  initialQuery = '',
}: UseGetSuggestionsProps<TRequest, TResponse>) => {
  const [data, setData] = useState<TResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedQueryRef = useRef<string | null>(null);
  const transformRequestRef = useRef(transformRequest);
  const transformResponseRef = useRef(transformResponse);

  // Update refs when functions change (without triggering effect)
  useEffect(() => {
    transformRequestRef.current = transformRequest;
    transformResponseRef.current = transformResponse;
  }, [transformRequest, transformResponse]);

  const fetchData = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minChars) {
        setData((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      // Avoid redundant fetches if query hasn't changed
      if (searchQuery === lastFetchedQueryRef.current) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Prepare the payload (custom transformation or default { query })
        const payload = transformRequestRef.current 
          ? transformRequestRef.current(searchQuery) 
          : { query: searchQuery };
        
        // Call the API
        const response = await ApiService.post(endpoint, payload);
        
        // Handle response transformation
        const transformedData = transformResponseRef.current(response.data);
        setData(transformedData);
        lastFetchedQueryRef.current = searchQuery;
      } catch (err: any) {
        console.error('Error fetching suggestions:', err);
        setError(err.message || 'Failed to fetch suggestions');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, minChars]
  );


  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debouncing
    if (query) {
      timeoutRef.current = setTimeout(() => {
        fetchData(query);
      }, debounceMs);
    } else {
      setData((prev) => (prev.length === 0 ? prev : []));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs, fetchData]);

  return {
    data,
    loading,
    error,
    query,
    setQuery    
  };
};
