<template>
  <nav class="navbar navbar-expand">
    <router-link class="navbar-brand" to="/">
      <img width="100" :src="logo" />
    </router-link>
    <ul class="navbar-nav ml-auto">
      <li class="nav-item">
        <router-link class="nav-link" to="/cart">
          <img width="20" class="pb-1" :src="cart" />
        </router-link>
      </li>
      <li class="nav-item pointer" data-toggle="modal" data-target="#registerModal">
        <span class="nav-link">註冊</span>
      </li>
      <li class="nav-item pointer" data-toggle="modal" data-target="#loginModal">
        <span class="nav-link">登入</span>
      </li>
    </ul>
  </nav>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <alert />
  <modals />
</template>
<script>
// import { reactive } from "vue";
import Alert from "@/components/Alert.vue";
import Modals from "@/components/Modals.vue";
import logo from "@/assets/logo.png";
import cart from "@/assets/icons/cart_black.jpg";

export default {
  components: {
    Alert,
    Modals
  },
  data() {
    return {
      logo: logo,
      cart: cart,
    }
  },
}
</script>
