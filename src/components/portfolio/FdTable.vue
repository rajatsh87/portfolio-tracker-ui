<template>
  <CommonTable 
    :data="tableData" 
    :columns="fdColumns" 
    defaultSortKey="bankName" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Holding } from '../../services/portfolioService';
import CommonTable, { type TableColumn } from '../common/CommonTable.vue';

const props = defineProps<{ holdings: Holding[] }>();

// Define exactly how the FD table should look
const fdColumns = computed<TableColumn[]>(() => [
  { key: 'bankName', label: 'Bank / Institution', align: 'left', bold: true, subKey: 'FDNumber'  },
  { key: 'principalAmount', label: 'Principal Amount', type: 'currency' },
  { key: 'interestRate', label: 'Interest Rate', type: 'colored-percent' },
  { key: 'maturityDate', label: 'Maturity Date', type: 'date' },
  { key: 'daysRemaining', label: 'Days Remaining', type: 'days'},
  { key: 'maturityAmount', label: 'Maturity Amount', type: 'currency'},
  { key: 'allocation', label: '% of FDs', type: 'percent' }
]);

const totalFdValue = computed(() => {
  return props.holdings.reduce((sum, fd) => sum + (fd.principalAmount || 0), 0);
});

// Calculate the allocation percentages
const tableData = computed(() => {
  return props.holdings.map(fd => ({
    ...fd,
    allocation: totalFdValue.value > 0 ? ((fd.principalAmount || 0) / totalFdValue.value) * 100 : 0
  }));
});
</script>