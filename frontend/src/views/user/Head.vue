<template>
  <div class="container my-3">
    <div class="row">
		  <div class="col-lg-8 mx-auto">
		    <ul class="nav nav-tabs">
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: $route.path === '/user' }" to="/user">
              個人資料
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: $route.path === '/user/orders' }" to="/user/orders">
              我的訂單
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: $route.path === '/user/store' }" to="/user/store">
              我的商店
            </router-link>
          </li>
        </ul>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { setHead } from '@/tools/libs'

export default {
  data() {
    return {
    }
  },
  created() {
    setHead({ title: '個人中心' })
  }
}
</script>