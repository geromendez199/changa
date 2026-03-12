import { useCallback, useEffect, useState } from 'react';
import { getReviewsByChangarin } from '../lib/reviews';
export function useReviews(changarinId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!changarinId) return;
    setLoading(true);
    try { setReviews(await getReviewsByChangarin(changarinId)); } finally { setLoading(false); }
  }, [changarinId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { reviews, loading, refresh };
}
