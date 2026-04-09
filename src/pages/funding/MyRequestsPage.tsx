import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

export const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FundingRequest[]>([]);

  useEffect(() => {
    if (user) {
      const allRequests = JSON.parse(localStorage.getItem('fundingRequests') || '[]');
      const myRequests = allRequests.filter((req: FundingRequest) => req.entrepreneurId === user.id);
      setRequests(myRequests);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const fundedAmount = requests.filter(r => r.status === 'accepted').reduce((sum, r) => sum + r.amount, 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'accepted':
        return <Badge variant="success" size="sm">Accepted</Badge>;
      case 'declined':
        return <Badge variant="secondary" size="sm" className="bg-red-100 text-red-700">Declined</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Funding Requests</h1>
        <p className="text-gray-600">Track your funding requests to investors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-yellow-50 border border-yellow-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <DollarSign size={20} className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending Requests</p>
                <h3 className="text-2xl font-semibold text-yellow-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-green-50 border border-green-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <DollarSign size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Funded Amount</p>
                <h3 className="text-2xl font-semibold text-green-900">
                  ${fundedAmount.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">All Requests</h2>
        </CardHeader>
        <CardBody>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No funding requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Go to Investors page to request funding</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-3">Investor</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{request.investorName}</td>
                      <td className="py-3">${request.amount.toLocaleString()}</td>
                      <td className="py-3">{getStatusBadge(request.status)}</td>
                      <td className="py-3 text-gray-500">{formatDate(request.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};