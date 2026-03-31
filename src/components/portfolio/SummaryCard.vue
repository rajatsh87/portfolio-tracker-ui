<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePortfolioStore } from '../../stores/portfolio';

const portfolioStore = usePortfolioStore();
const { 
  latestValue, 
  investmentCost, 
  unrealizedGain, 
  unrealizedGainPercent, 
  todayGain, 
  todayGainPercent,
  realizedGain 
} = storeToRefs(portfolioStore);

// --- SAFE FORMATTERS (Prevents the .toFixed undefined crash) ---
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  return '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatPercent = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  return Number(value).toFixed(2) + '%';
};
</script>

<template>
  <div class="summary-card">
    <div class="card-header">MY ASSETS</div>
    
    <div class="card-body">
      <div class="col col-assets">
        <div class="metric">
          <span class="label">Latest Value</span>
          <span class="value large">{{ formatCurrency(latestValue) }}</span>
        </div>
        <div class="metric mt-4">
          <span class="label">Investment Cost</span>
          <span class="value">{{ formatCurrency(investmentCost) }}</span>
        </div>
      </div>

      <div class="col col-unrealized">
        <h3 class="col-title">Unrealized Gain</h3>
        
        <div class="metric">
          <span class="label">Overall Gain</span>
          <span class="value gain-value" :class="{ 'positive': unrealizedGain >= 0, 'negative': unrealizedGain < 0 }">
            <span class="arrow">{{ unrealizedGain >= 0 ? '▲' : '▼' }}</span>
            {{ formatCurrency(Math.abs(unrealizedGain)) }} 
            <span class="percent">({{ formatPercent(unrealizedGainPercent) }})</span>
          </span>
        </div>
        
        <div class="metric mt-4">
          <span class="label">Today's Gain</span>
          <span class="value gain-value" :class="{ 'positive': todayGain >= 0, 'negative': todayGain < 0 }">
            <span class="arrow">{{ todayGain >= 0 ? '▲' : '▼' }}</span>
            {{ formatCurrency(Math.abs(todayGain)) }} 
            <span class="percent">({{ formatPercent(todayGainPercent) }})</span>
          </span>
        </div>
      </div>

      <div class="col col-realized">
        <h3 class="col-title">Realized Gain</h3>
        
        <div class="metric">
          <span class="label">Realized Gain</span>
          <span class="value gain-value positive">{{ formatCurrency(realizedGain) }}</span> 
        </div>
        
        <div class="realized-split mt-4">
          <div class="metric">
            <span class="label">Capital Gain</span>
            <span class="value gain-value positive">{{ formatCurrency(0) }}</span>
          </div>
          <div class="metric">
            <span class="label">Other Gain</span>
            <span class="value gain-value positive">{{ formatCurrency(0) }}</span>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>
  
  <style scoped>
.summary-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-main);
  transition: all 0.3s ease;
}
.card-header { font-weight: 800; font-size: 16px; margin-bottom: 20px; letter-spacing: 0.5px; }
.card-body {
  display: flex; /* THIS is what keeps it horizontal! */
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}
.col { flex: 1; padding: 0 20px; }
.col-assets { padding-left: 0; }
.col-realized { padding-right: 0; border-left: 1px solid var(--border-color); }
.col-unrealized { border-left: 1px solid var(--border-color); }
.col-title { font-size: 18px; font-weight: 800; margin: 0 0 15px 0; }
.metric { display: flex; flex-direction: column; }
.mt-2 { margin-top: 10px; }
.mt-4 { margin-top: 25px; }
.label { font-size: 14px; color: var(--text-muted); margin-bottom: 4px; }
.value { font-size: 20px; font-weight: 800; }
.value.large { font-size: 28px; }
.gain-value.positive { color: var(--green-gain); }
.gain-value.negative { color: var(--red-loss); }
.arrow { font-size: 14px; }
.percent { font-size: 14px; font-weight: 600; }
.realized-split { display: flex; gap: 40px; }
</style>