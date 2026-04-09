import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, Check, X, MessageCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FundingRequest {
  id: string;
  investorId: string;
  investorName: string;
  entrepreneurId: string;
  entrepreneurName: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

export const FundingRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    if (user) {
      const allRequests = JSON.parse(localStorage.getItem('fundingRequests') || '[]');
      // Filter requests for this investor
      const myRequests = allRequests.filter((req: FundingRequest) => req.investorId === user.id);
      setRequests(myRequests);
    }
  }, [user]);

  const handleRequest = (requestId: string, action: 'accepted' | 'declined') => {
    const allRequests = JSON.parse(localStorage.getItem('fundingRequests') || '[]');
    const updatedRequests = allRequests.map((req: FundingRequest) => {
      if (req.id === requestId) {
        const updated = { ...req, status: action };
        
        // If accepted, also update wallet balances
        if (action === 'accepted') {
          // Deduct from investor wallet
          const investorBalance = localStorage.getItem(`wallet_${req.investorId}`);
          if (investorBalance && parseFloat(investorBalance) >= req.amount) {
            const newInvestorBalance = parseFloat(investorBalance) - req.amount;
            localStorage.setItem(`wallet_${req.investorId}`, newInvestorBalance.toString());
            
            // Add to entrepreneur wallet
            const entrepreneurBalance = localStorage.getItem(`wallet_${req.entrepreneurId}`) || '0';
            const newEntrepreneurBalance = parseFloat(entrepreneurBalance) + req.amount;
            localStorage.setItem(`wallet_${req.entrepreneurId}`, newEntrepreneurBalance.toString());
            
            // Add transaction records
            const investorTransactions = JSON.parse(localStorage.getItem(`transactions_${req.investorId}`) || '[]');
            investorTransactions.unshift({
              id: Date.now().toString(),
              type: 'funding',
              amount: req.amount,
              sender: req.investorName,
              receiver: req.entrepreneurName,
              status: 'completed',
              date: new Date().toISOString()
            });
            localStorage.setItem(`transactions_${req.investorId}`, JSON.stringify(investorTransactions));
            
            const entrepreneurTransactions = JSON.parse(localStorage.getItem(`transactions_${req.entrepreneurId}`) || '[]');
            entrepreneurTransactions.unshift({
              id: Date.now().toString(),
              type: 'funding',
              amount: req.amount,
              sender: req.investorName,
              receiver: req.entrepreneurName,
              status: 'completed',
              date: new Date().toISOString()
            });
            localStorage.setItem(`transactions_${req.entrepreneurId}`, JSON.stringify(entrepreneurTransactions));
            
            toast.success(`$${req.amount} funded to ${req.entrepreneurName}!`);
          } else {
            toast.error('Insufficient balance to fund this request');
            return req; // Don't update status if insufficient balance
          }
        }
        
        toast.success(`Request ${action} successfully!`);
        return updated;
      }
      return req;
    });
    
    localStorage.setItem('fundingRequests', JSON.stringify(updatedRequests));
    
    // Update local state
    const myUpdatedRequests = updatedRequests.filter((req: FundingRequest) => req.investorId === user?.id);
    setRequests(myUpdatedRequests);
    
    // Trigger wallet update event
    window.dispatchEvent(new Event('walletUpdated'));
  };

  const handleMessage = (entrepreneurId: string) => {
    navigate(`/chat/${entrepreneurId}`);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const historyRequests = requests.filter(r => r.status !== 'pending');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funding Requests</h1>
          <p className="text-gray-600">Review and respond to funding requests from entrepreneurs</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <DollarSign size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Pending Requests</p>
                <h3 className="text-2xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-green-50 border border-green-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Check size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Approved</p>
                <h3 className="text-2xl font-semibold text-green-900">
                  {requests.filter(r => r.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gray-50 border border-gray-200">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-full mr-4">
                <X size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Declined</p>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {requests.filter(r => r.status === 'declined').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Pending Requests</h2>
          </CardHeader>
          <CardBody>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending funding requests</p>
                <p className="text-sm text-gray-400 mt-1">When entrepreneurs request funding, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{request.entrepreneurName}</h3>
                          <Badge variant="warning" size="sm">Pending</Badge>
                        </div>
                        <p className="text-2xl font-bold text-primary-600">${request.amount.toLocaleString()}</p>
                        {request.message && (
                          <p className="text-gray-600 text-sm mt-2">{request.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Requested on {formatDate(request.date)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<MessageCircle size={14} />}
                          onClick={() => handleMessage(request.entrepreneurId)}
                        >
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                          onClick={() => navigate(`/profile/entrepreneur/${request.entrepreneurId}`)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          leftIcon={<Check size={14} />}
                          onClick={() => handleRequest(request.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<X size={14} />}
                          onClick={() => handleRequest(request.id, 'declined')}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Request History</h2>
          </CardHeader>
          <CardBody>
            {historyRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No request history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="text-left py-3">Entrepreneur</th>
                      <th className="text-left py-3">Amount</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Date</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRequests.map((request) => (
                      <tr key={request.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{request.entrepreneurName}</td>
                        <td className="py-3">${request.amount.toLocaleString()}</td>
                        <td className="py-3">
                         <Badge 
  variant={request.status === 'accepted' ? 'success' : 'secondary'} 
  size="sm"
  className={request.status === 'declined' ? 'bg-red-100 text-red-700' : ''}
>
  {request.status === 'accepted' ? 'Accepted' : 'Declined'}
</Badge>
                        
                        </td>
                        <td className="py-3 text-gray-500">{formatDate(request.date)}</td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<MessageCircle size={14} />}
                            onClick={() => handleMessage(request.entrepreneurId)}
                          >
                            Message
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};