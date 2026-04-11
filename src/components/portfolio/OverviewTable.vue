<template>
  <CommonTable 
    :data="overviewData" 
    :columns="overviewColumns" 
    :showFooter="true"
    :footerData="grandTotal"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Holding } from '../../services/portfolioService';
import CommonTable, { type TableColumn } from '../common/CommonTable.vue';

const props = defineProps<{
  holdings: Holding[];
}>();

// Define the summary table columns (disabling sorting)
const overviewColumns = computed<TableColumn[]>(() => [
  { key: 'name', label: 'Segment', align: 'left', bold: true, sortable: true },
  { key: 'investment', label: 'Investment', type: 'currency', sortable: true },
  { key: 'allocation', label: 'Allocation', type: 'percent', sortable: true },
  { key: 'latestValue', label: 'Latest Value', type: 'currency', bold: true, sortable: true },
  { key: 'pnl', label: 'Profit/Loss', type: 'colored-currency', sortable: true },
  { key: 'pnlPercent', label: 'P/L %', type: 'colored-percent', sortable: true }
]);

// 1. Group the data by segment
const overviewData = computed(() => {
  const segmentsMap: Record<string, any> = {
    'equity': { id: 'equity', name: 'Stocks/ETF', investment: 0, latestValue: 0, pnl: 0, allocation: 0, currency: 'INR' },
    'mutual-fund': { id: 'mutual-fund', name: 'Mutual Funds', investment: 0, latestValue: 0, pnl: 0, allocation: 0, currency: 'INR' },
    'fds': { id: 'fds', name: 'Fixed Income', investment: 0, latestValue: 0, pnl: 0, allocation: 0, currency: 'INR' },
    'foreign-equity': { id: 'foreign-equity', name: 'Foreign Equity', investment: 0, latestValue: 0, pnl: 0, allocation: 0, currency: 'INR' }
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

// 2. Calculate the Grand Total for the Footer
const grandTotal = computed(() => {
  const total = { name: 'Grand Total', investment: 0, latestValue: 0, pnl: 0, pnlPercent: 0, allocation: 100, currency: 'INR' };
  
  overviewData.value.forEach(seg => {
    total.investment += seg.investment;
    total.latestValue += seg.latestValue;
    total.pnl += seg.pnl;
  });
  
  total.pnlPercent = total.investment > 0 ? (total.pnl / total.investment) * 100 : 0;
  return total;
});
</script>