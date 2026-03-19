<template>
  <table class="portfolio-table">
    <thead>
      <tr>
        <th 
          v-for="col in columns" 
          :key="col.key"
          :style="{ textAlign: col.align || 'right' }"
          @click="col.sortable !== false ? toggleSort(col.key) : null"
          :class="{ 'clickable': col.sortable !== false }"
        >
          {{ col.label }}
          <span v-if="col.sortable !== false" class="sort-icon">
            {{ sortIcon(col.key) }}
          </span>
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-if="sortedData.length === 0">
        <td :colspan="columns.length" class="empty-state">No data available.</td>
      </tr>
      
      <tr v-for="(row, index) in sortedData" :key="row.id || index">
        <td 
          v-for="col in columns" 
          :key="col.key"
          :style="{ textAlign: col.align || 'right' }"
          :class="[col.bold ? 'font-bold' : '', getColorClass(row[col.key], col.type)]"
        >
          {{ formatCell(row[col.key], col.type, row.currency) }}
          
          <span v-if="col.subKey && row[col.subKey]" class="ticker-text">
            ({{ row[col.subKey] }})
          </span>
        </td>
      </tr>
    </tbody>

    <tfoot v-if="showFooter && footerData">
      <tr class="grand-total-row">
        <td 
          v-for="col in columns" 
          :key="'footer-'+col.key"
          :style="{ textAlign: col.align || 'right' }"
          :class="getColorClass(footerData[col.key], col.type)"
        >
          {{ formatCell(footerData[col.key], col.type, footerData.currency || 'INR') }}
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Define the shape of our column configuration
export interface TableColumn {
  key: string;             // The key in the data object (e.g., 'livePrice')
  label: string;           // The column header text
  type?: 'text' | 'currency' | 'percent' | 'colored-currency' | 'colored-percent' | 'date';
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;      // Defaults to true
  bold?: boolean;          // Make text bold
  subKey?: string;         // For appending ticker symbols
}

const props = defineProps<{
  data: any[];
  columns: TableColumn[];
  showFooter?: boolean;
  footerData?: any;
  defaultSortKey?: string;
}>();

const sortKey = ref(props.defaultSortKey || props.columns[0]?.key || '');
const sortOrder = ref(1);

const sortedData = computed(() => {
  let sorted = [...props.data];
  if (!sortKey.value) return sorted;

  sorted.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];

    // Handle missing data gracefully
    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return -1 * sortOrder.value;
    if (valA > valB) return 1 * sortOrder.value;
    return 0;
  });
  return sorted;
});

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 1 ? -1 : 1; 
  } else { 
    sortKey.value = key; 
    sortOrder.value = 1; 
  }
};

const sortIcon = (key: string) => (sortKey.value !== key ? '↕' : sortOrder.value === 1 ? '▲' : '▼');

// --- FORMATTING HELPERS ---
const formatCell = (value: any, type?: string, currencyStr: string = 'INR') => {
  if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) return '-';
  
  // Quick prefix for positive colored numbers
  const prefix = (value > 0 && (type === 'colored-currency' || type === 'colored-percent')) ? '+' : '';

  switch (type) {
    case 'currency':
    case 'colored-currency':
      return prefix + new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyStr, maximumFractionDigits: 2 }).format(value);
    case 'percent':
    case 'colored-percent':
      return prefix + Number(value).toFixed(2) + '%';
    case 'date':
      return new Date(value).toLocaleDateString('en-IN');
    default:
      return value;
  }
};

const getColorClass = (value: any, type?: string) => {
  if (typeof value !== 'number' || value === 0) return '';
  if (type === 'colored-currency' || type === 'colored-percent') {
    return value > 0 ? 'text-green' : 'text-red';
  }
  return '';
};
</script>

<style scoped>
.portfolio-table { 
  border-collapse: collapse; 
  width: 100%; 
  white-space: nowrap; 
  color: var(--text-main); /* Forces text to be visible */
}
.portfolio-table th { 
  background-color: var(--nav-hover); 
  color: var(--text-main); 
  font-weight: 700; 
  font-size: 13px; 
  padding: 14px 16px; 
  border-bottom: 2px solid var(--border-color); 
}
.portfolio-table th.clickable { cursor: pointer; user-select: none; }
.portfolio-table td { 
  padding: 14px 16px; 
  border-bottom: 1px solid var(--border-color); 
  font-size: 14px; 
  color: var(--text-main); 
}
.portfolio-table tbody tr:hover { background-color: var(--nav-hover); }
.grand-total-row td { 
  background-color: var(--nav-active); 
  font-weight: 800; 
  font-size: 15px; 
  border-top: 2px solid var(--border-color); 
}

.sort-icon { font-size: 10px; margin-left: 4px; color: var(--text-muted); }
.font-bold { font-weight: 600; color: var(--text-main); }
.ticker-text { font-size: 12px; color: var(--text-muted); font-weight: normal; margin-left: 4px; }
.portfolio-table td.text-green { 
  color: var(--green-gain); 
  font-weight: 600; 
}
.portfolio-table td.text-red { 
  color: var(--red-loss); 
  font-weight: 600; 
}
.empty-state { text-align: center !important; color: var(--text-muted); font-style: italic; padding: 30px !important; }
</style>