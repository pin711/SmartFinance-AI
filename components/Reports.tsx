import React from 'react';
import { FinancialData, TransactionType } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface ReportsProps {
  data: FinancialData;
}

export const Reports: React.FC<ReportsProps> = ({ data }) => {
  // 1. Calculate Expenses by Category
  const categoryMap: Record<string, number> = {};
  data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
  
  const pieData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }));

  // 2. Calculate Monthly Income vs Expense
  const monthlyDataMap: Record<string, { income: number, expense: number }> = {};
  
  data.transactions.forEach(t => {
    // Format YYYY-MM
    const month = t.date.substring(0, 7); 
    if (!monthlyDataMap[month]) monthlyDataMap[month] = { income: 0, expense: 0 };
    
    if (t.type === TransactionType.INCOME) {
      monthlyDataMap[month].income += t.amount;
    } else if (t.type === TransactionType.EXPENSE) {
      monthlyDataMap[month].expense += t.amount;
    }
  });

  const barData = Object.keys(monthlyDataMap).sort().map(month => ({
    name: month,
    Income: monthlyDataMap[month].income,
    Expense: monthlyDataMap[month].expense
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Expense by Category</h3>
          <div className="flex-1 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No expense data</div>
            )}
          </div>
        </div>

        {/* Monthly Flow */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Income vs Expense</h3>
          <div className="flex-1 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No transaction data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};