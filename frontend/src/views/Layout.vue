<template>
	<nav :class="['navbar', 'navbar-expand', 'px-3', {'custom-bg': is_home }, {'navbar-border': !is_home}]">
    <span
      v-show="is_item"
      class="pointer cursor-pointer"
      @click="$router.go(-1)"
    >
      <img width="36" src="@/assets/prev.png" />
    </span>
    <router-link class="navbar-brand pb-1" to="/">
      <img v-show="is_home" width="100" src="@/assets/logo_white.png" alt="EzGOO - 易購網路購物平台" />
      <img v-show="!is_home" width="100" src="@/assets/logo.png" alt="EzGOO - 易購網路購物平台" />
    </router-link>
    <ul class="navbar-nav ms-auto">
      <li class="nav-item">
        <router-link class="nav-link" to="/cart">
          <!--<img v-if="is_home" width="20" class="pb-1" :src="cart_white" />-->
          <!--<img v-else width="20" class="pb-1" :src="cart_black" />-->
          <i v-if="is_home" class="fas fa-shopping-cart text-white"></i>
          <i v-else class="fas fa-shopping-cart text-black"></i>
        </router-link>
      </li>
      <li class="nav-item pointer" data-bs-toggle="modal" data-bs-target="#registerModal">
        <span :class="['nav-link', 'cursor-pointer', {'text-white': is_home } ]">註冊</span>
      </li>
      <li class="nav-item pointer" data-bs-toggle="modal" data-bs-target="#loginModal">
        <span :class="['nav-link', 'cursor-pointer', {'text-white': is_home } ]">登入</span>
      </li>
    </ul>
  </nav>
	<router-view v-slot="{ Component }">
    <keep-alive include="">
      <component :is="Component"/>
    </keep-alive>
  </router-view>
	<alert />
</template>

<script>
import Alert from "@/components/Alert.vue";

export default {
	components: {
    Alert
  },
  data() {
    return {
      is_home: false
    }
  },
  created() {
    // this.axios.get('/product/31').catch(() => {})
  }
}

</script>