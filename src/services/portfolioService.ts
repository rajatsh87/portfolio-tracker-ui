import axios from 'axios';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Optional: timeout after 10 seconds
});

apiClient.interceptors.response.use(
  response => {
    console.log('✅ API SUCCESS:', response.config.url, response.data);
    return response;
  },
  error => {
    console.error('❌ API FAILED:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);
// -----------------------------------------

// --- TypeScript Interfaces (Matching Spring Boot DTOs) ---


export interface TransactionRequest {
  accountId: number;
  segment: string;
  actionId: string;
  currency: string;
  date: string;
  
  ticker?: string;
  price?: number;
  quantity?: number;
  
  bankName?: string;
  principalAmount?: number;
  interestRate?: number;
  maturityDate?: string;
}

export interface Account {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Asset {
  id: number;
  ticker: string;
  name: string;
  segment: string;
  currency: string;
}

export interface TransactionHistory {
  id: number;
  assetName: string;
  ticker: string;
  actionType: string;
  transactionDate: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
}

export interface Transaction {
  id: number;
  actionId: string;
  date: string;
  quantity: number;
  price: number;
}

export interface Holding {
  id: number;
  segment: string;
  currency: string;
  
  // Market Assets
  ticker?: string;
  name?: string;
  avgBuyPrice?: number;
  currentPrice?: number;
  quantity?: number;
  daysChangePct?: number;
  
  // Fixed Deposits
  bankName?: string;
  accountNumber?: string;
  principalAmount?: number;
  interestRate?: number;
  startDate?: string;
  maturityDate?: string;
  maturityAmount?: number;
  totalInterest?: number;
  daysRemaining?: number;

  // Tax Fields
  realizedGain?: number;
  capitalGain?: number;
  otherGain?: number;
}

// --- The API Service Methods ---

export const portfolioService = {
  
  // 1. Dashboard API: Fetch current holdings based on ledger math
  getTransactionsByTicker: async (accountId: number, ticker: string): Promise<Transaction[]> => {
    const response = await apiClient.get('/transactions', {
      params: { accountId, ticker }
    });
    return response.data;
  },

  // 2. Add Transaction API: Submit a Buy/Sell or New FD
  async addTransaction(payload: TransactionRequest): Promise<void> {
    await apiClient.post('/transactions', payload);
  },

  // 3. Accounts API: Get portfolios owned by user
  async getUserAccounts(userId: number): Promise<Account[]> {
    const response = await apiClient.get<Account[]>(`/accounts/user/${userId}`);
    return response.data;
  },

  // 4. Ledger API: Get raw transaction history
  async getTransactionHistory(accountId: number): Promise<TransactionHistory[]> {
    const response = await apiClient.get<TransactionHistory[]>(`/transactions/account/${accountId}`);
    return response.data;
  },

  // 5. Search API: Find assets for the Add Transaction modal
  async searchAssets(query: string): Promise<Asset[]> {
    const response = await apiClient.get<Asset[]>(`/assets/search`, {
      params: { query }
    });
    return response.data;
  },
  async getHoldings(accountId: number): Promise<Holding[]> {
    const response = await apiClient.get<Holding[]>(`/portfolio/${accountId}/holdings`);
    return response.data;
  },
  async deleteTransaction(transactionId: number): Promise<void> {
    await apiClient.delete(`/transactions/${transactionId}`);
  },

  async deleteTransactions(transactionIds: number[]): Promise<void> {
    // Axios doesn't natively support bulk delete in a simple way, so we run them concurrently
    await Promise.all(transactionIds.map(id => apiClient.delete(`/transactions/${id}`)));
  },
  async updateTransaction(id: number, payload: TransactionRequest): Promise<void> {
    await apiClient.put(`/transactions/${id}`, payload);
  }
};