import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Wallet, ArrowUp, ArrowDown, Send, History, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'funding';
  amount: number;
  sender: string;
  senderId?: string;
  receiver: string;
  receiverId?: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface WalletCardProps {
  userId: string;
  userName: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ userId, userName }) => {
  const [balance, setBalance] = useState(12500);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 10000,
      sender: 'Bank Account',
      receiver: 'Wallet',
      status: 'completed',
      date: new Date().toISOString()
    },
    {
      id: '2',
      type: 'deposit',
      amount: 2500,
      sender: 'Bank Account',
      receiver: 'Wallet',
      status: 'completed',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [amount, setAmount] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferName, setTransferName] = useState('');

  useEffect(() => {
    const savedBalance = localStorage.getItem(`wallet_${userId}`);
    const savedTransactions = localStorage.getItem(`transactions_${userId}`);
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`wallet_${userId}`, balance.toString());
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
  }, [balance, transactions, userId]);

  const handleTransaction = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (modalType === 'withdraw' && numAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (modalType === 'transfer' && numAmount > balance) {
      toast.error('Insufficient balance for transfer');
      return;
    }

    let newTransaction: Transaction;
    let newBalance = balance;

    if (modalType === 'deposit') {
      newBalance = balance + numAmount;
      newTransaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: numAmount,
        sender: 'Bank Account',
        receiver: userName,
        status: 'completed',
        date: new Date().toISOString()
      };
      toast.success(`$${numAmount} deposited successfully!`);
    } else if (modalType === 'withdraw') {
      newBalance = balance - numAmount;
      newTransaction = {
        id: Date.now().toString(),
        type: 'withdraw',
        amount: numAmount,
        sender: userName,
        receiver: 'Bank Account',
        status: 'completed',
        date: new Date().toISOString()
      };
      toast.success(`$${numAmount} withdrawn successfully!`);
    } else {
      // Transfer
      newBalance = balance - numAmount;
      newTransaction = {
        id: Date.now().toString(),
        type: 'transfer',
        amount: numAmount,
        sender: userName,
        senderId: userId,
        receiver: transferName || transferEmail,
        receiverId: 'recipient_id',
        status: 'completed',
        date: new Date().toISOString()
      };
      toast.success(`$${numAmount} sent to ${transferName || transferEmail}!`);
    }

    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
    setAmount('');
    setTransferEmail('');
    setTransferName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'deposit': return <ArrowDown size={16} className="text-green-500" />;
      case 'withdraw': return <ArrowUp size={16} className="text-red-500" />;
      case 'transfer': return <Send size={16} className="text-blue-500" />;
      case 'funding': return <DollarSign size={16} className="text-purple-500" />;
      default: return <History size={16} className="text-gray-500" />;
    }
  };

  return (
    <>
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Total Balance</p>
              <h2 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h2>
              <p className="text-primary-100 text-xs mt-2">Available for funding</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet size={32} className="text-white" />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => {
                setModalType('deposit');
                setShowModal(true);
              }}
            >
              <ArrowDown size={14} className="mr-1" /> Deposit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => {
                setModalType('withdraw');
                setShowModal(true);
              }}
            >
              <ArrowUp size={14} className="mr-1" /> Withdraw
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => {
                setModalType('transfer');
                setShowModal(true);
              }}
            >
              <Send size={14} className="mr-1" /> Transfer
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <History size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">From</th>
                    <th className="text-left py-2">To</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {getTransactionIcon(tx.type)}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                       </td>
                      <td className={`py-3 font-medium ${tx.type === 'deposit' ? 'text-green-600' : tx.type === 'withdraw' ? 'text-red-600' : 'text-gray-900'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                       </td>
                      <td className="py-3 text-gray-600 max-w-[120px] truncate">{tx.sender}</td>
                      <td className="py-3 text-gray-600 max-w-[120px] truncate">{tx.receiver}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                       </td>
                      <td className="py-3 text-gray-500 text-xs">{formatDate(tx.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold capitalize">{modalType} Money</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-2 border rounded"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {modalType === 'transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="Enter recipient name"
                      className="w-full p-2 border rounded"
                      value={transferName}
                      onChange={(e) => setTransferName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Recipient Email</label>
                    <input
                      type="email"
                      placeholder="Enter recipient email"
                      className="w-full p-2 border rounded"
                      value={transferEmail}
                      onChange={(e) => setTransferEmail(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleTransaction} className="w-full">
                Confirm {modalType}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};