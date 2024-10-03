<template>
	<nav class="navbar navbar-expand navbar-border-bottom px-3">
		<a @click="$router.go(-1)" class="mt-1 pe-2 cursor-pointer text-black text-decoration-none" v-if="isShowBack()">
			<i class="fa-solid fa-chevron-left"></i>
			返回
		</a>
		<router-link class="navbar-brand pb-1" to="/" v-if="!isShowBack()">
      <img width="100" src="@/assets/logo.png" alt="EzGoo"/>
    </router-link>
    <ul class="navbar-nav ms-auto">
    	<li class="nav-item position-relative" @click="cartRead()">
    		<router-link class="nav-link me-0" to="/cart">
    			<i class="fas fa-shopping-cart"></i>
					<span
						v-if="store.state.cart.number > 0"
						class="position-absolute translate-middle badge rounded-pill"
						:class="store.state.cart.isRead ? 'bg-secondary' : 'bg-danger'"
						style="top: 10px; right: -20px;"
					>
						{{ store.state.cart.number }}
						<span class="visually-hidden">unread messages</span>
					</span>
  			</router-link>
  		</li>
  		<li class="nav-item">
    		<router-link class="nav-link" :to="$store.state.localUser ? '/user' : '/login'">
    			<i class="fas fa-user"></i>
  			</router-link>
  		</li>
  	</ul>
	</nav>
	<div class="flex-grow-1 d-flex flex-column">
		<router-view/>
	</div>
  <div class="footer">
    <div class="text-center p-3 bg-2">
      © 2021 ~ 2024 EzGoo
			<router-link class="text-decoration-none" to="/page/terms-of-service">
				服務條款
			</router-link>
			·
			<router-link class="text-decoration-none" to="/page/privacy-policy">
				隱私權政策
			</router-link>
			·
			<a class="text-decoration-none" href="mailto:support@ezgoo.biz">聯絡信箱</a>
    </div>
  </div>
</template>


<script setup>
import { onMounted } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { getCartItemNumber } from '@/tools/libs'
import { axios } from "@/tools/requestCache";

const store = useStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  let c = localStorage.getItem("cart")
	let cart = []
	if (c) cart = JSON.parse(c)
	let number = getCartItemNumber(cart)

	let isRead = true
	let cir = localStorage.getItem("cartIsRead")
  if (cir) isRead = JSON.parse(cir)
	store.commit('setCart', {
		number: number,
		isRead: isRead
	})
})

function cartRead() {
	store.commit('setCart', {
		isRead: true
	})
	localStorage.setItem("cartIsRead", true)
	if (store.state.localUser) {
		axios.put('/user/cart', { isRead: true })
	}
}

function isShowBack() {
	if (route.params.productId || route.params.postId) return true
}
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>