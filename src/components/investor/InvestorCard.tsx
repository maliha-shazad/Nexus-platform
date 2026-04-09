import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, DollarSign } from 'lucide-react';
import { Investor } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface InvestorCardProps {
  investor: Investor;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  showActions = true
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  
  const handleViewProfile = () => {
    navigate(`/profile/investor/${investor.id}`);
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${investor.id}`);
  };
  
  const handleRequestFunding = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRequestModal(true);
  };
  
  const submitFundingRequest = () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Save funding request to localStorage
    const requests = JSON.parse(localStorage.getItem('fundingRequests') || '[]');
    const newRequest = {
      id: Date.now().toString(),
      investorId: investor.id,
      investorName: investor.name,
      entrepreneurId: user?.id,
      entrepreneurName: user?.name,
      amount: amount,
      message: requestMessage,
      status: 'pending',
      date: new Date().toISOString()
    };
    requests.push(newRequest);
    localStorage.setItem('fundingRequests', JSON.stringify(requests));
    
    toast.success(`Funding request of $${amount} sent to ${investor.name}!`);
    setShowRequestModal(false);
    setRequestAmount('');
    setRequestMessage('');
  };
  
  return (
    <>
      <Card 
        hoverable 
        className="transition-all duration-300 h-full cursor-pointer"
        onClick={handleViewProfile}
      >
        <CardBody className="flex flex-col">
          <div className="flex items-start">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="lg"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mr-4"
            />
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{investor.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Investor • {investor.totalInvestments} investments</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {investor.investmentStage.map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Investment Interests</h4>
            <div className="flex flex-wrap gap-2">
              {investor.investmentInterests.map((interest, index) => (
                <Badge key={index} variant="primary" size="sm">{interest}</Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">{investor.bio}</p>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500">Investment Range</span>
              <p className="text-sm font-medium text-gray-900">{investor.minimumInvestment} - {investor.maximumInvestment}</p>
            </div>
          </div>
        </CardBody>
        
        {showActions && (
          <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ExternalLink size={16} />}
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
            
            <Button
              variant="success"
              size="sm"
              leftIcon={<DollarSign size={14} />}
              onClick={handleRequestFunding}
            >
              Request Funding
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Request Funding Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Request Funding</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-500">
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Request funding from <strong>{investor.name}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-2 border rounded"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Range: {investor.minimumInvestment} - {investor.maximumInvestment}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                <textarea
                  placeholder="Tell the investor about your startup..."
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>
              
              <Button onClick={submitFundingRequest} className="w-full" leftIcon={<DollarSign size={18} />}>
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};