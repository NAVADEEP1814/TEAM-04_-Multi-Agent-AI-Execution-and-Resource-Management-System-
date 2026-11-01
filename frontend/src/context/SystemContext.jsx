import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const SystemContext = createContext();

export function SystemProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState({
    mode: 'SIMULATION MODE',
    is_live_linux: false,
    uptime: '00:00:00',
    active_agents: 4,
    total_processes: 4,
    cpu_usage: 42.8,
    memory_usage_gb: 3.2,
    total_memory_gb: 8.0,
    fifo_channels_count: 4,
    active_tasks_count: 0,
    security_alerts_count: 0,
    health: {
      backend_status: 'ONLINE',
      os_status: 'SIMULATED',
      database_status: 'ONLINE',
      agent_manager_status: 'ONLINE',
      fifo_manager_status: 'ONLINE',
      resource_monitor_status: 'ONLINE'
    }
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getSystemStatus();
      setStatus(data);
      const alertsData = await api.getSecurityAlerts().catch(() => ({ alerts: [] }));
      setAlerts(alertsData.alerts || []);
      setLastRefreshed(Date.now());
    } catch (err) {
      console.error('Failed to poll system status:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchStatus]);

  const startDemoEnvironment = async () => {
    setLoading(true);
    try {
      await api.initDemoEnvironment();
      await fetchStatus();
      return true;
    } catch (err) {
      console.error('Demo init failed:', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetSystem = async () => {
    setLoading(true);
    try {
      await api.resetSystem();
      await fetchStatus();
      return true;
    } catch (err) {
      console.error('System reset failed:', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SystemContext.Provider
      value={{
        status,
        alerts,
        loading,
        lastRefreshed,
        refreshStatus: fetchStatus,
        startDemoEnvironment,
        resetSystem
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  return useContext(SystemContext);
}
