import { useCallback, useEffect, useState } from 'react';
import * as api from '../lib/services';
export function useServices(changarinId) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!changarinId) return;
    setLoading(true);
    try { setServices(await api.getServicesByChangarin(changarinId)); } finally { setLoading(false); }
  }, [changarinId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { services, loading, refresh, ...api };
}
