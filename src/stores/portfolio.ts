import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { portfolioService, type Holding, type TransactionRequest } from '../services/portfolioService';

export const usePortfolioStore = defineStore('portfolio', () => {
  // --- STATE ---
  const holdings = ref<Holding[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Hardcoded for MVP until we build a Login screen
  const CURRENT_ACCOUNT_ID = 1; 

  // --- ACTIONS ---
  const fetchHoldings = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      holdings.value = await portfolioService.getHoldings(CURRENT_ACCOUNT_ID);
    } catch (err: any) {
      console.error('Failed to fetch holdings:', err);
      error.value = err.response?.data?.error || 'Failed to load portfolio.';
    } finally {
      isLoading.value = false;
    }
  };

  const submitAction = async (formData: any) => {
    try {
      const payload: TransactionRequest = {
        accountId: CURRENT_ACCOUNT_ID,
        segment: formData.segment,
        actionId: formData.actionId,
        currency: formData.currency,
        date: formData.date,
        ticker: formData.ticker,
        price: formData.price,
        quantity: formData.quantity,
        bankName: formData.bankName,
        principalAmount: formData.principalAmount,
        interestRate: formData.interestRate,
        maturityDate: formData.maturityDate
      };

      await portfolioService.addTransaction(payload);
      
      // Refresh the dashboard to show the new math!
      await fetchHoldings(); 
    } catch (err: any) {
      console.error('Failed to submit transaction:', err);
      throw new Error(err.response?.data?.error || 'Failed to save transaction.');
    }
  };

  const editAction = async (transactionId: number, formData: any) => {
    try {
      const payload: TransactionRequest = {
        accountId: CURRENT_ACCOUNT_ID,
        segment: formData.segment,
        actionId: formData.actionId,
        currency: formData.currency,
        date: formData.date,
        ticker: formData.ticker,
        price: formData.price,
        quantity: formData.quantity,
        bankName: formData.bankName,
        principalAmount: formData.principalAmount,
        interestRate: formData.interestRate,
        maturityDate: formData.maturityDate
      };

      await portfolioService.updateTransaction(transactionId, payload);
      await fetchHoldings(); 
    } catch (err: any) {
      console.error('Failed to update transaction:', err);
      throw new Error(err.response?.data?.error || 'Failed to update transaction.');
    }
  };

  // --- GETTERS (Calculations for Summary Card) ---
  const latestValue = computed(() => {
    return holdings.value.reduce((total, asset) => {
      const val = asset.segment === 'fds' 
        ? (asset.principalAmount || 0) 
        : ((asset.currentPrice || 0) * (asset.quantity || 0));
      return total + val;
    }, 0);
  });

  const investmentCost = computed(() => {
    return holdings.value.reduce((total, asset) => {
      const val = asset.segment === 'fds' 
        ? (asset.principalAmount || 0) 
        : ((asset.avgBuyPrice || 0) * (asset.quantity || 0));
      return total + val;
    }, 0);
  });

  const unrealizedGain = computed(() => latestValue.value - investmentCost.value);
  
  const unrealizedGainPercent = computed(() => {
    if (investmentCost.value === 0) return 0;
    return (unrealizedGain.value / investmentCost.value) * 100;
  });

  const todayGain = computed(() => {
    return holdings.value.reduce((total, asset) => {
      if (asset.segment === 'fds') return total; 
      
      const assetLatestValue = (asset.currentPrice || 0) * (asset.quantity || 0);
      const pct = asset.daysChangePct || 0;
      const yesterdayValue = assetLatestValue / (1 + (pct / 100));
      return total + (assetLatestValue - yesterdayValue);
    }, 0);
  });

  const todayGainPercent = computed(() => {
    const yesterdayTotalValue = latestValue.value - todayGain.value;
    if (yesterdayTotalValue === 0) return 0;
    return (todayGain.value / yesterdayTotalValue) * 100;
  });

  // Placeholder for realized gains until we wire up the Phase 2 Tax Report API
  const realizedGain = computed(() => 0); 

  // ONE SINGLE EXPORT BLOCK AT THE VERY BOTTOM
  return { 
    holdings, 
    isLoading, 
    error, 
    fetchHoldings, 
    submitAction,
    editAction, // <--- Safely exported here now!
    latestValue,
    investmentCost,
    unrealizedGain,
    unrealizedGainPercent,
    todayGain,
    todayGainPercent,
    realizedGain
  };
});