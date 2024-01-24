import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

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
      },
      {
        path: "user",
        component: () => import("../views/user/Head.vue"),
        meta: { requiresAuth: true, redirect: 'login' },
        children: [
          {
            path: "",
            component: () => import("../views/user/Profile.vue"),
          },
          {
            path: "orders",
            component: () => import("../views/user/Orders.vue"),
          },
          {
            path: "store",
            component: () => import("../views/user/Store.vue"),
          }
        ]
      },
      {
        path: "user/forgot",
        component: () => import("../views/user/Forgot.vue"),
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
        path: "/store/create",
        component: () => import("../views/store/Create.vue"),
        meta: { requiresAuth: true, redirect: 'register' },
      },
      {
        path: "/store/:storeId",
        name: "storeHead",
        component: () => import("../views/store/Head.vue")
      },
    ],
  },
  {
    path: '/manage',
    component: () => import('../views/manage/Layout.vue'),
    meta: { requiresAuth: true, redirect: 'login' },
    children: [
      {
        path: 'store/:storeId',
        component: () => import("../views/manage/Home.vue")
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    if (store.state.localUser === null) {
      store.dispatch('userLogout')
      store.dispatch("showAlert", {
        type: "warning",
        text: (to.meta.redirect === 'login') ? '請先登入' : '請先註冊'
      })
      return {
        query: {
          redirect: encodeURI(window.location.pathname)
        },
        path: '/' + to.meta.redirect,
      }
    }
	}
})

export default router
