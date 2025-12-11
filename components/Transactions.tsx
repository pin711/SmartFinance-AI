import React, { useState } from 'react';
import { FinancialData, Transaction, TransactionType, CATEGORIES } from '../types';

interface TransactionsProps {
  data: FinancialData;
  onUpdate: (newData: FinancialData) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ data, onUpdate }) => {
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    category: 'Food'
  });

  const handleAddTransaction = () => {
    if (!newTx.amount || !newTx.accountId || !newTx.category) {
      alert("Please fill in all required fields.");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      accountId: newTx.accountId,
      amount: Number(newTx.amount),
      type: newTx.type as TransactionType,
      category: newTx.category,
      date: newTx.date || new Date().toISOString().split('T')[0],
      note: newTx.note || ''
    };

    // Update account balance
    const accounts = data.accounts.map(acc => {
      if (acc.id === transaction.accountId) {
        const amount = transaction.type === TransactionType.INCOME 
          ? transaction.amount 
          : -transaction.amount;
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    onUpdate({
      ...data,
      accounts,
      transactions: [transaction, ...data.transactions]
    });

    // Reset form
    setNewTx({
      type: TransactionType.EXPENSE,
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      amount: 0,
      note: '',
      accountId: ''
    });
  };

  const handleDelete = (id: string) => {
    const txToDelete = data.transactions.find(t => t.id === id);
    if (!txToDelete) return;

    // Revert balance
    const accounts = data.accounts.map(acc => {
      if (acc.id === txToDelete.accountId) {
        const amount = txToDelete.type === TransactionType.INCOME 
          ? -txToDelete.amount 
          : txToDelete.amount;
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    onUpdate({
      ...data,
      accounts,
      transactions: data.transactions.filter(t => t.id !== id)
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Form Section */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Record Transaction</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setNewTx({...newTx, type: TransactionType.EXPENSE})}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${newTx.type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
              >
                Expense
              </button>
              <button 
                onClick={() => setNewTx({...newTx, type: TransactionType.INCOME})}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${newTx.type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              value={newTx.accountId || ''}
              onChange={e => setNewTx({...newTx, accountId: e.target.value})}
            >
              <option value="">Select Account</option>
              {data.accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              value={newTx.category}
              onChange={e => setNewTx({...newTx, category: e.target.value})}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0.00"
              value={newTx.amount || ''}
              onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              value={newTx.date}
              onChange={e => setNewTx({...newTx, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Description..."
              value={newTx.note || ''}
              onChange={e => setNewTx({...newTx, note: e.target.value})}
            />
          </div>

          <button 
            onClick={handleAddTransaction}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg mt-4"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">History</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-sm sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Account</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Note</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.transactions.map((t) => {
                const accountName = data.accounts.find(a => a.id === t.accountId)?.name || 'Unknown';
                return (
                  <tr key={t.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-3 text-sm text-gray-600">{t.date}</td>
                    <td className="px-6 py-3 text-sm text-gray-800 font-medium">{accountName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{t.category}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 truncate max-w-xs">{t.note}</td>
                    <td className={`px-6 py-3 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                       {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                       <button 
                         onClick={() => handleDelete(t.id)}
                         className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         Delete
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.transactions.length === 0 && (
             <div className="p-12 text-center text-gray-400">No transactions recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};