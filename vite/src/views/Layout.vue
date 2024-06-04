<template>
	<nav class="navbar navbar-expand navbar-border-bottom px-3">
		<a @click="$router.go(-1)" class="mt-1 pe-2 cursor-pointer text-black text-decoration-none" v-if="isShowBack()">
			<i class="fa-solid fa-chevron-left"></i>
		</a>
		<router-link class="navbar-brand pb-1" to="/">
      <img width="100" src="@/assets/logo.png" alt="EzGOO"/>
    </router-link>
    <ul class="navbar-nav ms-auto">
    	<li class="nav-item">
    		<router-link class="nav-link me-0" to="/cart">
    			<i class="fas fa-shopping-cart"></i>
  			</router-link>
  		</li>
  		<li class="nav-item">
    		<router-link class="nav-link" :to="$store.state.localUser ? '/user' : '/login'">
    			<i class="fas fa-user"></i>
  			</router-link>
  		</li>
  	</ul>
	</nav>
  <router-view/>
  <div class="footer">
    <div class="text-center p-3 bg-2">
      © 2021 EzGOO
    </div>
  </div>
</template>


<script setup>
import { useRoute, useRouter } from "vue-router";

const route = useRoute()
const router = useRouter()

function isShowBack() {
	if (route.params.productId || route.params.postId) return true
}
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>