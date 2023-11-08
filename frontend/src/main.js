import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueAxios from "vue-axios";
import axios from "./tools/request"

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/custom.scss';
import '@fortawesome/fontawesome-free/css/all.css'

createApp(App)
	.use(store)
	.use(router)
	.use(VueAxios, axios)
	.mount('#app')
