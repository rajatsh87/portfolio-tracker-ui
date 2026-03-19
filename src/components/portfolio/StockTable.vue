<template>
  <CommonTable 
    :data="tableData" 
    :columns="stockColumns" 
    defaultSortKey="name" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Holding } from '../../services/portfolioService';
import CommonTable, { type TableColumn } from '../common/CommonTable.vue';

const props = defineProps<{ holdings: Holding[]; assetColumnName: string; }>();

// Define exactly how this specific table should look and format its data
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

// Calculate the math (same as before)
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
</script>