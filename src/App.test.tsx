import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd) => {
    if (cmd === 'get_accounts') {
      return Promise.resolve(['Test Account 1', 'Test Account 2']);
    }
    return Promise.reject(new Error('Unknown command'));
  }),
}));

describe('App Component', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText('Account Viewer')).toBeInTheDocument();
  });

  it('fetches and displays accounts when button is clicked', async () => {
    render(<App />);
    
    // Check that the button exists
    const button = screen.getByText('Get Accounts');
    expect(button).toBeInTheDocument();
    
    // Click the button to fetch accounts
    fireEvent.click(button);
    
    // Wait for accounts to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Account 1')).toBeInTheDocument();
      expect(screen.getByText('Test Account 2')).toBeInTheDocument();
    });
  });
});