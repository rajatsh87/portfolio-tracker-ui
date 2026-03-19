<template>
  <CommonTable 
    :data="tableData" 
    :columns="fdColumns" 
    defaultSortKey="bankName" 
    :showFooter="tableData.length > 0"
    :footerData="grandTotal"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Holding } from '../../services/portfolioService';
import CommonTable, { type TableColumn } from '../common/CommonTable.vue';

const props = defineProps<{ holdings: Holding[] }>();

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

const tableData = computed(() => {
  return props.holdings.map(fd => ({
    ...fd,
    allocation: totalFdValue.value > 0 ? ((fd.principalAmount || 0) / totalFdValue.value) * 100 : 0
  }));
});

// NEW: Calculate the Grand Total for FDs
const grandTotal = computed(() => {
  const total = {
    bankName: 'Grand Total',
    principalAmount: 0,
    interestRate: null, // You could mathematically calculate a weighted average here later if you want!
    maturityDate: null, // Doesn't make sense to sum dates
    allocation: 100,
    currency: 'INR',
    daysRemaining: null,
    maturityAmount: 0
  };

  tableData.value.forEach(fd => {
    total.principalAmount += (fd.principalAmount || 0);
    total.maturityAmount += (fd.maturityAmount || 0);
  });

  return total;
});
</script>
