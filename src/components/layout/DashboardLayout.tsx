import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main content - different padding for mobile vs desktop */}
      <main className={`transition-all duration-300 ${isMobile ? 'ml-0' : 'md:ml-64'}`}>
        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};