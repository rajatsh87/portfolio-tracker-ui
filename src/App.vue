<template>
  <div id="app-container">
    
    <SummaryCard class="global-summary" />

    <nav class="segment-nav">
      <router-link to="/" class="nav-item">Overview</router-link>
      <router-link to="/equity" class="nav-item">Equity</router-link>
      <router-link to="/mutual-funds" class="nav-item">Mutual Funds</router-link>
      <router-link to="/fds" class="nav-item">FDs</router-link>
      <router-link to="/foreign" class="nav-item">Foreign Investments</router-link>
    </nav>

    <main class="page-content">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import SummaryCard from './components/portfolio/SummaryCard.vue'
import { usePortfolioStore } from './stores/portfolio'

// We initialize fetching the portfolio here globally so the SummaryCard has data immediately
const portfolioStore = usePortfolioStore()
onMounted(() => {
  portfolioStore.fetchPortfolio()
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  font-family: sans-serif;
}
#app-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}
.global-summary {
  margin-bottom: 20px;
}

/* Navigation Styles */
.segment-nav {
  display: flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}
.nav-item {
  padding: 15px 25px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  border-right: 1px solid #edf2f7;
  transition: background-color 0.2s;
}
.nav-item:hover {
  background-color: #f7fafc;
}
/* Vue Router automatically applies 'router-link-active' to the current route */
.nav-item.router-link-active {
  background-color: #ebf8f6;
  color: #319795;
  border-bottom: 3px solid #319795;
}
.page-content {
  background: transparent;
}
</style>