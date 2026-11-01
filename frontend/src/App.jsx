import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SystemProvider } from './context/SystemContext';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import ProcessManagerPage from './pages/ProcessManagerPage';
import CreateProcessPage from './pages/CreateProcessPage';
import TaskExecutionPage from './pages/TaskExecutionPage';
import IpcMonitorPage from './pages/IpcMonitorPage';
import ResourceMonitorPage from './pages/ResourceMonitorPage';
import WorkspaceSecurityPage from './pages/WorkspaceSecurityPage';
import FileValidationPage from './pages/FileValidationPage';
import SynchronizationPage from './pages/SynchronizationPage';
import SignalControlPage from './pages/SignalControlPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import FileBackupsPage from './pages/FileBackupsPage';
import ArchitecturePage from './pages/ArchitecturePage';
import OsConceptsPage from './pages/OsConceptsPage';
import TerminalPage from './pages/TerminalPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        Initializing OS Kernel Bridge...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="main-content">
        <TopBar setMobileOpen={setMobileOpen} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/processes" element={<ProcessManagerPage />} />
          <Route path="/create-process" element={<CreateProcessPage />} />
          <Route path="/tasks" element={<TaskExecutionPage />} />
          <Route path="/ipc" element={<IpcMonitorPage />} />
          <Route path="/resources" element={<ResourceMonitorPage />} />
          <Route path="/security" element={<WorkspaceSecurityPage />} />
          <Route path="/file-validation" element={<FileValidationPage />} />
          <Route path="/synchronization" element={<SynchronizationPage />} />
          <Route path="/signals" element={<SignalControlPage />} />
          <Route path="/logs" element={<ActivityLogsPage />} />
          <Route path="/backups" element={<FileBackupsPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/concepts" element={<OsConceptsPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SystemProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </SystemProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
