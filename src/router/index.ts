import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'overview', component: DashboardView },
    { path: '/equity', name: 'equity', component: DashboardView },
    { path: '/mutual-funds', name: 'mutual-funds', component: DashboardView },
    { path: '/fds', name: 'fds', component: DashboardView },
    { path: '/foreign', name: 'foreign', component: DashboardView }
  ]
})

export default router