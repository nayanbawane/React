import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '../../core/api/client';

export interface MultiPanelSuggestionItem {
  inputCode: string;
  localInputCode: string | null;
  displayString: string;
  replacementString: string;
}

export interface MultiPanelSuggestionResult<TItem = Record<string, unknown>> {
  data:  TItem[];
  data1: TItem[];
  data2: TItem[];
}

interface UseGetMultiPanelSuggestionsConfig<TRequest, TItem> {
  endpoint: string;
  minChars?: number;
  debounceMs?: number;
  transformRequest: (query: string) => TRequest;
  transformItem: (item: MultiPanelSuggestionItem) => TItem;
}

const NEXT_LIST_MARKER = 'Next List';

function isEmptyMultiPanelResult<TItem>(r: MultiPanelSuggestionResult<TItem>): boolean {
  return r.data.length === 0 && r.data1.length === 0 && r.data2.length === 0;
}

function splitByNextList<TItem>(
  suggestions: MultiPanelSuggestionItem[],
  transformItem: (item: MultiPanelSuggestionItem) => TItem
): MultiPanelSuggestionResult<TItem> {
  const sections: TItem[][] = [[], [], []];
  let sectionIndex = 0;

  for (const item of suggestions) {
    if (item.displayString === NEXT_LIST_MARKER) {
      sectionIndex++;
      if (sectionIndex > 2) break;
      continue;
    }
    if (!item.displayString || !item.inputCode) continue;
    if (sectionIndex <= 2) {
      sections[sectionIndex].push(transformItem(item));
    }
  }

  return { data: sections[0], data1: sections[1], data2: sections[2] };
}

export const useGetMultiPanelSuggestions = <TRequest = unknown, TItem = Record<string, unknown>>({
  endpoint,
  minChars = 1,
  debounceMs = 300,
  transformRequest,
  transformItem,
}: UseGetMultiPanelSuggestionsConfig<TRequest, TItem>) => {
  const [result, setResult] = useState<MultiPanelSuggestionResult<TItem>>({ data: [], data1: [], data2: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [query, setQuery]     = useState('');

  const timeoutRef          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedQueryRef = useRef<string | null>(null);
  const transformRequestRef = useRef(transformRequest);
  const transformItemRef    = useRef(transformItem);

  useEffect(() => {
    transformRequestRef.current = transformRequest;
    transformItemRef.current    = transformItem;
  }, [transformRequest, transformItem]);

  const fetchData = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResult((prev) => (isEmptyMultiPanelResult(prev) ? prev : { data: [], data1: [], data2: [] }));
      return;
    }
    if (searchQuery === lastFetchedQueryRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const payload  = transformRequestRef.current(searchQuery);
      const response = await ApiService.post(endpoint, payload);

      const suggestions: MultiPanelSuggestionItem[] =
        response.data?.result?.suggestions ?? [];

      setResult(splitByNextList(suggestions, transformItemRef.current));
      lastFetchedQueryRef.current = searchQuery;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(message);
      setResult({ data: [], data1: [], data2: [] });
    } finally {
      setLoading(false);
    }
  }, [endpoint, minChars]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query) {
      timeoutRef.current = setTimeout(() => fetchData(query), debounceMs);
    } else {
      setResult((prev) => (isEmptyMultiPanelResult(prev) ? prev : { data: [], data1: [], data2: [] }));
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, debounceMs, fetchData]);

  return { result, loading, error, setQuery };
};
