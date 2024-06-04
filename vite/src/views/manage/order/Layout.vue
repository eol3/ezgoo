<template>
	<div>
		<div class="d-flex justify-content-between pb-3">
			<div class="fs-5 fw-5 my-auto">{{ title }}</div>
			<div>
				<!-- <router-link v-show="!showBack" class="btn btn-outline-primary btn-sm" :to="'/manage/store/' + $route.params.storeId + '/order/new'">
					<i class="fa-solid fa-plus"></i>
					替會員新增訂單
				</router-link> -->
				<a v-show="showBack" class="btn btn-outline-secondary btn-sm" @click="$router.go(-1)">
					<i class="fas fa-arrow-left"></i>
					返回
				</a>
			</div>
		</div>
		<router-view v-slot="{ Component, route  }" @updateLayoutStatus="updateStatus">
			<keep-alive>
				<component :is="Component" :key="route.path" />
			</keep-alive>
		</router-view>
	</div>
</template>

<script>

export default {
	data() {
    return {
      title: '訂單列表',
      showBack: false,
    };
  },
  methods: {
  	updateStatus(status) {
  		this.title = status.title
  		this.showBack = status.showBack
  	}
  }
}

</script>