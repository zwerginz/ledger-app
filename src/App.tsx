import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

function App() {
    const [accounts, setAccounts] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const result = await invoke<string[]>('get_accounts');
            setAccounts(result);
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Account Viewer</h1>
            <button onClick={fetchAccounts} disabled={loading}>
                {loading ? 'Loading...' : 'Get Accounts'}
            </button>
            <ul>
                {accounts.map((acc, i) => (
                    <li key={i}>{acc}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
