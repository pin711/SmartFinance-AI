import React, { useState } from 'react';
import { FinancialData, StockHolding } from '../types';
import { fetchStockPrice } from '../services/geminiService';

interface InvestmentsProps {
  data: FinancialData;
  onUpdate: (newData: FinancialData) => void;
}

export const Investments: React.FC<InvestmentsProps> = ({ data, onUpdate }) => {
  const [newStock, setNewStock] = useState<Partial<StockHolding>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAddStock = () => {
    if (!newStock.symbol || !newStock.shares || !newStock.averageCost) return;

    const stock: StockHolding = {
      id: Date.now().toString(),
      symbol: newStock.symbol.toUpperCase(),
      name: newStock.name || newStock.symbol.toUpperCase(),
      shares: Number(newStock.shares),
      averageCost: Number(newStock.averageCost),
      currentPrice: Number(newStock.averageCost), // Initial assumption
    };

    onUpdate({
      ...data,
      stocks: [...data.stocks, stock]
    });
    setNewStock({});
  };

  const updatePrice = async (stock: StockHolding) => {
    setLoadingId(stock.id);
    const result = await fetchStockPrice(stock.symbol);
    
    if (result) {
      const updatedStocks = data.stocks.map(s => 
        s.id === stock.id ? { ...s, currentPrice: result.price, lastUpdated: new Date().toISOString() } : s
      );
      onUpdate({ ...data, stocks: updatedStocks });
    } else {
      alert(`Could not fetch data for ${stock.symbol}. Try again.`);
    }
    setLoadingId(null);
  };

  const updateAllPrices = async () => {
    setLoadingId('all');
    // Process sequentially to avoid rate limits if any, or just Promise.all
    // Since Gemini has generous limits, we can try parallel
    const promises = data.stocks.map(async (stock) => {
      const result = await fetchStockPrice(stock.symbol);
      if (result) {
        return { ...stock, currentPrice: result.price, lastUpdated: new Date().toISOString() };
      }
      return stock;
    });

    const updatedStocks = await Promise.all(promises);
    onUpdate({ ...data, stocks: updatedStocks });
    setLoadingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this holding?')) {
      onUpdate({ ...data, stocks: data.stocks.filter(s => s.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investment Portfolio</h2>
          <p className="text-gray-500 text-sm">Track your stocks (TW & US Market)</p>
        </div>
        <button 
          onClick={updateAllPrices}
          disabled={loadingId !== null}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm flex items-center gap-2"
        >
          {loadingId === 'all' ? 'Updating...' : '🔄 Update Market Data (Gemini)'}
        </button>
      </div>

      {/* Add Stock Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-md font-bold mb-4 text-gray-800">Add Holding</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase">Symbol</label>
            <input 
              className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="e.g. 2330.TW or AAPL"
              value={newStock.symbol || ''}
              onChange={e => setNewStock({...newStock, symbol: e.target.value})}
            />
          </div>
          <div className="flex-1 w-full">
             <label className="text-xs font-semibold text-gray-500 uppercase">Name (Optional)</label>
             <input 
               className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
               placeholder="TSMC"
               value={newStock.name || ''}
               onChange={e => setNewStock({...newStock, name: e.target.value})}
             />
          </div>
          <div className="w-full md:w-32">
             <label className="text-xs font-semibold text-gray-500 uppercase">Shares</label>
             <input 
               type="number"
               className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
               placeholder="0"
               value={newStock.shares || ''}
               onChange={e => setNewStock({...newStock, shares: Number(e.target.value)})}
             />
          </div>
          <div className="w-full md:w-32">
             <label className="text-xs font-semibold text-gray-500 uppercase">Avg Cost</label>
             <input 
               type="number"
               className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
               placeholder="0.00"
               value={newStock.averageCost || ''}
               onChange={e => setNewStock({...newStock, averageCost: Number(e.target.value)})}
             />
          </div>
          <button 
            onClick={handleAddStock}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Holdings List */}
      <div className="grid grid-cols-1 gap-4">
        {data.stocks.map(stock => {
          const marketValue = stock.shares * stock.currentPrice;
          const costBasis = stock.shares * stock.averageCost;
          const profit = marketValue - costBasis;
          const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;
          
          return (
            <div key={stock.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="bg-indigo-100 text-indigo-700 p-3 rounded-lg font-bold text-lg w-16 text-center">
                    {stock.symbol.split('.')[0].substring(0,4)}
                 </div>
                 <div>
                   <h4 className="font-bold text-lg text-gray-900">{stock.name}</h4>
                   <p className="text-gray-500 text-sm">{stock.symbol}</p>
                 </div>
               </div>

               <div className="flex flex-wrap gap-8 text-sm w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-gray-500">Price</p>
                    <p className="font-bold text-lg">{stock.currentPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Shares</p>
                    <p className="font-bold text-lg">{stock.shares.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Market Value</p>
                    <p className="font-bold text-lg">${marketValue.toLocaleString()}</p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-gray-500">P/L</p>
                    <p className={`font-bold text-lg ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toLocaleString()} <br/>
                      <span className="text-xs">({profitPercent.toFixed(2)}%)</span>
                    </p>
                  </div>
               </div>

               <div className="flex gap-2 w-full md:w-auto justify-end">
                 <button 
                   onClick={() => updatePrice(stock)}
                   disabled={loadingId !== null}
                   className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg text-sm"
                 >
                   {loadingId === stock.id ? 'Updating...' : 'Update'}
                 </button>
                 <button 
                   onClick={() => handleDelete(stock.id)}
                   className="text-red-400 hover:bg-red-50 p-2 rounded-lg text-sm"
                 >
                   Delete
                 </button>
               </div>
            </div>
          );
        })}
        {data.stocks.length === 0 && (
          <div className="text-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
            No stock holdings added yet.
          </div>
        )}
      </div>
    </div>
  );
};