import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = ({ pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35, background: 'rgba(0,0,0,0.5)' }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} title={pageTitle} />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
