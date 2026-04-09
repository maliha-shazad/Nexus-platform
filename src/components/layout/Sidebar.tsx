import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Wallet } from 'lucide-react';
import { 
  Home, Building2, CircleDollarSign, Users, MessageCircle, 
  Bell, FileText, Settings, HelpCircle, Calendar, Video, Menu, X
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      onClick={() => {
        const event = new CustomEvent('closeMobileMenu');
        window.dispatchEvent(event);
      }}
      className={({ isActive }) => 
        `flex items-center py-2.5 px-4 rounded-md transition-colors duration-200 ${
          isActive 
            ? 'bg-primary-50 text-primary-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!user) return null;

  React.useEffect(() => {
    const handleClose = () => setIsMobileMenuOpen(false);
    window.addEventListener('closeMobileMenu', handleClose);
    return () => window.removeEventListener('closeMobileMenu', handleClose);
  }, []);
  
  const entrepreneurItems = [
    { to: '/dashboard/entrepreneur', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={20} />, text: 'My Startup' },
    { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },
    { to: '/calendar', icon: <Calendar size={20} />, text: 'Calendar' },
    { to: '/video-call', icon: <Video size={20} />, text: 'Video Call' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
    { to: '/my-requests', icon: <DollarSign size={20} />, text: 'My Requests' },
    { to: '/wallet', icon: <Wallet size={20} />, text: 'Wallet' },
  ];
  
  const investorItems = [
    { to: '/dashboard/investor', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
    { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },
    { to: '/calendar', icon: <Calendar size={20} />, text: 'Calendar' },
    { to: '/video-call', icon: <Video size={20} />, text: 'Video Call' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
    { to: '/deals', icon: <FileText size={20} />, text: 'Deals' },
    { to: '/funding-requests', icon: <DollarSign size={20} />, text: 'Funding Requests' },
    { to: '/wallet', icon: <Wallet size={20} />, text: 'Wallet' },
  ];
  
  const sidebarItems = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  
  const commonItems = [
    { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
    { to: '/help', icon: <HelpCircle size={20} />, text: 'Help & Support' },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="sidebar-nav px-3 space-y-1">
          {sidebarItems.map((item, index) => (
            <SidebarItem key={index} to={item.to} icon={item.icon} text={item.text} />
          ))}
        </div>
        
        <div className="mt-8 px-3">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-2 space-y-1">
            {commonItems.map((item, index) => (
              <SidebarItem key={index} to={item.to} icon={item.icon} text={item.text} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-600">Need assistance?</p>
          <h4 className="text-sm font-medium text-gray-900 mt-1">Contact Support</h4>
          <a href="mailto:support@businessnexus.com" className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500">
            support@businessnexus.com
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden md:block w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
        <div className="h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-xl md:hidden overflow-y-auto">
            <div className="pt-16 h-full">
              <SidebarContent />
            </div>
          </div>
        </>
      )}
    </>
  );
};