import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BUILTIN_ABHANGAS } from '../data/abhangas';
import { DNYANDEV_ABHANGAS } from '../data/dnyandev_abhangas';
import { SAINTS } from '../constants/saints';
import type { Abhang } from '../types';

const PAGE_SIZE = 25;

export function useAbhangas(userAbhangas: Abhang[]) {
  const [query, setQueryRaw] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSaints, setSelectedSaints] = useState<Set<string>>(
    new Set(SAINTS),
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce query
  const setQuery = useCallback((text: string) => {
    setQueryRaw(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text);
      setVisibleCount(PAGE_SIZE);
    }, 300);
  }, []);

  // Merged data
  const mergedAbhangas = useMemo(
    () => [...BUILTIN_ABHANGAS, ...DNYANDEV_ABHANGAS, ...userAbhangas],
    [userAbhangas],
  );

  // Pre-computed search index
  const searchIndex = useMemo(
    () =>
      mergedAbhangas.map(
        a => `${a.saint} ${a.title} ${a.content}`.toLowerCase(),
      ),
    [mergedAbhangas],
  );

  // Filtered results
  const filteredData = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return mergedAbhangas.filter((item, i) => {
      if (!selectedSaints.has(item.saint)) return false;
      if (q === '') return true;
      return searchIndex[i].includes(q);
    });
  }, [mergedAbhangas, searchIndex, debouncedQuery, selectedSaints]);

  // Reset pagination on filter/query change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredData]);

  const visibleItems = useMemo(
    () => filteredData.slice(0, visibleCount),
    [filteredData, visibleCount],
  );

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredData.length));
  }, [filteredData.length]);

  const toggleSaint = useCallback((saint: string) => {
    setSelectedSaints(prev => {
      const next = new Set(prev);
      if (next.has(saint)) {
        if (next.size > 1) next.delete(saint); // keep at least one
      } else {
        next.add(saint);
      }
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }, []);

  const selectAllSaints = useCallback(() => {
    setSelectedSaints(new Set(SAINTS));
    setVisibleCount(PAGE_SIZE);
  }, []);

  const getById = useCallback(
    (id: string): Abhang | undefined => mergedAbhangas.find(a => a.id === id),
    [mergedAbhangas],
  );

  return {
    query,
    setQuery,
    selectedSaints,
    toggleSaint,
    selectAllSaints,
    filteredData,
    visibleItems,
    loadMore,
    totalCount: mergedAbhangas.length,
    filteredCount: filteredData.length,
    hasMore: visibleCount < filteredData.length,
    mergedAbhangas,
    getById,
  };
}
