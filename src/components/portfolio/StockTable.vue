<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import { portfolioService, type Holding, type Transaction } from '../../services/portfolioService';

defineProps<{
  holdings: Holding[];
  assetColumnName: string;
}>();

const emit = defineEmits([
  'edit-holding', 'delete-holding', 'transfer-holding',
  'edit-transaction', 'delete-transactions', 'transfer-transactions'
]);

// Hardcoded for MVP until login system is built
const CURRENT_ACCOUNT_ID = 1;

// --- Formatting Helpers ---
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  return '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatPercent = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  return Number(value).toFixed(2) + '%';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Holding Action Menu Logic (3-dots) ---
const activeDropdown = ref<number | null>(null);

const toggleDropdown = (id: number) => {
  activeDropdown.value = activeDropdown.value === id ? null : id;
};

const handleHoldingAction = (action: 'edit-holding' | 'delete-holding' | 'transfer-holding', asset: Holding) => {
  activeDropdown.value = null; 
  if (action === 'transfer-holding') {
    alert("Full asset transfer coming in Phase 2!");
    return;
  }
  emit(action, asset);
};

// --- MASTER-DETAIL EXPANSION LOGIC ---
const expandedAssetId = ref<number | null>(null);
const isLoadingTx = ref(false);
const assetTransactions = ref<Transaction[]>([]);

const toggleExpand = async (asset: Holding) => {
  // If clicking the currently open row, close it
  if (expandedAssetId.value === asset.id) {
    expandedAssetId.value = null; 
    return;
  }
  
  // Open the row and show loading state
  expandedAssetId.value = asset.id;
  isLoadingTx.value = true;
  assetTransactions.value = []; // Clear old data to prevent flickering
  
  try {
    // Only search if the asset has a ticker (Stocks/MFs)
    if (asset.ticker) {
      // REAL API CALL TO SPRING BOOT!
      assetTransactions.value = await portfolioService.getTransactionsByTicker(
        CURRENT_ACCOUNT_ID, 
        asset.ticker
      );
    }
  } catch (error) {
    console.error("Failed to fetch transaction history", error);
    alert("Could not load transaction history.");
  } finally {
    isLoadingTx.value = false;
  }
};

// --- MULTI-SELECT LOGIC ---
const selectedTxIds = ref<number[]>([]);

// Clear selections if the user closes the row or opens a different one
watch(expandedAssetId, () => {
  selectedTxIds.value = [];
});

const toggleAllTx = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  if (isChecked) {
    selectedTxIds.value = assetTransactions.value.map(tx => tx.id);
  } else {
    selectedTxIds.value = [];
  }
};

const handleBulkAction = (action: 'delete' | 'transfer') => {
  if (action === 'transfer') {
    alert(`Transferring transactions: ${selectedTxIds.value.join(', ')}`);
  } else {
    if(confirm(`Are you sure you want to delete ${selectedTxIds.value.length} transactions?`)) {
      emit('delete-transactions', selectedTxIds.value);
    }
  }
};

const editIndividualTx = (tx: Transaction) => {
  emit('edit-transaction', tx);
};
</script>

<template>
  <table class="portfolio-table">
    <thead>
      <tr>
        <th style="width: 40px"></th> <th>{{ assetColumnName }}</th>
        <th class="right-align">Avg. Buy Price</th>
        <th class="right-align">Current Price</th>
        <th class="right-align">Quantity</th>
        <th class="right-align">Latest Value</th>
        <th class="right-align">Day's Change</th>
        <th class="center-align">Actions</th>
      </tr>
    </thead>
    
    <tbody v-for="asset in holdings" :key="asset.id">
      
      <tr class="holding-row" :class="{ 'is-expanded': expandedAssetId === asset.id }" @click="toggleExpand(asset)">
        <td class="center-align">
          <span class="expand-icon">{{ expandedAssetId === asset.id ? '▼' : '▶' }}</span>
        </td>
        <td>
          <div class="asset-info">
            <span class="asset-name">{{ asset.ticker || asset.name }}</span>
            <span class="asset-sub">{{ asset.name }}</span>
          </div>
        </td>
        <td class="right-align">{{ formatCurrency(asset.avgBuyPrice) }}</td>
        <td class="right-align">{{ formatCurrency(asset.currentPrice) }}</td>
        <td class="right-align fw-bold">{{ asset.quantity }}</td>
        <td class="right-align fw-bold">{{ formatCurrency((asset.currentPrice || 0) * (asset.quantity || 0)) }}</td>
        
        <td class="right-align">
          <span :class="['change-badge', (asset.daysChangePct || 0) >= 0 ? 'positive' : 'negative']">
            {{ (asset.daysChangePct || 0) >= 0 ? '+' : '' }}{{ formatPercent(asset.daysChangePct) }}
          </span>
        </td>

        <td class="center-align action-cell" @click.stop>
          <button class="action-btn" @click="toggleDropdown(asset.id)">⋮</button>
          
          <div v-if="activeDropdown === asset.id" class="action-dropdown">
            <button @click="handleHoldingAction('edit-holding', asset)">✏️ Edit Asset</button>
            <button @click="handleHoldingAction('transfer-holding', asset)">🔄 Transfer Asset</button>
            <button @click="handleHoldingAction('delete-holding', asset)" class="danger-text">🗑️ Delete Asset</button>
          </div>
        </td>
      </tr>

      <tr v-if="expandedAssetId === asset.id" class="expanded-row-container">
        <td colspan="8" class="expanded-cell">
          <div class="transactions-panel">
            
            <div class="panel-header">
              <h4>Transaction History</h4>
              
              <div v-if="selectedTxIds.length > 0" class="bulk-actions">
                <span class="selection-count">{{ selectedTxIds.length }} selected</span>
                <button class="bulk-btn transfer" @click="handleBulkAction('transfer')">🔄 Transfer</button>
                <button class="bulk-btn delete" @click="handleBulkAction('delete')">🗑️ Delete</button>
              </div>
            </div>

            <div v-if="isLoadingTx" class="tx-loading">Fetching transaction history from database...</div>
            
            <div v-else-if="assetTransactions.length === 0" class="tx-loading">No transactions found for this asset.</div>

            <table v-else class="tx-table">
              <thead>
                <tr>
                  <th style="width: 40px" class="center-align">
                    <input 
                      type="checkbox" 
                      :checked="selectedTxIds.length === assetTransactions.length && assetTransactions.length > 0"
                      @change="toggleAllTx"
                    />
                  </th>
                  <th>Date</th>
                  <th>Type</th>
                  <th class="right-align">Quantity</th>
                  <th class="right-align">Price/Unit</th>
                  <th class="right-align">Total Value</th>
                  <th class="center-align">Edit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in assetTransactions" :key="tx.id">
                  <td class="center-align">
                    <input type="checkbox" :value="tx.id" v-model="selectedTxIds" />
                  </td>
                  <td>{{ formatDate(tx.date) }}</td>
                  <td>
                    <span :class="['tx-type', tx.actionId.toLowerCase()]">{{ tx.actionId }}</span>
                  </td>
                  <td class="right-align">{{ tx.quantity }}</td>
                  <td class="right-align">{{ formatCurrency(tx.price) }}</td>
                  <td class="right-align fw-bold">{{ formatCurrency(tx.price * tx.quantity) }}</td>
                  <td class="center-align">
                    <button class="icon-btn edit-btn" @click="editIndividualTx(tx)">✏️</button>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </td>
      </tr>
      
    </tbody>
    <tbody v-if="holdings.length === 0">
      <tr>
        <td colspan="8" class="empty-state">No assets found in this segment.</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
