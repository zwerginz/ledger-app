import React, { useEffect, useState } from 'react';
import { dbService } from '../services/DatabaseService';
import AccountForm from './AccountForm';
import AccountList from './AccountList';

const AccountManagement: React.FC = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize the database when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await dbService.initialize();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        let errorMessage = 'Failed to initialize database. Please restart the application.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [retryCount]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: 'red' }}>Database Error</h2>
        <p style={{ marginBottom: '20px' }}>{error}</p>
        <div>
          <button onClick={handleRetry} style={{ marginRight: '10px' }}>
            Retry Connection
          </button>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
        <p style={{ fontSize: '0.9em', marginTop: '20px', opacity: 0.7 }}>
          If the problem persists, please ensure that the application has the necessary permissions
          and that the SQL plugin is properly configured.
        </p>
      </div>
    );
  }
  
  if (isLoading || !isDbInitialized) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Initializing Database...</h2>
        <p>Please wait while we set up your financial records.</p>
        {isLoading && (
          <div style={{ 
            margin: '20px auto', 
            width: '40px', 
            height: '40px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid var(--button-background-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }
  
  return (
    <div className="account-management">
      <h1>Financial Account Management</h1>
      <p style={{ marginTop: '-10px', opacity: 0.7 }}>
        Track your financial accounts and monitor your balances
      </p>
      
      <div style={{ marginBottom: '30px' }}>
        <AccountForm onAccountCreated={() => {
          // This will be triggered when an account is created successfully
          // The AccountList component has its own refresh mechanism
        }} />
      </div>
      
      <AccountList />
    </div>
  );
};

export default AccountManagement;
