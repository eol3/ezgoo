import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// import './assets/global.scss';
import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.css'

createApp(App)
	.use(store)
	.use(router)
	.mount('#app')

store.dispatch('getLocalUser')