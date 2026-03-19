<template>
  <table class="portfolio-table summary-table">
    <thead>
      <tr>
        <th style="text-align: left;">Segment</th>
        <th>Investment</th>
        <th>Allocation</th>
        <th>Latest Value</th>
        <th>Profit/Loss</th>
        <th>P/L %</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="segment in overviewData" :key="segment.id">
        <td class="font-bold">{{ segment.name }}</td>
        <td>{{ formatCurrency(segment.investment) }}</td>
        <td>{{ segment.allocation.toFixed(2) }}%</td>
        <td class="font-bold">{{ formatCurrency(segment.latestValue) }}</td>
        <td :class="colorClass(segment.pnl)">
          {{ segment.pnl > 0 ? '+' : '' }}{{ formatCurrency(segment.pnl) }}
        </td>
        <td :class="colorClass(segment.pnlPercent)">
          {{ segment.pnlPercent > 0 ? '+' : '' }}{{ segment.pnlPercent.toFixed(2) }}%
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="grand-total-row">
        <td>Grand Total</td>
        <td>{{ formatCurrency(grandTotal.investment) }}</td>
        <td>100.00%</td>
        <td>{{ formatCurrency(grandTotal.latestValue) }}</td>
        <td :class="colorClass(grandTotal.pnl)">
          {{ grandTotal.pnl > 0 ? '+' : '' }}{{ formatCurrency(grandTotal.pnl) }}
        </td>
        <td :class="colorClass(grandTotal.pnlPercent)">
          {{ grandTotal.pnlPercent > 0 ? '+' : '' }}{{ grandTotal.pnlPercent.toFixed(2) }}%
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Holding } from '../../services/portfolioService';

const props = defineProps<{
  holdings: Holding[];
}>();

const overviewData = computed(() => {
  const segmentsMap: Record<string, any> = {
    'equity': { id: 'equity', name: 'Stocks/ETF', investment: 0, latestValue: 0, pnl: 0, allocation: 0 },
    'mutual-funds': { id: 'mutual-funds', name: 'Mutual Funds', investment: 0, latestValue: 0, pnl: 0, allocation: 0 },
    'fds': { id: 'fds', name: 'Fixed Income', investment: 0, latestValue: 0, pnl: 0, allocation: 0 },
    'foreign': { id: 'foreign', name: 'Foreign Equity', investment: 0, latestValue: 0, pnl: 0, allocation: 0 }
  };

  let grandTotalValue = 0;

  props.holdings.forEach(asset => {
    const isFd = asset.segment === 'fds';
    const investment = isFd ? (asset.principalAmount || 0) : ((asset.avgBuyPrice || 0) * (asset.quantity || 0));
    const latestValue = isFd ? (asset.principalAmount || 0) : ((asset.currentPrice || 0) * (asset.quantity || 0)); 
    
    if (segmentsMap[asset.segment]) {
      segmentsMap[asset.segment].investment += investment;
      segmentsMap[asset.segment].latestValue += latestValue;
      segmentsMap[asset.segment].pnl += (latestValue - investment);
    }
    grandTotalValue += latestValue;
  });

  return Object.values(segmentsMap)
    .filter(seg => seg.investment > 0)
    .map(seg => ({
      ...seg,
      pnlPercent: seg.investment > 0 ? (seg.pnl / seg.investment) * 100 : 0,
      allocation: grandTotalValue > 0 ? (seg.latestValue / grandTotalValue) * 100 : 0
    }));
});

const grandTotal = computed(() => {
  const total = { investment: 0, latestValue: 0, pnl: 0, pnlPercent: 0 };
  overviewData.value.forEach(seg => {
    total.investment += seg.investment;
    total.latestValue += seg.latestValue;
    total.pnl += seg.pnl;
  });
  total.pnlPercent = total.investment > 0 ? (total.pnl / total.investment) * 100 : 0;
  return total;
});

const colorClass = (value: number) => (!value || value === 0 ? '' : value > 0 ? 'text-green' : 'text-red');
const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
</script>

<style scoped>
/* Only table-specific styles live here now */
.portfolio-table { border-collapse: collapse; width: 100%; white-space: nowrap; }
.portfolio-table th { background-color: #f8fafc; color: #4a5568; font-weight: 700; font-size: 13px; padding: 14px 16px; text-align: right; border-bottom: 2px solid #e2e8f0; }
.portfolio-table th:first-child { text-align: left; }
.portfolio-table td { padding: 14px 16px; text-align: right; border-bottom: 1px solid #edf2f7; font-size: 14px; }
.portfolio-table td:first-child { text-align: left; }
.portfolio-table tbody tr:hover { background-color: #f7fafc; }
.grand-total-row td { background-color: #edf2f7; font-weight: 800; font-size: 15px; color: #2d3748; border-top: 2px solid #cbd5e0; }
.font-bold { font-weight: 600; color: #2d3748; }
.text-green { color: #38a169; font-weight: 600; }
.text-red { color: #e53e3e; font-weight: 600; }
</style>