<template>
  <div class="transaction-panel">
    
    <div class="segment-tabs">
      <button 
        v-for="seg in segments" 
        :key="seg.id" 
        :class="['tab-btn', { active: formData.segment === seg.id }]"
        @click="formData.segment = seg.id"
        type="button"
      >
        {{ seg.name }}
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="modal-form">
      
      <div v-if="formData.segment !== 'fds'" class="inputs-row">
        <div class="input-group">
          <label>Action</label>
          <select v-model="formData.actionId" required>
            <option disabled value="">Select...</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
            </select>
        </div>

        <div class="input-group flex-grow">
          <label>Stock Name / Ticker</label>
          <div class="autocomplete-wrapper">
            <input 
              v-model="formData.ticker" 
              type="text" 
              placeholder="Search e.g. BAJFINANCE..." 
              required 
              autocomplete="off"
              @input="handleSearch"
              @focus="handleSearch"
              @blur="hideDropdown"
            />
            
            <ul v-if="showDropdown && searchResults.length > 0" class="autocomplete-dropdown">
              <li 
                v-for="asset in searchResults" 
                :key="asset.id" 
                @mousedown="selectAsset(asset)"
              >
                <span class="asset-ticker">{{ asset.ticker }}</span>
                <span class="asset-name">{{ asset.name }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="input-group">
          <label>Currency</label>
          <select v-model="formData.currency" required>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div class="input-group">
          <label>Date</label>
          <input v-model="formData.date" type="date" required />
        </div>

        <div class="input-group">
          <label>Quantity</label>
          <input v-model.number="formData.quantity" type="number" step="0.0001" placeholder="0" required />
        </div>

        <div class="input-group">
          <label>Price/Stock</label>
          <input v-model.number="formData.price" type="number" step="0.01" placeholder="0.00" required />
        </div>
      </div>

      <div v-else class="inputs-row">
        <div class="input-group flex-grow">
          <label>Bank / Institution Name</label>
          <input v-model="formData.bankName" type="text" placeholder="e.g., SBI, HDFC..." required />
        </div>

        <div class="input-group">
          <label>Principal Amount</label>
          <input v-model.number="formData.principalAmount" type="number" step="0.01" placeholder="0.00" required />
        </div>

        <div class="input-group">
          <label>Interest Rate (%)</label>
          <input v-model.number="formData.interestRate" type="number" step="0.01" placeholder="e.g., 7.1" required />
        </div>

        <div class="input-group">
          <label>Start Date</label>
          <input v-model="formData.date" type="date" required />
        </div>

        <div class="input-group">
          <label>Maturity Date</label>
          <input v-model="formData.maturityDate" type="date" required />
        </div>
      </div>

      <div class="actions-row">
        <button type="button" class="cancel-btn" @click="emit('close')">Cancel</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Add' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePortfolioStore } from '../../stores/portfolio';
import { portfolioService, type Asset } from '../../services/portfolioService';

const emit = defineEmits(['close']);
const portfolioStore = usePortfolioStore();
const route = useRoute();

const segments = [
  { id: 'equity', name: 'Stocks/ETF' },
  { id: 'mutual-fund', name: 'Mutual Fund' }, 
  { id: 'fds', name: 'Fixed Income' },
  { id: 'foreign-equity', name: 'Foreign Equity' } 
];

const getDefaultSegment = () => {
  const segmentMap: Record<string, string> = {
    '/mutual-funds': 'mutual-fund',  // Maps the URL to the fixed ID
    '/fds': 'fds',
    '/foreign': 'foreign-equity',    // Maps the URL to the fixed ID
    '/equity': 'equity'
  };
  return segmentMap[route.path] || 'equity'; 
};

const formData = ref({
  segment: getDefaultSegment(), 
  actionId: 'BUY',
  currency: route.path === '/foreign' ? 'USD' : 'INR', 
  date: new Date().toISOString().split('T')[0], 
  ticker: '',
  price: null as number | null,
  quantity: null as number | null,
  bankName: '',
  principalAmount: null as number | null,
  interestRate: null as number | null,
  maturityDate: ''
});

const isSubmitting = ref(false);

// --- NEW: Live Search Logic ---
const searchResults = ref<Asset[]>([]);
const showDropdown = ref(false);
let searchTimeout: ReturnType<typeof setTimeout>;

const handleSearch = async () => {
  const query = formData.value.ticker;
  
  // Don't search if less than 2 characters
  if (!query || query.length < 2) {
    searchResults.value = [];
    showDropdown.value = false;
    return;
  }

  // Clear the previous timer if the user is still typing
  clearTimeout(searchTimeout);
  
  // Wait 300ms after they stop typing before calling the API
  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await portfolioService.searchAssets(query);
      showDropdown.value = searchResults.value.length > 0;
    } catch (err) {
      console.error("Failed to search assets", err);
    }
  }, 300);
};

