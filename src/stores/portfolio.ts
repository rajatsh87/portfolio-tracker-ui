import { defineStore } from 'pinia';
import { ref } from 'vue';
import { portfolioService, type Holding, type TransactionAction, type TransactionPayload } from '../services/portfolioService';
import { computed } from 'vue';

export const usePortfolioStore = defineStore('portfolio', () => {
  const holdings = ref<Holding[]>([]);
  const availableActions = ref<TransactionAction[]>([]);
  
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchPortfolio = async () => {
    isLoading.value = true;
    try {
      holdings.value = await portfolioService.getHoldings();
    } catch (err) {
      error.value = 'Failed to load portfolio.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchActions = async () => {
    try {
      availableActions.value = await portfolioService.getAvailableActions();
    } catch (err) {
      console.error("Failed to load actions list");
    }
  };

  const submitAction = async (payload: TransactionPayload) => {
    try {
      // 1. Send data to the backend
      await portfolioService.submitTransaction(payload);
      
      // 2. Optimistic UI Update: Modify the local state instantly
      if (payload.actionId === 'BUY') {
        // Check if we already own this stock
        const existingHolding = holdings.value.find(h => h.ticker === payload.ticker.toUpperCase());
        
        if (existingHolding) {
          // If we own it, just increase the quantity
          existingHolding.quantity += payload.quantity;
        } else {
          // If it's a new stock, push it to our array
          holdings.value.push({
            id: Math.random(), 
            ticker: payload.ticker.toUpperCase(),
            name: payload.ticker.toUpperCase(), 
            avgBuyPrice: payload.price,
            currentPrice: payload.price, 
            quantity: payload.quantity,
            currency: payload.currency, // <-- Use dynamic currency
            segment: payload.segment    // <-- Use dynamic segment
          });
        }
      } else if (payload.actionId === 'SELL') {
        const existingHolding = holdings.value.find(h => h.ticker === payload.ticker.toUpperCase());
        
        if (existingHolding) {
          existingHolding.quantity -= payload.quantity;
          // If we sold everything, remove it from the dashboard entirely
          if (existingHolding.quantity <= 0) {
            holdings.value = holdings.value.filter(h => h.ticker !== payload.ticker.toUpperCase());
          }
        }
      }

      // 3. Notify the user
      alert(`Successfully recorded ${payload.actionId} for ${payload.ticker}!`);
    } catch (err) {
      alert("Failed to submit transaction.");
    }
  };

  const latestValue = computed(() => {
    return holdings.value.reduce((total, asset) => total + (asset.currentPrice * asset.quantity), 0);
  });

  const investmentCost = computed(() => {
    return holdings.value.reduce((total, asset) => total + (asset.avgBuyPrice * asset.quantity), 0);
  });

  const overallUnrealizedGain = computed(() => {
    return latestValue.value - investmentCost.value;
  });

  const overallUnrealizedGainPercent = computed(() => {
    if (investmentCost.value === 0) return 0;
    return (overallUnrealizedGain.value / investmentCost.value) * 100;
  });

  return { 
    holdings, availableActions, isLoading, error, 
    fetchPortfolio, fetchActions, submitAction,
    latestValue, investmentCost, overallUnrealizedGain, overallUnrealizedGainPercent
  };
});