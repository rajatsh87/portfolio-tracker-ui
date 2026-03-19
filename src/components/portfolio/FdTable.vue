<template>
  <table class="portfolio-table">
    <thead>
      <tr>
        <th @click="toggleSort('bankName')" style="text-align: left;">
          Bank / Institution <span class="sort-icon">{{ sortIcon('bankName') }}</span>
        </th>
        <th @click="toggleSort('principalAmount')">
          Principal Amount <span class="sort-icon">{{ sortIcon('principalAmount') }}</span>
        </th>
        <th @click="toggleSort('interestRate')">
          Interest Rate <span class="sort-icon">{{ sortIcon('interestRate') }}</span>
        </th>
        <th @click="toggleSort('maturityDate')">
          Maturity Date <span class="sort-icon">{{ sortIcon('maturityDate') }}</span>
        </th>
        <th @click="toggleSort('allocation')">
          % of FDs <span class="sort-icon">{{ sortIcon('allocation') }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="tableData.length === 0">
        <td colspan="5" class="empty-state">No Fixed Deposits found.</td>
      </tr>
      <tr v-for="fd in tableData" :key="fd.id">
        <td class="font-bold">{{ fd.bankName }}</td>
        <td>{{ formatCurrency(fd.principalAmount, fd.currency) }}</td>
        <td class="text-green">{{ fd.interestRate }}%</td>
        <td>{{ formatDate(fd.maturityDate) }}</td>
        <td>{{ fd.allocation.toFixed(2) }}%</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Holding } from '../../services/portfolioService';

const props = defineProps<{ holdings: Holding[] }>();
const sortKey = ref('bankName');
const sortOrder = ref(1);

const totalFdValue = computed(() => props.holdings.reduce((sum, fd) => sum + (fd.principalAmount || 0), 0));

const tableData = computed(() => {
  let data = props.holdings.map(fd => ({
    ...fd,
    allocation: totalFdValue.value > 0 ? ((fd.principalAmount || 0) / totalFdValue.value) * 100 : 0
  }));

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
const formatCurrency = (value: number, currency: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(value);
const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN') : '-';
</script>

<style scoped>
/* Same base table styles */
.portfolio-table { border-collapse: collapse; width: 100%; white-space: nowrap; }
.portfolio-table th { background-color: #f8fafc; color: #4a5568; font-weight: 700; font-size: 13px; padding: 14px 16px; text-align: right; cursor: pointer; user-select: none; border-bottom: 2px solid #e2e8f0; }
.portfolio-table td { padding: 14px 16px; text-align: right; border-bottom: 1px solid #edf2f7; font-size: 14px; }
.portfolio-table tbody tr:hover { background-color: #f7fafc; }
.sort-icon { font-size: 10px; margin-left: 4px; color: #a0aec0; }
.font-bold { font-weight: 600; color: #2d3748; }
.text-green { color: #38a169; font-weight: 600; }
.empty-state { text-align: center !important; color: #718096; font-style: italic; padding: 30px !important; }
</style>