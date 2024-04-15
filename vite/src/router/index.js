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
        component: () => import("../views/store/Head.vue"),
        children: [
          {
            path: "",
            component: () => import("../views/store/Home.vue")
          },
          {
            path: "product",
            component: () => import("../views/store/product/List.vue")
          },
          {
            path: "product/:productId",
            component: () => import("../views/store/product/Detail.vue")
          },
          {
            path: "post",
            component: () => import("../views/store/post/List.vue")
          },
          {
            path: "post/:postId",
            component: () => import("../views/store/post/Detail.vue")
          },
          {
            path: "about",
            component: () => import("../views/store/About.vue")
          },
        ]
      },
      {
        path: "/product/:productId",
        component: () => import("../views/store/product/Detail.vue"),
      },
    ],
  },
  {
    path: '/manage/store/:storeId',
    component: () => import('../views/manage/Layout.vue'),
    meta: { requiresAuth: true, redirect: 'login' },
    children: [
      {
        path: '',
        component: () => import("../views/manage/Home.vue"),
      },
      {
        path: "product",
        component: () => import("../views/manage/product/Layout.vue"),
        children: [
          {
            path: "",
            name: "ProductList",
            component: () => import("../views/manage/product/List.vue"),
          },
          {
            path: "new",
            component: () => import("../views/manage/product/Form.vue"),
          },
          {
            path: ":productId/edit",
            component: () => import("../views/manage/product/Form.vue"),
          },
          {
            path: ":productId/variant",
            component: () => import("../views/manage/product/Variant.vue"),
          },
        ]
      },
      {
        path: "product/category", // 避免在layout cache
        component: () => import("../views/manage/product/Category.vue"),
      },
      {
        path: "productCache",
        component: () => import("../views/manage/productCache/Layout.vue"),
        children: [
          {
            path: "",
            component: () => import("../views/manage/productCache/List.vue"),
          },
          {
            path: "new",
            component: () => import("../views/manage/productCache/Form.vue"),
          },
          {
            path: ":productId/edit",
            component: () => import("../views/manage/productCache/Form.vue"),
          },
        ]
      },
      {
        path: "post",
        component: () => import("../views/manage/post/Layout.vue"),
        children: [
          {
            path: "",
            component: () => import("../views/manage/post/List.vue"),
          },
          {
            path: "new",
            component: () => import("../views/manage/post/Form.vue"),
          },
          {
            path: ":postId/edit",
            component: () => import("../views/manage/post/Form.vue"),
          }
        ]
      },
      {
        path: "order",
        component: () => import("../views/manage/order/Layout.vue"),
        children: [
          {
            path: "",
            component: () => import("../views/manage/order/List.vue"),
          },
          {
            path: "new",
            component: () => import("../views/manage/order/Form.vue"),
          },
          {
            path: "edit/:orderId",
            component: () => import("../views/manage/order/Form.vue"),
          }
        ]
      },
      {
        path: "member",
        component: () => import("../views/manage/member/Layout.vue"),
        children: [
          {
            path: "",
            component: () => import("../views/manage/member/List.vue"),
          },
          {
            path: "new",
            component: () => import("../views/manage/member/Form.vue"),
          },
          {
            path: "edit/:memberId",
            component: () => import("../views/manage/member/Form.vue"),
          }
        ]
      },
      {
        path: "setting",
        component: () => import("../views/manage/setting/Layout.vue"),
        children: [
          {
            path: "",
            component: () => import("../views/manage/setting/List.vue"),
          },
          {
            path: "new",
            component: () => import("../views/manage/setting/Form.vue"),
          },
          {
            path: "edit/:postId",
            component: () => import("../views/manage/setting/Form.vue"),
          }
        ]
      },
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
