import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Wallet } from 'lucide-react';

interface WalletBalanceProps {
  userId: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ userId }) => {
  const [balance, setBalance] = useState(12500);

  useEffect(() => {
    const savedBalance = localStorage.getItem(`wallet_${userId}`);
    if (savedBalance) setBalance(parseFloat(savedBalance));
  }, [userId]);

  // Listen for wallet updates
  useEffect(() => {
    const handleUpdate = () => {
      const savedBalance = localStorage.getItem(`wallet_${userId}`);
      if (savedBalance) setBalance(parseFloat(savedBalance));
    };
    window.addEventListener('walletUpdated', handleUpdate);
    return () => window.removeEventListener('walletUpdated', handleUpdate);
  }, [userId]);

  return (
    <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">Wallet Balance</p>
            <h2 className="text-2xl font-bold mt-1">${balance.toLocaleString()}</h2>
          </div>
          <div className="p-2 bg-white/20 rounded-full">
            <Wallet size={24} className="text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};