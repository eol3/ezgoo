<template>
	<div>
		<div class="d-flex justify-content-between pb-3">
			<div class="fs-5 fw-5 my-auto">{{ title }}</div>
			<div>
				<router-link v-show="!showBack" class="btn btn-outline-success btn-sm me-1" :to="'/manage/store/' + $route.params.storeId + '/product/category'">
					<i class="fa-solid fa-folder-open"></i>
					管理商品分類
				</router-link>
				<router-link v-show="!showBack" class="btn btn-outline-primary btn-sm" :to="'/manage/store/' + $route.params.storeId + '/product/new'">
					<i class="fa-solid fa-plus"></i>
					新增商品
				</router-link>
				<a v-show="showBack" class="btn btn-outline-secondary btn-sm" @click="$router.go(-1)">
					<i class="fas fa-arrow-left"></i>
					返回
				</a>
			</div>
		</div>
		<router-view v-slot="{ Component, route  }" @updateLayoutStatus="updateStatus">
      <component :is="Component"/>
		</router-view>
	</div>
</template>

<script>

export default {
	data() {
    return {
      title: '商品列表',
      showBack: false,
			clearCache: true,
    };
  },
  methods: {
  	updateStatus(status) {
  		this.title = status.title
  		this.showBack = status.showBack
  	}
  },
}

</script>