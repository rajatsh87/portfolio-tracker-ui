<template>
  <CommonTable 
    :data="tableData" 
    :columns="stockColumns" 
    defaultSortKey="name" 
    :showFooter="tableData.length > 0" 
    :footerData="grandTotal"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Holding } from '../../services/portfolioService';
import CommonTable, { type TableColumn } from '../common/CommonTable.vue';

const props = defineProps<{ holdings: Holding[]; assetColumnName: string; }>();

const stockColumns = computed<TableColumn[]>(() => [
  { key: 'name', label: props.assetColumnName, align: 'left', bold: true, subKey: 'ticker' },
  { key: 'currentPrice', label: 'Live Price', type: 'currency' },
  { key: 'daysChangePct', label: "Day's Change", type: 'colored-percent' },
  { key: 'investment', label: 'Investment', type: 'currency' },
  { key: 'allocation', label: 'Allocation %', type: 'percent' },
  { key: 'latestValue', label: 'Latest Value', type: 'currency' },
  { key: 'pnl', label: 'Profit/Loss', type: 'colored-currency' },
  { key: 'pnlPercent', label: 'P/L %', type: 'colored-percent' }
]);

const totalFilteredValue = computed(() => props.holdings.reduce((sum, asset) => sum + ((asset.currentPrice || 0) * (asset.quantity || 0)), 0));

const tableData = computed(() => {
  return props.holdings.map(asset => {
    const investment = (asset.avgBuyPrice || 0) * (asset.quantity || 0);
    const latestValue = (asset.currentPrice || 0) * (asset.quantity || 0);
    const pnl = latestValue - investment;
    const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;
    const allocation = totalFilteredValue.value > 0 ? (latestValue / totalFilteredValue.value) * 100 : 0;

    return { ...asset, investment, latestValue, pnl, pnlPercent, allocation };
  });
});

// NEW: Calculate the Grand Total for this specific segment
const grandTotal = computed(() => {
  const total = { 
    name: 'Grand Total', 
    currentPrice: null,    // Doesn't make sense to sum prices
    daysChangePct: null,   // Doesn't make sense to sum daily percentages directly
    investment: 0, 
    latestValue: 0, 
    pnl: 0, 
    pnlPercent: 0, 
    allocation: 100,
    currency: tableData.value.length > 0 ? tableData.value[0].currency : 'INR' // Smart currency detection!
  };
  
  tableData.value.forEach(asset => {
    total.investment += asset.investment;
    total.latestValue += asset.latestValue;
    total.pnl += asset.pnl;
  });
  
  total.pnlPercent = total.investment > 0 ? (total.pnl / total.investment) * 100 : 0;
  return total;
});
</script>