import apiClient from './apiClient';

export interface Holding {
  id: number;
  ticker?: string;
  name?: string;
  avgBuyPrice?: number;
  currentPrice?: number;
  quantity?: number;
  currency: string;
  segment: string;
  daysChangePct?: number; // <-- Add this
  bankName?: string;
  principalAmount?: number;
  interestRate?: number;
  maturityDate?: string;
  }

export interface TransactionAction {
  id: string;
  name: string;
}

export interface TransactionPayload {
  actionId: string;
  date: string;
  segment: string;
  currency: string;
  
  // Equity/MF Fields (Make these optional now, since FDs won't use them)
  ticker?: string;
  price?: number;
  quantity?: number;

  // FD Fields
  bankName?: string;
  principalAmount?: number;
  interestRate?: number;
  maturityDate?: string;
}

export const portfolioService = {
  // 1. Fetch current portfolio
  async getHoldings(): Promise<Holding[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
            { id: 1, ticker: 'BAJFINANCE.NS', name: 'Bajaj Finance', avgBuyPrice: 6500.00, currentPrice: 7100.50, quantity: 15, currency: 'INR', segment: 'equity', daysChangePct: 1.25 },
          { id: 2, ticker: 'GRMN', name: 'Garmin Ltd.', avgBuyPrice: 130.25, currentPrice: 142.10, quantity: 10, currency: 'USD', segment: 'foreign', daysChangePct: -0.85 },
          { id: 3, ticker: 'INF846K01DP8', name: 'Axis Bluechip', avgBuyPrice: 45.20, currentPrice: 52.80, quantity: 1000, currency: 'INR', segment: 'mutual-funds', daysChangePct: 0.45 },
          // Mock FD data
          { id: 4, bankName: 'SBI FD', principalAmount: 100000, interestRate: 7.1, maturityDate: '2028-01-01', currency: 'INR', segment: 'fds' }
        ]);
      }, 1000);
    });
  },

  // 2. Fetch the dropdown list of available actions
  async getAvailableActions(): Promise<TransactionAction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'BUY', name: 'Buy' },
          { id: 'SELL', name: 'Sell' },
          { id: 'DIVIDEND', name: 'Dividend Received' },
          { id: 'SPLIT', name: 'Stock Split' }
        ]);
      }, 500); 
    });
  },

  // 3. Submit the new action to the backend
  async submitTransaction(payload: TransactionPayload): Promise<boolean> {
    return new Promise((resolve) => {
      console.log("Submitting to backend API:", payload);
      setTimeout(() => resolve(true), 800); // Simulate network delay
    });
  }
};