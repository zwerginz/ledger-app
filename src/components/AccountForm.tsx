import React, { useState } from 'react';
import { dbService, AccountType } from '../services/DatabaseService';

interface AccountFormProps {
  onAccountCreated: () => void;
}

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

const AccountForm: React.FC<AccountFormProps> = ({ onAccountCreated }) => {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.Checking);
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Account name is required');
      return;
    }
    
    // Validate balance as a number
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum)) {
      setError('Balance must be a valid number');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new financial account
      await dbService.createAccount({
        name: name.trim(),
        accountType,
        balance: balanceNum,
        currency,
        description: description.trim() || undefined
      });
      
      // Clear form
      setName('');
      setAccountType(AccountType.Checking);
      setBalance('0');
      setCurrency('USD');
      setDescription('');
      
      // Notify parent component
      onAccountCreated();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Failed to create account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="account-form card">
      <h2>Create New Financial Account</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Account Name: <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g., Chase Checking"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            rows={3}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="accountType" style={{ display: 'block', marginBottom: '5px' }}>
            Account Type: <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px' }}
          >
            {Object.values(AccountType).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ marginBottom: '15px', flexGrow: 1 }}>
            <label htmlFor="balance" style={{ display: 'block', marginBottom: '5px' }}>
              Initial Balance: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="balance"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px', width: '40%' }}>
            <label htmlFor="currency" style={{ display: 'block', marginBottom: '5px' }}>
              Currency: <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '8px' }}
            >
              {CURRENCY_OPTIONS.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default AccountForm;
