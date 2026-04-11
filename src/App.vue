<template>
  <div id="app-container">
    
    <SummaryCard class="global-summary" />

    <nav class="segment-nav">
      <div class="nav-links">
        <router-link to="/" class="nav-item">Overview</router-link>
        <router-link to="/equity" class="nav-item">Equity</router-link>
        <router-link to="/mutual-funds" class="nav-item">Mutual Funds</router-link>
        <router-link to="/fds" class="nav-item">FDs</router-link>
        <router-link to="/foreign" class="nav-item">Foreign Investments</router-link>
      </div>
      
      <button @click="toggleTheme" class="theme-toggle-btn">
        {{ isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
      </button>
    </nav>

    <main class="page-content">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import SummaryCard from './components/portfolio/SummaryCard.vue'
import { usePortfolioStore } from './stores/portfolio'

const portfolioStore = usePortfolioStore()
const isDarkMode = ref(false)

// Check local storage for saved theme on load
onMounted(() => {
  portfolioStore.fetchHoldings()
  const savedTheme = localStorage.getItem('portfolio-theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark-theme')
  }
})

// Toggle function
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('portfolio-theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('portfolio-theme', 'light')
  }
}
</script>

<style>
/* ========================================= */
/* GLOBAL CSS VARIABLES (LIGHT & DARK THEMES)*/
/* ========================================= */
:root {
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --text-main: #2d3748;
  --text-muted: #718096;
  --border-color: #e2e8f0;
  --nav-bg: #ffffff;
  --nav-hover: #f7fafc;
  --nav-active: #ebf8f6;
  --nav-active-text: #319795;
  --blue-primary: #2b6cb0;
  --blue-hover: #2c5282;
  --green-gain: #38a169;
  --red-loss: #e53e3e;
}

/* When the 'dark-theme' class is added to the HTML tag, these variables override the ones above */
html.dark-theme {
  --bg-color: #1a202c;         /* Deep dark blue/gray */
  --card-bg: #2d3748;          /* Slightly lighter dark gray for cards */
  --text-main: #f7fafc;        /* Off-white text */
  --text-muted: #a0aec0;       /* Light gray muted text */
  --border-color: #4a5568;     /* Dark border */
  --nav-bg: #2d3748;
  --nav-hover: #4a5568;
  --nav-active: #1a202c;
  --nav-active-text: #4fd1c5;  /* Brighter teal for dark mode */
  --blue-primary: #4299e1;     /* Brighter blue */
  --blue-hover: #3182ce;
  --green-gain: #68d391;       /* Brighter green */
  --red-loss: #fc8181;         /* Brighter red */
}

/* Apply global background and text colors */
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease; /* Smooth fade effect */
}

#app-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

/* Update Nav Styles to use variables */
.segment-nav {
  display: flex;
  justify-content: space-between; /* Pushes toggle to the right */
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}
.nav-links { display: flex; }
.nav-item {
  padding: 15px 25px;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  border-right: 1px solid var(--border-color);
  transition: background-color 0.2s, color 0.2s;
}
.nav-item:hover { background-color: var(--nav-hover); color: var(--text-main); }
.nav-item.router-link-active {
  background-color: var(--nav-active);
  color: var(--nav-active-text);
  border-bottom: 3px solid var(--nav-active-text);
}

/* Theme Toggle Button */
.theme-toggle-btn {
  background: transparent;
  border: none;
  border-left: 1px solid var(--border-color);
  padding: 0 20px;
  color: var(--text-main);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.theme-toggle-btn:hover { background-color: var(--nav-hover); }
</style>