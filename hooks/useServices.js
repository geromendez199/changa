import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 20;

export function useServices() {
  return useInfiniteQuery({
    queryKey: ['services'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('services')
        .select('*, profiles(full_name)')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }
      return { 
        data: data || [], 
        nextCursor: (data || []).length === PAGE_SIZE ? pageParam + 1 : undefined 
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
