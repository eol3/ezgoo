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
    		<router-link class="nav-link me-0" to="/cart">
    			<i class="fas fa-shopping-cart text-black"></i>
  			</router-link>
  		</li>
  		<li class="nav-item">
    		<router-link class="nav-link" to="/login">
    			<i class="fas fa-user text-black"></i>
  			</router-link>
  		</li>
  	</ul>
  </nav>
	<router-view v-slot="{ Component }">
    <keep-alive include="">
      <component :is="Component"/>
    </keep-alive>
  </router-view>
  <div class="footer">
    <div class="text-center p-3 bg-2">
      © 2021 EzGOO
    </div>
  </div>
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

<style>
.navbar {
  border-bottom: 1px solid $gray-300;
}
</style>