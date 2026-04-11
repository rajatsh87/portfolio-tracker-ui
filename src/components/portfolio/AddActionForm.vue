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
          <input 
            v-model.number="formData.quantity" 
            @input="handleCalculation('quantity')"
            type="number" step="0.0001" placeholder="0" required 
          />
        </div>

        <div class="input-group">
          <label>Price/Unit</label>
          <input 
            v-model.number="formData.price" 
            @input="handleCalculation('price')"
            type="number" step="0.01" placeholder="0.00" required 
          />
        </div>

        <div class="input-group highlight-bg">
          <label>Total Invested</label>
          <input 
            v-model.number="formData.totalAmount" 
            @input="handleCalculation('totalAmount')"
            type="number" step="0.01" placeholder="0.00" required 
          />
        </div>
      </div>

      <div v-else class="inputs-row">
        <div class="input-group flex-grow">
          <label>Bank / Institution Name</label>
          <input v-model="formData.bankName" type="text" placeholder="e.g., SBI, HDFC..." required />
        </div>

        <div class="input-group">
          <label>Start Date</label>
          <input v-model="formData.date" type="date" required />
        </div>

        <div class="input-group">
          <label>Maturity Date</label>
          <input v-model="formData.maturityDate" type="date" required />
        </div>

        <div class="input-group">
          <label>Principal Amount</label>
          <input v-model.number="formData.principalAmount" type="number" step="0.01" placeholder="0.00" required />
        </div>

        <div class="input-group">
          <label>Interest Rate (%)</label>
          <input v-model.number="formData.interestRate" type="number" step="0.01" placeholder="e.g., 7.1" required />
        </div>

        <div v-if="calculatedFdMaturity > 0" class="preview-banner">
          <div class="preview-text">
            <span>Estimated Maturity Amount:</span>
            <strong>{{ formatCurrency(calculatedFdMaturity) }}</strong>
          </div>
          <div class="preview-text sub-text">
            <span>Interest Earned:</span>
            <span class="positive">+{{ formatCurrency(calculatedFdMaturity - (formData.principalAmount || 0)) }}</span>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <button type="button" class="cancel-btn" @click="emit('close')">Cancel</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Transaction') }}
</button>
      </div>

    </form>
  </div>
</template> 

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { usePortfolioStore } from '../../stores/portfolio';
import { portfolioService, type Asset } from '../../services/portfolioService';

const props = defineProps<{
  editData?: any; // Receives the transaction we want to edit
}>();

const emit = defineEmits(['close']);
const portfolioStore = usePortfolioStore();
const route = useRoute();

const formatCurrency = (value: number) => {
  return '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const segments = [
  { id: 'equity', name: 'Stocks/ETF' },
  { id: 'mutual-fund', name: 'Mutual Fund' },
  { id: 'fds', name: 'Fixed Income' },
  { id: 'foreign-equity', name: 'Foreign Equity' }
];

const getDefaultSegment = () => {
  const segmentMap: Record<string, string> = {
    '/mutual-funds': 'mutual-fund',
    '/fds': 'fds',
    '/foreign': 'foreign-equity',
    '/equity': 'equity'
  };
  return segmentMap[route.path] || 'equity'; 
};

// Check if we are in Edit Mode
const isEditMode = computed(() => !!props.editData);

const formData = ref({
  segment: getDefaultSegment(), 
  actionId: 'BUY',
  currency: route.path === '/foreign' ? 'USD' : 'INR', 
  date: new Date().toISOString().split('T')[0], 
  ticker: '',
  price: null as number | null,
  quantity: null as number | null,
  totalAmount: null as number | null,
  bankName: '',
  principalAmount: null as number | null,
  interestRate: null as number | null,
  maturityDate: ''
});

// PRE-FILL FORM IF EDITING
watchEffect(() => {
  if (props.editData) {
    const data = props.editData;
    
    // Determine if it's an FD or a Market Asset based on the presence of bankName
    const isFd = !!data.bankName;
    
    formData.value = {
      segment: isFd ? 'fds' : getDefaultSegment(),
      actionId: data.actionId || 'BUY',
      currency: data.currency || 'INR',
      date: data.date || data.startDate || new Date().toISOString().split('T')[0],
      ticker: data.ticker || '',
      price: data.price || null,
      quantity: data.quantity || null,
      totalAmount: data.price && data.quantity ? Number((data.price * data.quantity).toFixed(2)) : null,
      bankName: data.bankName || '',
      principalAmount: data.principalAmount || null,
      interestRate: data.interestRate || null,
      maturityDate: data.maturityDate || ''
    };
  }
});

const isSubmitting = ref(false);

// ... KEEP ALL YOUR EXISTING handleCalculation, calculatedFdMaturity, and handleSearch LOGIC HERE ...

// --- Submit Logic ---
const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await portfolioStore.editAction(props.editData.id, formData.value);
    } else {
      await portfolioStore.submitAction(formData.value);
    }
    emit('close'); 
  } catch(error) {
    console.error("Submission failed", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.transaction-panel { background: var(--card-bg); border-radius: 8px; width: 100%; overflow: hidden; }
.segment-tabs { display: flex; background: var(--nav-hover); padding: 0; border-bottom: 2px solid var(--blue-primary); }
.tab-btn { padding: 12px 24px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: var(--text-muted); transition: all 0.2s; }
.tab-btn.active { background: var(--blue-primary); color: white; }
.tab-btn:hover:not(.active) { background: var(--bg-color); color: var(--text-main); }

.modal-form { display: flex; flex-direction: column; padding: 20px; gap: 20px; }
.inputs-row { display: flex; align-items: flex-end; gap: 15px; width: 100%; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 130px; }
.input-group.flex-grow { flex: 2; min-width: 200px; }

/* Highlighted background for Total field to differentiate it visually */
.highlight-bg input { background-color: rgba(59, 130, 246, 0.05) !important; border-color: rgba(59, 130, 246, 0.3) !important; font-weight: bold; }

.input-group label { font-size: 13px; font-weight: 700; color: var(--text-main); }
.input-group input, .input-group select { box-sizing: border-box; width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 14px; background: var(--bg-color); color: var(--text-main); }
.input-group input:focus, .input-group select:focus { outline: none; border-color: var(--blue-primary); box-shadow: 0 0 0 1px var(--blue-primary); }

/* FD Preview Banner */
.preview-banner { width: 100%; margin-top: 10px; padding: 15px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
.preview-text { font-size: 15px; color: var(--text-main); display: flex; gap: 10px; }
.preview-text strong { color: var(--green-gain); font-size: 18px; }
.sub-text { font-size: 13px; }
.positive { color: var(--green-gain); font-weight: bold; }

.autocomplete-wrapper { position: relative; width: 100%; }
.autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 4px; margin-top: 4px; padding: 0; list-style: none; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.autocomplete-dropdown li { padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); }
.autocomplete-dropdown li:hover { background: var(--nav-hover); }
.asset-ticker { font-weight: 600; color: var(--blue-primary); }
.asset-name { color: var(--text-muted); font-size: 13px; }

.actions-row { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; padding-top: 20px; border-top: 1px solid var(--border-color); }
.cancel-btn { padding: 8px 16px; background: transparent; color: var(--text-muted); border: 1px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; }
.cancel-btn:hover { text-decoration: underline; color: var(--text-main); }
.submit-btn { padding: 10px 24px; background-color: var(--blue-primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
.submit-btn:hover { background-color: var(--blue-hover); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>