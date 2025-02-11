<template>
	<div>
		<div class="row justify-content-between pb-3">
			<div class="col-12 col-md-3">
				<div class="fs-5 fw-5 my-auto">{{ title }}</div>
			</div>
			<div class="col-12 col-md-6 text-end">
				<router-link class="btn btn-outline-success btn-sm me-1" :to="'/manage/store/' + $route.params.storeId + '/setting'">
					<i class="fa-solid fa-circle-info"></i>
					基本資料
				</router-link>
				<router-link class="btn btn-outline-success btn-sm me-1" :to="'/manage/store/' + $route.params.storeId + '/setting/payment'">
					<i class="fa-regular fa-credit-card"></i>
					付款設定
				</router-link>
				<router-link class="btn btn-outline-success btn-sm me-1" :to="'/manage/store/' + $route.params.storeId + '/setting/shipping-method'">
					<i class="fa-solid fa-truck-fast"></i>
					運送方式設定
				</router-link>
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
      title: '商店設定',
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