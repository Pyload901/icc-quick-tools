/**
 * Custom hook for game configuration state management.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async (full = false) => {
    try {
      setLoading(true);
      const endpoint = full ? '/config/full' : '/config';
      const { data } = await api.get(endpoint);
      setConfig(data);
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (updates) => {
    try {
      const { data } = await api.put('/config', updates);
      setConfig(data);
      return data;
    } catch (err) {
      console.error('Failed to update config:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, fetchConfig, updateConfig };
}
