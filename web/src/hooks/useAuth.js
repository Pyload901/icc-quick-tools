/**
 * useAuth — manages panel authentication state.
 *
 * Flow:
 *  1. On mount → GET /api/auth/status
 *     - not configured → show onboarding (setup code)
 *     - configured + valid token in localStorage → show app
 *     - configured + no/expired token → show login
 *  2. setup(code)  → POST /api/auth/setup
 *  3. login(code)  → POST /api/auth/verify
 *  4. logout()     → clear token
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { tokenStorage } from '../api/client';

// Use a bare axios instance for auth calls — no token needed
const authApi = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

export function useAuth() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'onboarding' | 'login' | 'authenticated'

  const checkStatus = useCallback(async () => {
    try {
      const { data } = await authApi.get('/auth/status');
      if (!data.configured) {
        setStatus('onboarding');
        return;
      }
      // Has a token? Treat as authenticated — backend will reject if expired
      const token = tokenStorage.get();
      setStatus(token ? 'authenticated' : 'login');
    } catch {
      setStatus('login');
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Listen for token expiry events fired by the axios response interceptor
    const handleExpired = () => {
      toast.error('Session expired. Please log in again.');
      setStatus('login');
    };
    window.addEventListener('ctf:auth:expired', handleExpired);
    return () => window.removeEventListener('ctf:auth:expired', handleExpired);
  }, [checkStatus]);

  const setup = useCallback(async (code) => {
    const { data } = await authApi.post('/auth/setup', { code });
    tokenStorage.set(data.token);
    toast.success('Access code set! Welcome to the panel.');
    setStatus('authenticated');
  }, []);

  const login = useCallback(async (code) => {
    const { data } = await authApi.post('/auth/verify', { code });
    tokenStorage.set(data.token);
    toast.success('Access granted.');
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setStatus('login');
    toast('Logged out.', { icon: '👋' });
  }, []);

  return { status, setup, login, logout };
}
