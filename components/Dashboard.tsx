import React, { useEffect, useState } from 'react';
import { FinancialData } from '../types';
import { generateFinancialAdvice } from '../services/geminiService';

interface DashboardProps {
  data: FinancialData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [advice, setAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const totalAssets = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalStockValue = data.stocks.reduce((sum, stock) => sum + (stock.shares * stock.currentPrice), 0);
  const netWorth = totalAssets + totalStockValue;

  const recentTransactions = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const fetchAdvice = async () => {
    setIsLoadingAdvice(true);
    const result = await generateFinancialAdvice(data.accounts, data.transactions, data.stocks);
    setAdvice(result);
    setIsLoadingAdvice(false);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Financial Overview</h2>
        <p className="text-gray-500">Your current financial standing at a glance.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Net Worth</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            ${netWorth.toLocaleString()} <span className="text-sm text-gray-400 font-normal">TWD (Est)</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cash Assets</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ${totalAssets.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Investment Value</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ${totalStockValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI Advisor Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
               ✨ AI Financial Advisor
             </h3>
             <button 
               onClick={fetchAdvice}
               disabled={isLoadingAdvice}
               className="text-sm px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 disabled:opacity-50 font-medium transition-all"
             >
               {isLoadingAdvice ? 'Thinking...' : 'Get Analysis'}
             </button>
          </div>
          
          {advice ? (
            <div className="prose prose-sm text-indigo-800 bg-white/60 p-4 rounded-xl backdrop-blur-sm">
               <pre className="whitespace-pre-wrap font-sans">{advice}</pre>
            </div>
          ) : (
            <p className="text-indigo-600/70 italic">
              Tap "Get Analysis" to let Gemini analyze your spending habits and portfolio health.
            </p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Note</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-600">{t.date}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-800">{t.note || '-'}</td>
                    <td className={`px-6 py-3 font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};