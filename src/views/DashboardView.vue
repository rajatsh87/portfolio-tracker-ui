<template>
  <div class="dashboard">
    <div v-if="isLoading">Loading your portfolio...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      
      <div class="table-header-container">
        <h2>My Holdings</h2>
        <button class="add-transaction-btn" @click="isModalOpen = true">
          + Add Transaction
        </button>
      </div>
      
      <div class="dashboard-content">
        <PortfolioChart :holdings="filteredHoldings" />
        
        <table class="portfolio-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Current Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in filteredHoldings" :key="asset.id">
              <td>{{ asset.name }} ({{ asset.ticker }})</td>
              <td>{{ asset.quantity }}</td>
              <td>{{ formatCurrency(asset.currentPrice * asset.quantity, asset.currency) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen = false">
        <div class="modal-content">
          <AddActionForm @close="isModalOpen = false" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import PortfolioChart from '../components/charts/PortfolioChart.vue';
import AddActionForm from '../components/portfolio/AddActionForm.vue';
import { usePortfolioStore } from '../stores/portfolio';

const portfolioStore = usePortfolioStore();
const { holdings, isLoading, error } = storeToRefs(portfolioStore);
const route = useRoute();

// Our reactive state for the modal
const isModalOpen = ref(false);

const filteredHoldings = computed(() => {
  if (route.path === '/') return holdings.value;

  const segmentMap: Record<string, string> = {
    '/equity': 'equity',
    '/mutual-funds': 'mutual-funds',
    '/fds': 'fds',
    '/foreign': 'foreign'
  };

  const currentSegment = segmentMap[route.path];
  return holdings.value.filter(asset => asset.segment === currentSegment);
});

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(value);
};
</script>

<style scoped>
.dashboard { padding: 0 20px; font-family: sans-serif; }
.dashboard-content { display: flex; gap: 40px; align-items: flex-start; margin-top: 20px; }
.portfolio-table { border-collapse: collapse; width: 100%; flex-grow: 1; }
.portfolio-table th, .portfolio-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
.portfolio-table th { background-color: #f8fafc; color: #4a5568; font-weight: 600; }

/* Header & Button Styles */
.table-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #edf2f7;
}
.table-header-container h2 {
  margin: 0;
  color: #2d3748;
}
.add-transaction-btn {
  background-color: #2b6cb0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.add-transaction-btn:hover { background-color: #2c5282; }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it sits on top of everything */
}
.modal-content {
  /* We don't need background color here because the form component provides it */
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 900px; /* Wide enough for the inline form */
  width: 95%;
}
</style>