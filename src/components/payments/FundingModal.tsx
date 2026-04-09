import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface FundingModalProps {
  entrepreneurName: string;
  entrepreneurId: string;
  startupName: string;
  onClose: () => void;
  onFund: (amount: number) => void;
}

export const FundingModal: React.FC<FundingModalProps> = ({
  entrepreneurName,
  startupName,
  onClose,
  onFund
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleFund = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    toast.success(`$${numAmount} funded to ${entrepreneurName}!`);
    onFund(numAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Fund Deal</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Fund <strong>{entrepreneurName}</strong> from <strong>{startupName}</strong>
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Investment Amount ($)</label>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full p-2 border rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Message (Optional)</label>
          <textarea
            placeholder="Add a message to the entrepreneur..."
            className="w-full p-2 border rounded"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        <Button onClick={handleFund} className="w-full" leftIcon={<DollarSign size={18} />}>
          Confirm Funding
        </Button>
      </div>
    </div>
  );
};