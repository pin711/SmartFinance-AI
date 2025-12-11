export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'Cash' | 'Credit Card' | 'Investment';
  balance: number;
  currency: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

export interface StockHolding {
  id: string;
  symbol: string; // e.g., 2330.TW, AAPL
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  lastUpdated?: string;
}

export interface FinancialData {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  stocks: StockHolding[];
}

export const CATEGORIES = [
  'Food', 'Transport', 'Salary', 'Rent', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Investment', 'Other'
];