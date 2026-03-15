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
import { usePortfolioStore } from '../../stores/portfolio';

const emit = defineEmits(['close']);
const portfolioStore = usePortfolioStore();
const { availableActions } = storeToRefs(portfolioStore);

const segments = [
  { id: 'equity', name: 'Stocks/ETF' },
  { id: 'mutual-funds', name: 'Mutual Fund' },
  { id: 'fds', name: 'Fixed Income' },
  { id: 'foreign', name: 'Foreign Equity' }
];

const formData = ref({
  segment: 'equity',
  actionId: 'BUY',
  currency: 'INR',
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
    // Send equity data if not FD
    ticker: formData.value.segment !== 'fds' ? formData.value.ticker : undefined,
    price: formData.value.segment !== 'fds' ? (formData.value.price || 0) : undefined,
    quantity: formData.value.segment !== 'fds' ? (formData.value.quantity || 0) : undefined,
    // Send FD data if it IS FD
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
/* Keep all your existing CSS exactly as it was! It will automatically style the new FD fields perfectly. */
.transaction-panel { background: #fff; border-radius: 8px; width: 100%; overflow: hidden; }
.segment-tabs { display: flex; background: #f8fafc; padding: 0; border-bottom: 2px solid #2b6cb0; }
.tab-btn { padding: 12px 24px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #4a5568; transition: all 0.2s ease; }
.tab-btn.active { background: #2b6cb0; color: white; }
.tab-btn:hover:not(.active) { background: #e2e8f0; }
.modal-form { display: flex; flex-direction: column; padding: 20px; gap: 20px; }
.inputs-row { display: flex; align-items: flex-end; gap: 15px; width: 100%; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 100px; }
.input-group.flex-grow { flex: 2; min-width: 200px; }
.input-group label { font-size: 13px; font-weight: 700; color: #2d3748; }
.input-group input, .input-group select { box-sizing: border-box; width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px; background: #fff; }
.input-group input:focus, .input-group select:focus { outline: none; border-color: #2b6cb0; box-shadow: 0 0 0 1px #2b6cb0; }
.actions-row { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; padding-top: 20px; border-top: 1px solid #edf2f7; }
.cancel-btn { padding: 8px 16px; background: transparent; color: #4a5568; border: 1px solid transparent; cursor: pointer; font-weight: 600; font-size: 14px; }
.cancel-btn:hover { text-decoration: underline; color: #2d3748; }
.submit-btn { padding: 10px 24px; background-color: #2b6cb0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s; }
.submit-btn:hover { background-color: #2c5282; }
.submit-btn:disabled { background-color: #a0aec0; cursor: not-allowed; }
</style>