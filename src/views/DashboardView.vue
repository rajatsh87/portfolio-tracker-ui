<template>
  <div class="dashboard">
    <div v-if="isLoading">Loading your portfolio...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <div class="table-header-container">
        <h2>My Holdings</h2>
        <button class="add-transaction-btn" @click="openAddModal"">
          + Add Transaction
        </button>
      </div>
      
      <div class="dashboard-content">
        <!-- <PortfolioChart v-if="route.path !== '/fds'" :holdings="route.path === '/' ? holdings : filteredHoldings" /> -->
        
        <div class="table-container">
          <OverviewTable v-if="route.path === '/'" :holdings="holdings" />
          
         <FdTable 
            v-else-if="route.path === '/fds'" 
            :holdings="filteredHoldings" 
            @edit="handleEditHolding"
            @delete="handleDeleteSingleTransaction"
          />
          
          <StockTable 
            v-else 
            :holdings="filteredHoldings" 
            :assetColumnName="assetColumnName" 
            @edit-holding="handleEditHolding"
            @delete-holding="handleDeleteHolding"
            @edit-transaction="handleEditTransaction"
            @delete-transactions="handleDeleteTransactions"
          />
        </div>
      </div>

      <<div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen = false">
        <div class="modal-content">
          <AddActionForm 
            :editData="transactionToEdit" 
            @close="isModalOpen = false" 
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import PortfolioChart from '../components/charts/PortfolioChart.vue';
import OverviewTable from '../components/portfolio/OverviewTable.vue';
import StockTable from '../components/portfolio/StockTable.vue';
import FdTable from '../components/portfolio/FdTable.vue';
import AddActionForm from '../components/portfolio/AddActionForm.vue';
import { usePortfolioStore } from '../stores/portfolio';
import { portfolioService, type Holding, type Transaction } from '../services/portfolioService'; // Imported Service

const portfolioStore = usePortfolioStore();
onMounted(() => {
  portfolioStore.fetchHoldings(); 
});
const { holdings, isLoading, error } = storeToRefs(portfolioStore);
const route = useRoute();
const isModalOpen = ref(false);

// We will use this later to pass data into the modal for editing
const transactionToEdit = ref<any>(null); 

const assetColumnName = computed(() => {
  if (route.path === '/mutual-funds') return 'Mutual Fund';
  if (route.path === '/equity' || route.path === '/foreign') return 'Stock Name';
  return 'Asset Name';
});

const filteredHoldings = computed(() => {
  if (route.path === '/') return holdings.value;
  const segmentMap: Record<string, string> = {
    '/equity': 'equity', '/mutual-funds': 'mutual-fund', '/fds': 'fds', '/foreign': 'foreign-equity'
  };
  return holdings.value.filter(asset => asset.segment === segmentMap[route.path]);
});

// --- ACTION HANDLERS ---

const openAddModal = () => {
  transactionToEdit.value = null; // Clear edit state for a fresh form
  isModalOpen.value = true;
};

// Handle Deletes
const handleDeleteHolding = async (asset: Holding) => {
  alert("To delete an entire asset, please expand the row and delete its transactions.");
};

const handleDeleteTransactions = async (txIds: number[]) => {
  try {
    await portfolioService.deleteTransactions(txIds);
    await portfolioStore.fetchHoldings(); // Refresh UI!
    // Note: The expanded row will close upon refresh, which is standard behavior
  } catch (err) {
    console.error("Failed to delete", err);
    alert("Could not delete transactions.");
  }
};

const handleDeleteSingleTransaction = async (txId: number) => {
  if(confirm("Are you sure you want to delete this transaction?")) {
    await handleDeleteTransactions([txId]);
  }
};

// Handle Edits (Opens the modal - we will wire the modal up next!)
const handleEditTransaction = (tx: Transaction) => {
  transactionToEdit.value = tx;
  isModalOpen.value = true;
};

const handleEditHolding = (asset: Holding) => {
  // For FDs, the holding IS the transaction
  if (asset.segment === 'fds') {
    transactionToEdit.value = asset;
    isModalOpen.value = true;
  } else {
    alert("Please expand the row to edit a specific Buy or Sell transaction.");
  }
};
</script>

<style scoped>
.dashboard { padding: 0 20px; font-family: sans-serif; }
.dashboard-content { display: flex; flex-direction: column; gap: 30px; margin-top: 20px; }

/* FIX: The container now uses the dark mode background and border */
.table-container { 
  overflow-x: auto; 
  background: var(--card-bg); 
  border-radius: 8px; 
  border: 1px solid var(--border-color); 
}

/* FIX: Header border and title color */
.table-header-container { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-top: 10px; padding-bottom: 10px; 
  border-bottom: 2px solid var(--border-color); 
}
.table-header-container h2 { margin: 0; color: var(--text-main); }

/* Updated Button variables */
.add-transaction-btn { 
  background-color: var(--blue-primary); 
  color: white; 
  border: none; padding: 10px 20px; border-radius: 6px; 
  font-weight: 600; cursor: pointer; transition: background-color 0.2s; 
}
.add-transaction-btn:hover { background-color: var(--blue-hover); }

.modal-backdrop { 
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
  background-color: rgba(0, 0, 0, 0.5); 
  display: flex; justify-content: center; align-items: center; z-index: 1000; 
}

/* Ensure the modal content wrapper doesn't force a white background */
.modal-content { 
  border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); 
  max-width: 900px; width: 95%; 
  background: var(--card-bg);
}
</style>