/* --- BASE TABLE STYLES --- */
.portfolio-table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 12px 15px; background-color: var(--nav-hover); color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid var(--border-color); }
td { padding: 15px; border-bottom: 1px solid var(--border-color); color: var(--text-main); font-size: 14px; }

/* Main Holding Row Hover & Expand */
.holding-row { cursor: pointer; transition: background-color 0.2s; }
.holding-row:hover { background-color: rgba(0, 0, 0, 0.02); }
.holding-row.is-expanded { background-color: rgba(59, 130, 246, 0.05); }
.expand-icon { font-size: 10px; color: var(--text-muted); transition: transform 0.2s; }

.asset-info { display: flex; flex-direction: column; gap: 4px; }
.asset-name { font-weight: 600; font-size: 14px; }
.asset-sub { font-size: 12px; color: var(--text-muted); }
.right-align { text-align: right; }
.center-align { text-align: center; }
.fw-bold { font-weight: 600; }
.change-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 13px; }
.change-badge.positive { background-color: rgba(16, 185, 129, 0.1); color: var(--green-gain); }
.change-badge.negative { background-color: rgba(239, 68, 68, 0.1); color: var(--red-loss); }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-style: italic; }

/* --- 3-DOT ACTION MENU --- */
.action-cell { position: relative; }
.action-btn { background: none; border: none; font-size: 20px; color: var(--text-muted); cursor: pointer; padding: 0 10px; border-radius: 4px; }
.action-btn:hover { background: var(--border-color); color: var(--text-main); }
.action-dropdown { position: absolute; top: 100%; right: 20px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; z-index: 100; min-width: 150px; overflow: hidden; }
.action-dropdown button { background: transparent; border: none; padding: 10px 15px; text-align: left; cursor: pointer; font-size: 13px; color: var(--text-main); transition: background 0.2s; }
.action-dropdown button:hover { background: var(--nav-hover); }
.action-dropdown button.danger-text { color: var(--red-loss); }
.action-dropdown button.danger-text:hover { background: rgba(239, 68, 68, 0.1); }

/* --- NESTED TRANSACTIONS PANEL --- */
.expanded-row-container { background-color: var(--nav-hover); }
.expanded-cell { padding: 0 !important; border-bottom: 2px solid var(--border-color); }
.transactions-panel { padding: 20px 40px; border-left: 4px solid var(--blue-primary); }

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.panel-header h4 { margin: 0; font-size: 14px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* Bulk Actions */
.bulk-actions { display: flex; align-items: center; gap: 10px; background: var(--bg-color); padding: 5px 15px; border-radius: 20px; border: 1px solid var(--border-color); }
.selection-count { font-size: 13px; font-weight: 600; color: var(--blue-primary); border-right: 1px solid var(--border-color); padding-right: 10px; }
.bulk-btn { background: transparent; border: none; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-main); transition: color 0.2s; }
.bulk-btn:hover { text-decoration: underline; }
.bulk-btn.delete:hover { color: var(--red-loss); }

/* Sub-table */
.tx-table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 6px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.tx-table th { background-color: var(--bg-color); padding: 10px; font-size: 11px; }
.tx-table td { padding: 10px; font-size: 13px; border-bottom: 1px solid var(--border-color); }
.tx-table tr:last-child td { border-bottom: none; }
.tx-type { font-size: 11px; font-weight: bold; padding: 3px 6px; border-radius: 4px; }
.tx-type.buy { background: rgba(16, 185, 129, 0.1); color: var(--green-gain); }
.tx-type.sell { background: rgba(239, 68, 68, 0.1); color: var(--red-loss); }
.icon-btn { background: none; border: none; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
.icon-btn:hover { opacity: 1; }
.tx-loading { padding: 20px; font-style: italic; color: var(--text-muted); font-size: 13px; }
</style>