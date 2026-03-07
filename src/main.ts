import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 1. Create the Vue application instance
const app = createApp(App)

// 2. Register Pinia (for global state management, like holding your portfolio data)
app.use(createPinia())

// 3. Register Vue Router (for handling URLs and navigation)
app.use(router)

// 4. Mount the app to the DOM
app.mount('#app')