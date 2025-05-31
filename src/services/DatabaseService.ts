import Database from '@tauri-apps/plugin-sql';

export enum AccountType {
  Checking = 'checking'
}

export interface Account {
  id?: number;
  name: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  description?: string;
  createdAt?: string;
}

class DatabaseService {
  private db: Database | null = null;
  
  async initialize(): Promise<void> {
    if (this.db) return;
    
    try {
      // Connect to a SQLite database file in the app's data directory
      this.db = await Database.load("sqlite:app_data.db");
      
      // Create tables if they don't exist
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      
      // Provide more detailed error message
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes("not found")) {
          throw new Error("Database plugin not properly configured. Please check Tauri configuration.");
        } else if (errorMessage.includes("permission")) {
          throw new Error("Permission denied when accessing database. Check application permissions.");
        }
      }
      
      throw error;
    }
  }
  
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // Create accounts table
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          accountType TEXT NOT NULL,
          balance REAL NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'USD',
          description TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // You can add more table creation queries here as needed
      // For example, transactions table related to accounts
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw new Error('Failed to create database tables: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  async getAccounts(): Promise<Account[]> {
    if (!this.db) await this.initialize();
    try {
      return await this.db!.select<Account[]>('SELECT * FROM accounts ORDER BY name');
    } catch (error) {
      console.error('Failed to get accounts:', error);
      throw new Error('Failed to get accounts: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  async createAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<number | undefined> {
    if (!this.db) await this.initialize();
    try {
      const result = await this.db!.execute(
        'INSERT INTO accounts (name, accountType, balance, currency, description) VALUES (?, ?, ?, ?, ?)',
        [
          account.name,
          account.accountType,
          account.balance,
          account.currency,
          account.description || null
        ]
      );
      return result.lastInsertId;
    } catch (error) {
      console.error('Failed to create account:', error);
      throw new Error('Failed to create account: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  async deleteAccount(id: number): Promise<void> {
    if (!this.db) await this.initialize();
    try {
      await this.db!.execute('DELETE FROM accounts WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Failed to delete account with ID ${id}:`, error);
      throw new Error(`Failed to delete account with ID ${id}: ` + (error instanceof Error ? error.message : String(error)));
    }
  }
}

// Export a singleton instance
export const dbService = new DatabaseService();