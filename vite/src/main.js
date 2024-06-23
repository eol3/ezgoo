import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueAxios from "vue-axios";
import { axios } from "./tools/requestCache";

// import './assets/global.scss';
import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.css'

createApp(App)
	.use(store)
	.use(router)
	.use(VueAxios, axios)
	.mount('#app')

store.dispatch('getLocalUser')