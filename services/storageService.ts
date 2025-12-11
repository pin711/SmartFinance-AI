import { db } from './firebase';
import { FinancialData, TransactionType } from '../types';

const COLLECTION_NAME = 'financial_data';

const DEFAULT_DATA: Omit<FinancialData, 'user'> = {
  accounts: [
    { id: '1', name: 'Primary Savings', type: 'Bank', balance: 150000, currency: 'TWD' },
    { id: '2', name: 'Wallet Cash', type: 'Cash', balance: 3000, currency: 'TWD' },
  ],
  transactions: [
    { id: 't1', accountId: '1', amount: 50000, type: TransactionType.INCOME, category: 'Salary', date: new Date().toISOString().split('T')[0], note: 'Monthly Salary' },
    { id: 't2', accountId: '2', amount: 120, type: TransactionType.EXPENSE, category: 'Food', date: new Date().toISOString().split('T')[0], note: 'Lunch' },
  ],
  stocks: [
    { id: 's1', symbol: '2330.TW', name: 'TSMC', shares: 1000, averageCost: 600, currentPrice: 950, lastUpdated: new Date().toISOString() },
  ]
};

// Fetch data for a specific user from Firestore
export const fetchUserData = async (userId: string): Promise<FinancialData | null> => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as FinancialData;
    } else {
      // Create default data for new user
      const newData: FinancialData = {
        user: { id: userId, username: 'New User', email: '' },
        ...DEFAULT_DATA
      };
      await docRef.set(newData);
      return newData;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Save entire state to Firestore
export const saveUserData = async (userId: string, data: FinancialData): Promise<void> => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(userId);
    await docRef.set(data, { merge: true });
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};