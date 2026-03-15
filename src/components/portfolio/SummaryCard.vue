<template>
    <div class="summary-card">
      <div class="card-header">MY ASSETS</div>
      
      <div class="card-body">
        <div class="col col-assets">
          <div class="metric">
            <span class="label">Latest Value</span>
            <span class="value large">{{ formatINR(latestValue) }}</span>
          </div>
          <div class="metric mt-4">
            <span class="label">Investment Cost</span>
            <span class="value">{{ formatINR(investmentCost) }}</span>
          </div>
        </div>
  
        <div class="col col-unrealized">
          <h4 class="col-title">Unrealized Gain</h4>
          
          <div class="metric mt-2">
            <span class="label">Overall Gain</span>
            <span class="value gain-value" :class="{ 'positive': overallUnrealizedGain >= 0, 'negative': overallUnrealizedGain < 0 }">
              <span class="arrow" v-if="overallUnrealizedGain >= 0">▲</span>
              <span class="arrow" v-else>▼</span>
              {{ formatNumber(Math.abs(overallUnrealizedGain)) }} 
              <span class="percent">({{ overallUnrealizedGainPercent.toFixed(2) }}%)</span>
            </span>
          </div>
          
          <div class="metric mt-4">
            <span class="label">Today's Gain</span>
            <span class="value gain-value negative">
              <span class="arrow">▼</span> -5,985 <span class="percent">(-0.68%)</span>
            </span>
          </div>
        </div>
  
        <div class="col col-realized">
          <h4 class="col-title">Realized Gain</h4>
          
          <div class="metric mt-2">
            <span class="label">Realized Gain</span>
            <span class="value gain-value positive">1,50,543</span>
          </div>
          
          <div class="realized-split mt-4">
            <div class="metric">
              <span class="label">Capital Gain</span>
              <span class="value gain-value positive">1,48,203</span>
            </div>
            <div class="metric">
              <span class="label">Other Gain</span>
              <span class="value gain-value positive">2,341</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { usePortfolioStore } from '../../stores/portfolio';
  
  const portfolioStore = usePortfolioStore();
  // Pulling our reactive calculations straight from Pinia
  const { latestValue, investmentCost, overallUnrealizedGain, overallUnrealizedGainPercent } = storeToRefs(portfolioStore);
  
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
  };
  </script>
  
  <style scoped>
  .summary-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
  }
  .card-header {
    font-weight: 800;
    font-size: 16px;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }
  .card-body {
    display: flex;
    border-top: 1px solid #edf2f7;
    padding-top: 20px;
  }
  .col {
    flex: 1;
    padding: 0 20px;
  }
  .col-assets { padding-left: 0; }
  .col-realized { padding-right: 0; border-left: 1px solid #edf2f7; }
  .col-unrealized { border-left: 1px solid #edf2f7; }
  .col-title {
    font-size: 18px;
    font-weight: 800;
    margin: 0 0 15px 0;
  }
  .metric {
    display: flex;
    flex-direction: column;
  }
  .mt-2 { margin-top: 10px; }
  .mt-4 { margin-top: 25px; }
  .label {
    font-size: 14px;
    color: #4a5568;
    margin-bottom: 4px;
  }
  .value {
    font-size: 20px;
    font-weight: 800;
  }
  .value.large { font-size: 28px; }
  .gain-value.positive { color: #38a169; }
  .gain-value.negative { color: #e53e3e; }
  .arrow { font-size: 14px; }
  .percent { font-size: 14px; font-weight: 600; }
  .realized-split {
    display: flex;
    gap: 40px;
  }
  </style>