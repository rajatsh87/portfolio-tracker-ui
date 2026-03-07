<template>
    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import { Doughnut } from 'vue-chartjs';
  
  ChartJS.register(ArcElement, Tooltip, Legend);
  
  // This is just like a Java Interface/Record!
  interface Holding {
    ticker: string;
    currentPrice: number;
    quantity: number;
  }
  
  // Defining our props with TypeScript
  const props = defineProps<{
    holdings: Holding[]
  }>();
  
  const chartData = computed(() => {
    return {
      labels: props.holdings.map(asset => asset.ticker),
      datasets: [
        {
          data: props.holdings.map(asset => asset.currentPrice * asset.quantity),
          backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#FFD700']
        }
      ]
    };
  });
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };
  </script>
  
  <style scoped>
  .chart-container {
    height: 300px;
    width: 300px;
  }
  </style>