/**
 * Custom hook for tools CRUD operations.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

export function useTools() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tools');
      setTools(data);
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTool = useCallback(async (tool) => {
    const { data } = await api.post('/tools', tool);
    setTools((prev) => [data, ...prev]);
    toast.success(`Tool "${data.name}" created`);
    return data;
  }, []);

  const updateTool = useCallback(async (id, updates) => {
    const { data } = await api.put(`/tools/${id}`, updates);
    setTools((prev) => prev.map((t) => (t.id === id ? data : t)));
    toast.success(`Tool "${data.name}" updated`);
    return data;
  }, []);

  const deleteTool = useCallback(async (id) => {
    await api.delete(`/tools/${id}`);
    setTools((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tool deleted');
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return { tools, loading, fetchTools, createTool, updateTool, deleteTool };
}
