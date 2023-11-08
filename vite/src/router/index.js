import { createRouter, createWebHistory } from 'vue-router'

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
        path: "cart",
        component: () => import("../views/Cart.vue")
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
