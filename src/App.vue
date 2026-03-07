<template>
  <div id="app-container">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
/* A tiny bit of global reset styling */
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}
#app-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>