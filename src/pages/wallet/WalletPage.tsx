import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { WalletCard } from '../../components/payments/WalletCard';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600">Manage your funds, deposit, withdraw, and transfer money</p>
      </div>
      
      <WalletCard userId={user.id} userName={user.name} />
    </div>
  );
};