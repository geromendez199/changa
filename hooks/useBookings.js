import { useCallback, useEffect, useState } from 'react';
import { getBookingsByChangarin, getBookingsByCliente } from '../lib/bookings';
export function useBookings(userId, role) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!userId || !role) return;
    setLoading(true);
    try { setBookings(role === 'cliente' ? await getBookingsByCliente(userId) : await getBookingsByChangarin(userId)); } finally { setLoading(false); }
  }, [userId, role]);
  useEffect(() => { refresh(); }, [refresh]);
  return { bookings, loading, refresh };
}
