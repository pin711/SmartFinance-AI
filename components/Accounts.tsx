import React, { useState } from 'react';
import { Account, FinancialData } from '../types';

interface AccountsProps {
  data: FinancialData;
  onUpdate: (newData: FinancialData) => void;
}

export const Accounts: React.FC<AccountsProps> = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({});

  const handleSave = () => {
    if (!currentAccount.name || currentAccount.balance === undefined) return;

    let updatedAccounts = [...data.accounts];
    if (currentAccount.id) {
      // Edit
      updatedAccounts = updatedAccounts.map(acc => 
        acc.id === currentAccount.id ? { ...acc, ...currentAccount } as Account : acc
      );
    } else {
      // Add
      const newAccount: Account = {
        id: Date.now().toString(),
        name: currentAccount.name,
        type: currentAccount.type || 'Bank',
        balance: Number(currentAccount.balance),
        currency: currentAccount.currency || 'TWD'
      };
      updatedAccounts.push(newAccount);
    }

    onUpdate({ ...data, accounts: updatedAccounts });
    setIsEditing(false);
    setCurrentAccount({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = data.accounts.filter(acc => acc.id !== id);
      onUpdate({ ...data, accounts: updatedAccounts });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Accounts</h2>
        <button 
          onClick={() => { setCurrentAccount({}); setIsEditing(true); }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
        >
          + Add Account
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100 animate-fade-in">
          <h3 className="text-lg font-bold mb-4">{currentAccount.id ? 'Edit Account' : 'New Account'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={currentAccount.name || ''}
                onChange={e => setCurrentAccount({...currentAccount, name: e.target.value})}
                placeholder="e.g. Chase Savings"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                 className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                 value={currentAccount.type || 'Bank'}
                 onChange={e => setCurrentAccount({...currentAccount, type: e.target.value as any})}
              >
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={currentAccount.balance || ''}
                onChange={e => setCurrentAccount({...currentAccount, balance: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={currentAccount.currency || 'TWD'}
                onChange={e => setCurrentAccount({...currentAccount, currency: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Save</button>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.accounts.map(acc => (
          <div key={acc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">{acc.type}</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">{acc.name}</h3>
              </div>
              <div className="text-2xl opacity-20">🏦</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{acc.currency} ${acc.balance.toLocaleString()}</p>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <button 
                onClick={() => { setCurrentAccount(acc); setIsEditing(true); }}
                className="bg-blue-100 text-blue-600 p-1.5 rounded-lg hover:bg-blue-200"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDelete(acc.id)}
                className="bg-red-100 text-red-600 p-1.5 rounded-lg hover:bg-red-200"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};