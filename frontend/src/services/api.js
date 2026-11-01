/**
 * API Service Layer with Token Interceptors
 * Course: Operating Systems and Systems Programming (25CS2104E)
 */

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('ossp_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      if (endpoint === '/auth/login') {
        throw new Error(errorData.detail || 'Invalid username or password');
      }
      localStorage.removeItem('ossp_auth_token');
      localStorage.removeItem('ossp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error(errorData.detail || 'Unauthorized session. Please log in.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    // If downloading a file blob
    if (options.responseType === 'blob') {
      return response.blob();
    }

    return response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // System & Health
  getSystemStatus: () => request('/system/status'),
  initDemoEnvironment: () => request('/system/demo-init', { method: 'POST' }),
  resetSystem: () => request('/system/reset', { method: 'POST' }),
  getSignalsHistory: () => request('/system/signals-history'),
  getHealth: () => request('/health'),

  // Agents
  getAgents: () => request('/agents'),
  getAgent: (id) => request(`/agents/${id}`),
  createAgent: (data) =>
    request('/agents', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  stopAgent: (id) => request(`/agents/${id}/stop`, { method: 'POST' }),
  resumeAgent: (id) => request(`/agents/${id}/resume`, { method: 'POST' }),
  terminateAgent: (id) => request(`/agents/${id}/terminate`, { method: 'POST' }),

  // Processes & Signals
  getProcesses: () => request('/processes'),
  sendProcessSignal: (pid, signal) =>
    request(`/processes/${pid}/signal`, {
      method: 'POST',
      body: JSON.stringify({ signal })
    }),

  // IPC & FIFO
  getIpcChannels: () => request('/ipc/channels'),
  getIpcMessages: () => request('/ipc/messages'),
  sendIpcMessage: (from_agent, to_agent, content) =>
    request('/ipc/send', {
      method: 'POST',
      body: JSON.stringify({ from_agent, to_agent, content })
    }),

  // Resources
  getCurrentResources: () => request('/resources/current'),
  getResourceHistory: () => request('/resources/history'),
  getResourceViolations: () => request('/resources/violations'),

  // Workspace Security & File ACL
  getWorkspaceTree: () => request('/files/tree'),
  validateFileAccess: (agent_id, path, operation) =>
    request('/files/validate', {
      method: 'POST',
      body: JSON.stringify({ agent_id, path, operation })
    }),
  getFileAudits: () => request('/files/audit-logs'),
  getSecurityAlerts: () => request('/files/security-alerts'),

  // Synchronization & Locks
  getLocks: () => request('/sync/locks'),
  acquireLock: (file_path, agent_id) =>
    request('/sync/acquire', {
      method: 'POST',
      body: JSON.stringify({ file_path, agent_id })
    }),
  releaseLock: (file_path, agent_id) =>
    request('/sync/release', {
      method: 'POST',
      body: JSON.stringify({ file_path, agent_id })
    }),
  simulateContention: () => request('/sync/simulate-contention', { method: 'POST' }),

  // File Backups
  getBackups: () => request('/backups'),
  createBackup: (file_path, modified_by) =>
    request('/backups/create', {
      method: 'POST',
      body: JSON.stringify({ file_path, modified_by })
    }),
  restoreBackup: (id) => request(`/backups/${id}/restore`, { method: 'POST' }),
  downloadBackupUrl: (id) => `${BASE_URL}/backups/${id}/download`,

  // Task Execution Center
  getTasks: () => request('/tasks'),
  getTask: (id) => request(`/tasks/${id}`),
  submitTask: (data) =>
    request('/tasks/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  solveProblem: (data) =>
    request('/tasks/solve-problem', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Logs & Terminal
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/logs${query ? `?${query}` : ''}`);
  },
  getTerminalLogs: () => request('/logs/terminal'),
  exportLogsUrl: (format = 'csv') => `${BASE_URL}/logs/export?format=${format}`
};
