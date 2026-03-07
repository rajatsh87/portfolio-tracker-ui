<template>
    <div class="dashboard">
      <h1>My Portfolio Dashboard</h1>
      
      <div class="dashboard-content">
        <PortfolioChart :holdings="myHoldings" />
        
        <table class="portfolio-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Current Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in myHoldings" :key="asset.id">
              <td>{{ asset.name }} ({{ asset.ticker }})</td>
              <td>{{ asset.quantity }}</td>
              <td>{{ formatCurrency(asset.currentPrice * asset.quantity, asset.currency) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import PortfolioChart from '../components/charts/PortfolioChart.vue';
  
  interface Holding {
    id: number;
    ticker: string;
    name: string;
    currentPrice: number;
    quantity: number;
    currency: string;
  }
  
  // Telling Vue that this reactive array holds 'Holding' objects
  const myHoldings = ref<Holding[]>([
    { id: 1, ticker: 'BAJFINANCE.NS', name: 'Bajaj Finance', currentPrice: 7100.50, quantity: 15, currency: 'INR' },
    { id: 2, ticker: 'GRMN', name: 'Garmin Ltd.', currentPrice: 142.10, quantity: 10, currency: 'USD' },
    { id: 3, ticker: 'INF846K01DP8', name: 'Axis Bluechip', currentPrice: 52.80, quantity: 1000, currency: 'INR' }
  ]);
  
  // Added types for the parameters (value: number, currency: string)
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(value);
  };
  </script>
  
  <style scoped>
  .dashboard { padding: 20px; font-family: sans-serif; }
  .dashboard-content { display: flex; gap: 40px; align-items: center; margin-top: 20px; }
  .portfolio-table { border-collapse: collapse; width: 100%; max-width: 500px; }
  .portfolio-table th, .portfolio-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .portfolio-table th { background-color: #f2f2f2; }
  </style>