/**
 * Custom hook for vulnbox management.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

export function useVulnboxes() {
  const [vulnboxes, setVulnboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState({});
  const [scanningRepos, setScanningRepos] = useState({});
  const [reposByVulnbox, setReposByVulnbox] = useState({});

  const fetchVulnboxes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vulnboxes');
      setVulnboxes(data);
    } catch (err) {
      console.error('Failed to fetch vulnboxes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const discoverServices = useCallback(async (vulnboxId) => {
    try {
      setDiscovering((prev) => ({ ...prev, [vulnboxId]: true }));
      const { data } = await api.post(`/vulnboxes/${vulnboxId}/discover`);
      toast.success(`Found ${data.length} service(s) on vulnbox ${vulnboxId}`);
      await fetchVulnboxes();
      return data;
    } catch (err) {
      console.error(`Discovery failed for vulnbox ${vulnboxId}:`, err);
      throw err;
    } finally {
      setDiscovering((prev) => ({ ...prev, [vulnboxId]: false }));
    }
  }, [fetchVulnboxes]);

  const addManualService = useCallback(async (service) => {
    const { data } = await api.post('/vulnboxes/services', service);
    toast.success(`Service "${data.name}" added`);
    await fetchVulnboxes();
    return data;
  }, [fetchVulnboxes]);

  const deleteService = useCallback(async (serviceId) => {
    await api.delete(`/vulnboxes/services/${serviceId}`);
    toast.success('Service removed');
    await fetchVulnboxes();
  }, [fetchVulnboxes]);

  const downloadArtifacts = useCallback(async (vulnboxId) => {
    try {
      const response = await api.get(`/vulnboxes/${vulnboxId}/artifacts`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vulnbox_${vulnboxId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Artifacts downloaded');
    } catch (err) {
      console.error(`Artifact download failed for vulnbox ${vulnboxId}:`, err);
    }
  }, []);

  const scanRepos = useCallback(async (vulnboxId) => {
    try {
      setScanningRepos((prev) => ({ ...prev, [vulnboxId]: true }));
      const { data } = await api.get(`/vulnboxes/${vulnboxId}/repos`);
      setReposByVulnbox((prev) => ({ ...prev, [vulnboxId]: data }));
      toast.success(`Found ${data.length} repo(s) on vulnbox ${vulnboxId}`);
      return data;
    } catch (err) {
      console.error(`Repo scan failed for vulnbox ${vulnboxId}:`, err);
      throw err;
    } finally {
      setScanningRepos((prev) => ({ ...prev, [vulnboxId]: false }));
    }
  }, []);

  useEffect(() => {
    fetchVulnboxes();
  }, [fetchVulnboxes]);

  return {
    vulnboxes,
    loading,
    discovering,
    scanningRepos,
    reposByVulnbox,
    fetchVulnboxes,
    discoverServices,
    addManualService,
    deleteService,
    downloadArtifacts,
    scanRepos,
  };
}
