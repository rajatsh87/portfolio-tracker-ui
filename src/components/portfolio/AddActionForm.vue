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
            <option v-for="action in availableActions" :key="action.id" :value="action.id">
              {{ action.name }}
            </option>
          </select>
        </div>

        <div class="input-group flex-grow">
          <label>Stock Name</label>
          <input v-model="formData.ticker" type="text" placeholder="Search stock or enter ticker..." required />
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
          <input v-model.number="formData.quantity" type="number" placeholder="0" required />
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
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router'; // <-- 1. Import useRoute
import { usePortfolioStore } from '../../stores/portfolio';

const emit = defineEmits(['close']);
const portfolioStore = usePortfolioStore();
const { availableActions } = storeToRefs(portfolioStore);
const route = useRoute(); // <-- 2. Initialize route

const segments = [
  { id: 'equity', name: 'Stocks/ETF' },
  { id: 'mutual-funds', name: 'Mutual Fund' },
  { id: 'fds', name: 'Fixed Income' },
  { id: 'foreign', name: 'Foreign Equity' }
];

// 3. Helper to determine the default segment based on the URL
const getDefaultSegment = () => {
  const segmentMap: Record<string, string> = {
    '/mutual-funds': 'mutual-funds',
    '/fds': 'fds',
    '/foreign': 'foreign',
    '/equity': 'equity'
  };
  // If we are on Overview ('/') or any unmapped route, default to 'equity'
  return segmentMap[route.path] || 'equity'; 
};

// 4. Initialize formData using our new helper
const formData = ref({
  segment: getDefaultSegment(), 
  actionId: 'BUY',
  // Smart currency: default to USD if on the foreign tab, else INR
  currency: route.path === '/foreign' ? 'USD' : 'INR', 
  date: new Date().toISOString().split('T')[0], 
  // Equity Fields
  ticker: '',
  price: null,
  quantity: null,
  // FD Fields
  bankName: '',
  principalAmount: null,
  interestRate: null,
  maturityDate: ''
});

const isSubmitting = ref(false);

onMounted(() => {
  portfolioStore.fetchActions();
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  
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

  // Reset form
  formData.value = { 
    ...formData.value, 
    ticker: '', price: null, quantity: null,
    bankName: '', principalAmount: null, interestRate: null, maturityDate: ''
  };
  isSubmitting.value = false;
  emit('close'); 
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
  background: var(--nav-hover); /* Slightly offsets from the card background */
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
  background: var(--bg-color); /* Darkens the input box in dark mode */
  color: var(--text-main);     /* Ensures you can read what you type! */
}
.input-group input:focus, 
.input-group select:focus { 
  outline: none; 
  border-color: var(--blue-primary); 
  box-shadow: 0 0 0 1px var(--blue-primary); 
}

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