import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import * as api from '../lib/services';

const PAGE_SIZE = 10;

export function useServices(changarinId) {
  const query = useInfiniteQuery({
    queryKey: ['services', changarinId],
    queryFn: async ({ pageParam = 0 }) => {
      let q = supabase
        .from('services')
        .select('*, profiles:changarin_id(full_name, avatar_url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (changarinId) {
        q = q.eq('changarin_id', changarinId);
      }

      const { data, error } = await q;
      if (error) throw error;
      
      // Map changarin_id to worker_id for app/index.jsx compatibility
      const mappedData = (data || []).map(s => ({
        ...s,
        worker_id: s.changarin_id
      }));

      return {
        data: mappedData,
        nextPage: data?.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  return {
    data: query.data,
    services: query.data?.pages.flatMap(page => page.data) || [],
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refresh: query.refetch,
    refetch: query.refetch,
    ...api
  };
}

