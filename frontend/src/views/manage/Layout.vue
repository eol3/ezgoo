<template>
	<div class="manage-layout">
		<slider-bar @close-slider="closeSlider()"></slider-bar>
		<div class="manage-wrap">
			<nav class="navbar navbar-expand manage-head p-3">
				<ul class="navbar-nav d-xl-none">
					<li class="nav-item cursor-pointer d-flex align-items-center" @click="openSlider()">
						<span class="nav-link icon-link">
			      	<i class="fa-solid fa-bars fa-fw"></i>
			      </span>
					</li>
					<li class="nav-link nav-item">
						<router-link to="/" class="d-flex align-items-center text-gray-800 text-decoration-none">
				      <img width="100" src="@/assets/logo.png" />
				    </router-link>
					</li>
				</ul>
				<ul class="navbar-nav ms-auto">
					<li class="nav-item d-flex align-items-center" @click="switchTheme()">
						<div class="nav-link icon-link cursor-pointer">
							<i class="fa-solid fa-circle-half-stroke"></i>
						</div>
					</li>
	        <li class="nav-item dropdown">
	        	<router-link
	            class="nav-link icon-link"
	            :to="'/store/' + $route.params.storeId"
	          >
	        		<i class="fa-solid fa-store fa-fw"></i>
						</router-link>
	        	<!-- <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownStore">
					    <li><router-link class="dropdown-item" :to="'/store/' + $route.params.storeId">商店首頁</router-link></li>
					    <li><router-link class="dropdown-item" :to="'/store/' + $route.params.storeId + '?preview=true'">預覽模式</router-link></li>
					  </ul> -->
	        </li>
	        <!-- <li class="nav-item dropdown">
	        	<div class="nav-link icon-link cursor-pointer" id="dropdownNotify" data-bs-toggle="dropdown" aria-expanded="false">
	        		<i class="fa-solid fa-bell fa-fw"></i>
						</div>
	        	<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownNotify">
					    <li><a class="dropdown-item" href="#">訂單成立...</a></li>
					    <li><a class="dropdown-item" href="#">待出貨...</a></li>
					  </ul>
	        </li> -->
					<li class="nav-item">
	          <router-link
	            class="nav-link icon-link"
	            to="/user/"
	          >
	            <i class="fa-solid fa-user fa-fw"></i>
	          </router-link>
	        </li>
        </ul>
			</nav>
			<div class="container manage-body p-3 p-md-4">
				<router-view></router-view>
			</div>
		</div>
	</div>
</template>

<script>
import SliderBar from "@/components/SliderBar.vue";
import '@/assets/manage.scss';
import { setHead } from '@/tools/libs'

export default {
  components: {
    SliderBar,
  },
	created() {
		setHead({ title: '商家管理後台' })
	},
  methods: {
  	openSlider() {
  		this.$store.commit('setShowSlider', {
	      left: true,
	      right: false,
	      overlay: true,
	    })
  	},
  	closeSlider() {
  		this.$store.commit('setShowSlider', {
	      left: false,
	      right: false,
	      overlay: false,
	    })
  	},
		switchTheme() {
			this.$store.dispatch('switchTheme')
		}
  }
}
</script>