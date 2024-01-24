import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: "",
        component: () => import("../views/Home.vue")
      },
      {
        path: "login",
        component: () => import("../views/user/Login.vue")
      },
      {
        path: "register",
        component: () => import("../views/user/Register.vue")
      },
      {
        path: "/store/:storeId",
        name: "storeHead",
        component: () => import("../views/store/Head.vue")
      },
    ]
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
