<template>
	<div :class="['slider h-100', {'active': $store.state.showSlider.left}]">
    <nav class="navbar navbar-expand p-3">
      <ul class="navbar-nav">
  			<li class="nav-item cursor-pointer d-xl-none d-flex align-items-center" @click="clickCloseSlider">
  				<span class="nav-link icon-link">
  	      	<i class="fas fa-bars fa-fw"></i>
  	      </span>
  			</li>
  			<li class="nav-link nav-item">
  				<router-link to="/" class="d-flex align-items-center text-gray-800 text-decoration-none">
  		      <img width="100" src="@/assets/logo.png" />
  		    </router-link>
  			</li>
  		</ul>
		</nav>
    <ul class="nav nav-pills flex-column mb-auto py-1 px-3">
      <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('home')}]">
        <router-link :to="getUrl('')" @click="clickCloseSlider" class="nav-link">
          <i class="fas fa-th-large fa-fw me-2"></i>
          總覽
        </router-link>
      </li>
      <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('post')}]">
        <router-link :to="getUrl('post')" @click="clickCloseSlider" class="nav-link" aria-current="page">
          <i class="fas fa-bullhorn fa-fw me-2"></i>
          貼文管理
        </router-link>
      </li>
      <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('product')}]">
        <router-link :to="getUrl('product')" @click="clickCloseSlider" class="nav-link" aria-current="page">
          <i class="fas fa-cube fa-fw me-2"></i>
          產品管理
        </router-link>
      </li>
      <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('order')}]">
        <router-link :to="getUrl('order')" @click="clickCloseSlider" class="nav-link" aria-current="page">
          <i class="fas fa-shopping-bag fa-fw me-2"></i>
          訂單管理
        </router-link>
      </li>
      <!-- <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('event')}]">
        <router-link :to="getUrl('event')" @click="clickCloseSlider" class="nav-link">
          <i class="fa-solid fa-percent fa-fw me-2"></i>
          優惠工具
        </router-link>
      </li> -->
      <!-- <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('member')}]">
        <router-link :to="getUrl('member')" @click="clickCloseSlider" class="nav-link">
          <i class="fas fa-users fa-fw me-2"></i>
          會員
        </router-link>
      </li> -->
      <li :class="['narmal-link-wrap mb-2 rounded-3', {active: checkUrl('setting')}]">
        <router-link :to="getUrl('setting')" @click="clickCloseSlider" class="nav-link">
          <i class="fas fa-sliders-h fa-fw me-2"></i>
          設定
        </router-link>
      </li>
    </ul>
  </div>
  <div
    class="slidebar-overlay"
    :class="{'d-block': $store.state.showSlider.left}"
    @click="clickCloseSlider"
  ></div>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();

const emit = defineEmits(['close-slider'])

function clickCloseSlider() {
  emit('close-slider', false)
}
function getUrl(path) {
  return '/manage/store/' + route.params.storeId + (path === '' ? '' : '/' + path)
}
function checkUrl(path) {
  let baseUrl = '/manage/store/' + route.params.storeId
  if (path === 'home') {
    if (route.path === baseUrl) return true
  }
  let url = baseUrl + (path === 'home' ? '' : '/' + path)
  if (path === 'home') {
    if (route.path === url) return true
  } else if (route.path.indexOf(url) > -1) return true
}
</script>

<style lang="scss">
.slider {
  background-color: white;
	transform: translateX(-100%);
	position: fixed;
	max-height: 100vh;
	width: 290px;
	border-right: 1px solid $gray-300;
	transition: transform 450ms ease,width 450ms ease;
  box-shadow: 0px 1px 3px 0px rgba(54, 74, 99, 0.05);
  z-index: 5;
}

[data-bs-theme="dark"] {
  .slider {
    background-color: black;
  }
}

[data-bs-theme=dark] .slider {
  border-right: 1px solid $gray-600;
}

.slidebar-overlay {
  display: none;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  background: rgba(16, 25, 36, .4);
  z-index: 4;
}

.slider.active {
  transform: translateX(0);
}

.slider-right {
	transform: translateX(100%);
	position: fixed;
	max-height: 100vh;
	width: 290px;
	transition: transform 450ms ease,width 450ms ease;
  box-shadow: 0px 1px 3px 0px rgba(54, 74, 99, 0.05);
  z-index: 2;
  top: 72px;
  right: 0;
}

.slider-right.active {
  transform: translateX(0);
}

@media (min-width: 1200px) {
	.slider {
		transform: translateX(0);
	}
}
</style>