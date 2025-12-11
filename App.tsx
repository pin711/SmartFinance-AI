import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Accounts } from './components/Accounts';
import { Transactions } from './components/Transactions';
import { Investments } from './components/Investments';
import { Reports } from './components/Reports';
import { fetchUserData, saveUserData } from './services/storageService';
import { auth, isFirebaseConfigured } from './services/firebase';
import { FinancialData } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // If Firebase isn't configured, stop loading and show setup screen
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch data from Firestore
          const userData = await fetchUserData(currentUser.uid);
          // Ensure the user object in data matches current auth profile
          const updatedData = {
            ...userData,
            user: {
              id: currentUser.uid,
              username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || ''
            }
          } as FinancialData;
          
          setData(updatedData);
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      } else {
        setUser(null);
        setData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentView('dashboard');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleUpdateData = async (newData: FinancialData) => {
    setData(newData); // Optimistic update
    if (user) {
      try {
        await saveUserData(user.uid, newData);
      } catch (error) {
        console.error("Failed to save data to cloud", error);
        alert("Failed to save changes to the cloud. Please check your connection.");
      }
    }
  };

  // 1. Show Setup Screen if no Firebase Config
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <h1 className="text-3xl font-bold text-emerald-400 mb-4">Setup Required 🛠️</h1>
          <p className="text-gray-300 mb-6 text-lg">
            Welcome to SmartFinance! To get started, you need to connect your Firebase database.
          </p>
          
          <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="font-bold text-white text-lg">Instruction Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-400 hover:underline">Firebase Console</a> and create a new project.</li>
              <li>Enable <strong>Authentication</strong> (Email/Password & Google).</li>
              <li>Enable <strong>Firestore Database</strong> (Start in Test Mode).</li>
              <li>Go to <strong>Project Settings</strong> &gt; <strong>General</strong>.</li>
              <li>Scroll down to "Your apps", create a Web App, and copy the <code>firebaseConfig</code>.</li>
              <li>Open <code>services/firebase.ts</code> in your code editor.</li>
              <li>Replace the placeholder values with your copied config.</li>
              <li>Commit and push your changes to GitHub.</li>
            </ol>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            Once updated, this page will automatically reload to the login screen.
          </div>
        </div>
      </div>
    );
  }

  // 2. Show Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your finances...</p>
        </div>
      </div>
    );
  }

  // 3. Show Login Screen
  if (!user || !data) {
    return <Login onLoginSuccess={() => {}} />;
  }

  // 4. Show Main App
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard data={data} />;
      case 'accounts': return <Accounts data={data} onUpdate={handleUpdateData} />;
      case 'transactions': return <Transactions data={data} onUpdate={handleUpdateData} />;
      case 'investments': return <Investments data={data} onUpdate={handleUpdateData} />;
      case 'reports': return <Reports data={data} />;
      default: return <Dashboard data={data} />;
    }
  };

  return (
    <Layout 
      user={data.user} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
