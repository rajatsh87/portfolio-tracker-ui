<template>
  <table class="portfolio-table">
    <thead>
      <tr>
        <th @click="toggleSort('name')" style="text-align: left;">
          {{ assetColumnName }} <span class="sort-icon">{{ sortIcon('name') }}</span>
        </th>
        <th @click="toggleSort('currentPrice')">Live Price <span class="sort-icon">{{ sortIcon('currentPrice') }}</span></th>
        <th @click="toggleSort('daysChangePct')">Day's Change <span class="sort-icon">{{ sortIcon('daysChangePct') }}</span></th>
        <th @click="toggleSort('investment')">Investment <span class="sort-icon">{{ sortIcon('investment') }}</span></th>
        <th @click="toggleSort('allocation')">% <span class="sort-icon">{{ sortIcon('allocation') }}</span></th>
        <th @click="toggleSort('latestValue')">Latest Value <span class="sort-icon">{{ sortIcon('latestValue') }}</span></th>
        <th @click="toggleSort('pnl')">Profit/Loss <span class="sort-icon">{{ sortIcon('pnl') }}</span></th>
        <th @click="toggleSort('pnlPercent')">P/L % <span class="sort-icon">{{ sortIcon('pnlPercent') }}</span></th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="tableData.length === 0">
        <td colspan="8" class="empty-state">No assets found in this segment.</td>
      </tr>
      <tr v-for="asset in tableData" :key="asset.id">
        <td class="font-bold" style="text-align: left;">
          {{ asset.name }} 
          <span class="ticker-text" v-if="asset.ticker">({{ asset.ticker }})</span>
        </td>
        <td>{{ formatCurrency(asset.currentPrice || 0, asset.currency) }}</td>
        <td :class="colorClass(asset.daysChangePct)">
          <span v-if="asset.daysChangePct">{{ asset.daysChangePct > 0 ? '+' : '' }}{{ asset.daysChangePct.toFixed(2) }}%</span>
          <span v-else>-</span>
        </td>
        <td>{{ formatCurrency(asset.investment, asset.currency) }}</td>
        <td>{{ asset.allocation.toFixed(2) }}%</td>
        <td>{{ formatCurrency(asset.latestValue, asset.currency) }}</td>
        <td :class="colorClass(asset.pnl)">{{ asset.pnl > 0 ? '+' : '' }}{{ formatCurrency(asset.pnl, asset.currency) }}</td>
        <td :class="colorClass(asset.pnlPercent)">{{ asset.pnlPercent > 0 ? '+' : '' }}{{ asset.pnlPercent.toFixed(2) }}%</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Holding } from '../../services/portfolioService';

const props = defineProps<{ holdings: Holding[]; assetColumnName: string; }>();
const sortKey = ref('name');
const sortOrder = ref(1);

const totalFilteredValue = computed(() => props.holdings.reduce((sum, asset) => sum + ((asset.currentPrice || 0) * (asset.quantity || 0)), 0));

const tableData = computed(() => {
  let data = props.holdings.map(asset => {
    const investment = (asset.avgBuyPrice || 0) * (asset.quantity || 0);
    const latestValue = (asset.currentPrice || 0) * (asset.quantity || 0);
    const pnl = latestValue - investment;
    const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;
    const allocation = totalFilteredValue.value > 0 ? (latestValue / totalFilteredValue.value) * 100 : 0;

    return { ...asset, investment, latestValue, pnl, pnlPercent, allocation };
  });

  data.sort((a: any, b: any) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return -1 * sortOrder.value;
    if (valA > valB) return 1 * sortOrder.value;
    return 0;
  });
  return data;
});

const toggleSort = (key: string) => {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 1 ? -1 : 1; 
  else { sortKey.value = key; sortOrder.value = 1; }
};

const sortIcon = (key: string) => (sortKey.value !== key ? '↕' : sortOrder.value === 1 ? '▲' : '▼');
const colorClass = (value?: number) => (!value || value === 0 ? '' : value > 0 ? 'text-green' : 'text-red');
const formatCurrency = (value: number, currency: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(value);
</script>

<style scoped>
/* Same base table styles as FdTable.vue */
.portfolio-table { border-collapse: collapse; width: 100%; white-space: nowrap; }
.portfolio-table th { background-color: #f8fafc; color: #4a5568; font-weight: 700; font-size: 13px; padding: 14px 16px; text-align: right; cursor: pointer; user-select: none; border-bottom: 2px solid #e2e8f0; }
.portfolio-table td { padding: 14px 16px; text-align: right; border-bottom: 1px solid #edf2f7; font-size: 14px; }
.portfolio-table tbody tr:hover { background-color: #f7fafc; }
.sort-icon { font-size: 10px; margin-left: 4px; color: #a0aec0; }
.font-bold { font-weight: 600; color: #2d3748; }
.ticker-text { font-size: 12px; color: #718096; font-weight: normal; }
.text-green { color: #38a169; font-weight: 600; }
.text-red { color: #e53e3e; font-weight: 600; }
.empty-state { text-align: center !important; color: #718096; font-style: italic; padding: 30px !important; }
</style>