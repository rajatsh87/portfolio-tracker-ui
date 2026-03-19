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
        <!-- <PortfolioChart v-if="route.path !== '/fds'" :holdings="route.path === '/' ? holdings : filteredHoldings" /> -->
        
        <div class="table-container">
          <OverviewTable v-if="route.path === '/'" :holdings="holdings" />
          
          <FdTable v-else-if="route.path === '/fds'" :holdings="filteredHoldings" />
          
          <StockTable 
            v-else 
            :holdings="filteredHoldings" 
            :assetColumnName="assetColumnName" 
          />
        </div>
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
import OverviewTable from '../components/portfolio/OverviewTable.vue';
import StockTable from '../components/portfolio/StockTable.vue';
import FdTable from '../components/portfolio/FdTable.vue';
import AddActionForm from '../components/portfolio/AddActionForm.vue';
import { usePortfolioStore } from '../stores/portfolio';

const portfolioStore = usePortfolioStore();
const { holdings, isLoading, error } = storeToRefs(portfolioStore);
const route = useRoute();
const isModalOpen = ref(false);

const assetColumnName = computed(() => {
  if (route.path === '/mutual-funds') return 'Mutual Fund';
  if (route.path === '/equity' || route.path === '/foreign') return 'Stock Name';
  return 'Asset Name';
});

const filteredHoldings = computed(() => {
  if (route.path === '/') return holdings.value;
  const segmentMap: Record<string, string> = {
    '/equity': 'equity', '/mutual-funds': 'mutual-funds', '/fds': 'fds', '/foreign': 'foreign'
  };
  return holdings.value.filter(asset => asset.segment === segmentMap[route.path]);
});
</script>

<style scoped>
/* Keep your existing dashboard layout styles here */
.dashboard { padding: 0 20px; font-family: sans-serif; }
.dashboard-content { display: flex; flex-direction: column; gap: 30px; margin-top: 20px; }
.table-container { overflow-x: auto; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
.table-header-container { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-bottom: 10px; border-bottom: 2px solid #edf2f7; }
.table-header-container h2 { margin: 0; color: #2d3748; }
.add-transaction-btn { background-color: #2b6cb0; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.add-transaction-btn:hover { background-color: #2c5282; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); max-width: 900px; width: 95%; }
</style>