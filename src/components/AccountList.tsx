import React, { useState, useEffect } from 'react';
import { dbService, Account } from '../services/DatabaseService';

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedAccounts = await dbService.getAccounts();
      setAccounts(fetchedAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Failed to fetch accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await dbService.deleteAccount(id);
        // Refresh the list
        fetchAccounts();
      } catch (err) {
        console.error('Failed to delete account:', err);
        alert('Failed to delete account: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Format currency amount
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get the appropriate color for the balance
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return '#2e7d32';  // Green for positive
    if (balance < 0) return '#d32f2f';  // Red for negative
    return 'inherit';                   // Default for zero
  };

  if (isLoading && accounts.length === 0) {
    return <div>Loading accounts...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <h3>Error loading accounts</h3>
        <p>{error}</p>
        <button onClick={fetchAccounts}>Try Again</button>
      </div>
    );
  }
  
  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => {
    // This is a simplistic approach that assumes all currencies are the same
    // In a real app, you'd need currency conversion
    return sum + account.balance;
  }, 0);

  return (
    <div className="account-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Financial Accounts</h2>
        <button onClick={fetchAccounts}>
          {isLoading ? "Loading..." : "Refresh Accounts"}
        </button>
      </div>
      
      {accounts.length > 0 && (
        <div className="accounts-summary" style={{ 
          marginTop: '10px', 
          marginBottom: '20px', 
          padding: '10px 15px',
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0', fontWeight: 'bold' }}>
            Total Balance: 
            <span style={{ 
              color: getBalanceColor(totalBalance),
              marginLeft: '8px'
            }}>
              {formatCurrency(totalBalance, 'USD')}
            </span>
            <span style={{ fontSize: '0.8em', marginLeft: '8px', opacity: 0.7 }}>
              (Across {accounts.length} accounts)
            </span>
          </p>
        </div>
      )}
      
      {accounts.length === 0 ? (
        <p>No accounts found. Create one using the form above.</p>
      ) : (
        <div className="account-cards" style={{ marginTop: '20px' }}>
          {accounts.map(account => (
            <div 
              key={account.id} 
              className="account-card card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{account.name}</h3>
                  <p style={{ 
                    margin: '0',
                    fontSize: '0.9em',
                    padding: '2px 8px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '12px',
                    display: 'inline-block'
                  }}>
                    {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(account.id!)}
                  style={{
                    backgroundColor: '#dc3545',
                    padding: '4px 8px',
                    fontSize: '0.8em'
                  }}
                >
                  Delete
                </button>
              </div>
              
              <div style={{ 
                marginTop: '15px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Balance:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.2em',
                  color: getBalanceColor(account.balance)
                }}>
                  {formatCurrency(account.balance, account.currency)}
                </span>
              </div>
              
              {account.description && (
                <p style={{ 
                  margin: '15px 0 0 0', 
                  fontSize: '0.9em',
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  paddingTop: '10px'
                }}>
                  {account.description}
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '15px',
                fontSize: '0.8em',
                opacity: 0.6
              }}>
                <span>ID: {account.id}</span>
                {account.createdAt && (
                  <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountList;