const selectAsset = (asset: Asset) => {
  formData.value.ticker = asset.ticker;
  formData.value.currency = asset.currency; // Auto-set the currency!
  showDropdown.value = false;
};

const hideDropdown = () => {
  // Small delay so the mousedown event on the list item has time to fire
  setTimeout(() => showDropdown.value = false, 200);
};
// ------------------------------

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    await portfolioStore.submitAction({
      segment: formData.value.segment,
      actionId: formData.value.actionId,
      date: formData.value.date,
      currency: formData.value.currency,
      ticker: formData.value.segment !== 'fds' ? formData.value.ticker : undefined,
      price: formData.value.segment !== 'fds' ? (formData.value.price || 0) : undefined,
      quantity: formData.value.segment !== 'fds' ? (formData.value.quantity || 0) : undefined,
      bankName: formData.value.segment === 'fds' ? formData.value.bankName : undefined,
      principalAmount: formData.value.segment === 'fds' ? (formData.value.principalAmount || 0) : undefined,
      interestRate: formData.value.segment === 'fds' ? (formData.value.interestRate || 0) : undefined,
      maturityDate: formData.value.segment === 'fds' ? formData.value.maturityDate : undefined
    });

    emit('close'); 
  } catch(error) {
    // You could add a toast notification here later!
    console.error("Submission failed", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Main Container */
.transaction-panel { 
  background: var(--card-bg); 
  border-radius: 8px; 
  width: 100%; 
  overflow: hidden; 
}

/* Tab Styling */
.segment-tabs { 
  display: flex; 
  background: var(--nav-hover);
  padding: 0; 
  border-bottom: 2px solid var(--blue-primary); 
}
.tab-btn { 
  padding: 12px 24px; 
  background: transparent; 
  border: none; 
  cursor: pointer; 
  font-weight: 600; 
  color: var(--text-muted); 
  transition: all 0.2s ease; 
}
.tab-btn.active { 
  background: var(--blue-primary); 
  color: white; 
}
.tab-btn:hover:not(.active) { 
  background: var(--bg-color); 
  color: var(--text-main); 
}

/* Form Layout */
.modal-form { display: flex; flex-direction: column; padding: 20px; gap: 20px; }
.inputs-row { display: flex; align-items: flex-end; gap: 15px; width: 100%; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 100px; }
.input-group.flex-grow { flex: 2; min-width: 200px; }

/* Input Styling */
.input-group label { 
  font-size: 13px; 
  font-weight: 700; 
  color: var(--text-main); 
}
.input-group input, 
.input-group select { 
  box-sizing: border-box; 
  width: 100%; 
  padding: 10px; 
  border: 1px solid var(--border-color); 
  border-radius: 4px; 
  font-size: 14px; 
  background: var(--bg-color); 
  color: var(--text-main); 
}
.input-group input:focus, 
.input-group select:focus { 
  outline: none; 
  border-color: var(--blue-primary); 
  box-shadow: 0 0 0 1px var(--blue-primary); 
}

/* --- NEW: Autocomplete CSS --- */
.autocomplete-wrapper {
  position: relative;
  width: 100%;
}
.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000; /* Ensures it floats above other inputs */
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.autocomplete-dropdown li {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}
.autocomplete-dropdown li:last-child {
  border-bottom: none;
}
.autocomplete-dropdown li:hover {
  background: var(--nav-hover);
}
.asset-ticker {
  font-weight: 600;
  color: var(--blue-primary);
}
.asset-name {
  color: var(--text-muted);
  font-size: 13px;
}
/* ------------------------------ */

/* Buttons */
.actions-row { 
  display: flex; 
  justify-content: flex-end; 
  gap: 15px; 
  margin-top: 10px; 
  padding-top: 20px; 
  border-top: 1px solid var(--border-color); 
}
.cancel-btn { 
  padding: 8px 16px; 
  background: transparent; 
  color: var(--text-muted); 
  border: 1px solid transparent; 
  cursor: pointer; 
  font-weight: 600; 
  font-size: 14px; 
}
.cancel-btn:hover { 
  text-decoration: underline; 
  color: var(--text-main); 
}
.submit-btn { 
  padding: 10px 24px; 
  background-color: var(--blue-primary); 
  color: white; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
  font-weight: 600; 
  font-size: 14px; 
  transition: background-color 0.2s; 
}
.submit-btn:hover { background-color: var(--blue-hover); }
.submit-btn:disabled { 
  background-color: var(--text-muted); 
  cursor: not-allowed; 
  opacity: 0.7;
}
</style>