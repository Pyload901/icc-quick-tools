/**
 * Custom hook for Flag IDs intelligence data.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

export function useFlagIds() {
  const [flagIds, setFlagIds] = useState({ items: [], total: 0, page: 1, page_size: 50 });
  const [availableServices, setAvailableServices] = useState([]);
  const [fetcherStatus, setFetcherStatus] = useState({ running: false });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ service: '', team_id: '', round: '' });
  const [page, setPage] = useState(1);
  const autoRefreshRef = useRef(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchFlagIds = useCallback(async (currentPage = 1, currentFilters = {}) => {
    try {
      setLoading(true);
      const params = { page: currentPage, page_size: 50 };
      if (currentFilters.service) params.service = currentFilters.service;
      if (currentFilters.team_id) params.team_id = currentFilters.team_id;
      if (currentFilters.round) params.round = currentFilters.round;
      const { data } = await api.get('/flagids', { params });
      setFlagIds(data);
    } catch (err) {
      console.error('Failed to fetch flag IDs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const { data } = await api.get('/flagids/services');
      setAvailableServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/flagids/fetcher/status');
      setFetcherStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  }, []);

  const startFetcher = useCallback(async () => {
    const { data } = await api.post('/flagids/fetcher/start');
    setFetcherStatus(data);
  }, []);

  const stopFetcher = useCallback(async () => {
    const { data } = await api.post('/flagids/fetcher/stop');
    setFetcherStatus(data);
  }, []);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchFlagIds(1, newFilters);
  }, [fetchFlagIds]);

  const changePage = useCallback((newPage) => {
    setPage(newPage);
    fetchFlagIds(newPage, filters);
  }, [fetchFlagIds, filters]);

  // Auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        fetchFlagIds(page, filters);
        fetchStatus();
      }, 30000);
    } else {
      clearInterval(autoRefreshRef.current);
    }
    return () => clearInterval(autoRefreshRef.current);
  }, [autoRefresh, page, filters, fetchFlagIds, fetchStatus]);

  useEffect(() => {
    fetchFlagIds(1, filters);
    fetchServices();
    fetchStatus();
  }, [fetchFlagIds, fetchServices, fetchStatus]);

  return {
    flagIds,
    availableServices,
    fetcherStatus,
    loading,
    filters,
    page,
    autoRefresh,
    setAutoRefresh,
    applyFilters,
    changePage,
    startFetcher,
    stopFetcher,
    fetchFlagIds: () => fetchFlagIds(page, filters),
    fetchStatus,
  };
}
