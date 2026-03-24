import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    if (!user) {
      setCommunity(null);
      setCommunities([]);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/my-communities/');
      const list = Array.isArray(data) ? data : data.results || [];
      setCommunities(list);

      const storedId = localStorage.getItem('current_community_id');
      const found = list.find((c) => String(c.id) === storedId);
      if (found) {
        setCommunity(found);
      } else if (list.length > 0) {
        setCommunity(list[0]);
        localStorage.setItem('current_community_id', String(list[0].id));
      }
    } catch {
      setCommunity(null);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const switchCommunity = useCallback((id) => {
    const found = communities.find((c) => String(c.id) === String(id));
    if (found) {
      setCommunity(found);
      localStorage.setItem('current_community_id', String(found.id));
    }
  }, [communities]);

  const value = useMemo(() => ({
    community, communities, loading, switchCommunity, refetch: fetchCommunities,
  }), [community, communities, loading, switchCommunity, fetchCommunities]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}

export default CommunityContext;
