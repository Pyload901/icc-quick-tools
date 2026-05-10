/**
 * Custom hook for target matrix data.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useTargets() {
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTargets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/targets');
      setTargets(data);
    } catch (err) {
      console.error('Failed to fetch targets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  return { targets, loading, fetchTargets };
}
