<template>
	<div>
		<div class="d-flex justify-content-between pb-3">
			<div class="manage-title fs-5 fw-5 my-auto">{{ title }}</div>
			<div>
				<router-link v-show="!showBack" class="btn btn-outline-success btn-sm me-1" :to="'/manage/store/' + $route.params.storeId + '/post/category'">
					<i class="fa-solid fa-folder-open"></i>
					管理貼文分類
				</router-link>
				<router-link v-show="!showBack" class="btn btn-outline-primary btn-sm" :to="'/manage/store/' + $route.params.storeId + '/post/new'">
					<i class="fa-solid fa-plus"></i>
					新增貼文
				</router-link>
				<a v-show="showBack" class="btn btn-outline-secondary btn-sm" @click="$router.go(-1)">
					<i class="fas fa-arrow-left"></i>
					返回
				</a>
			</div>
		</div>
		<router-view v-slot="{ Component, route  }" @updateLayoutStatus="updateStatus">
			<keep-alive>
				<component :is="Component" :key="route.path"/>
			</keep-alive>
		</router-view>
	</div>
</template>

<script>

export default {
	data() {
    return {
      title: '貼文列表',
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