<template>
	<div>
		<div class="d-flex justify-content-between pb-3">
			<div class="fs-5 fw-5 my-auto">{{ title }}</div>
			<div>
				<a v-show="showBack" class="btn btn-outline-secondary btn-sm" @click="$router.go(-1)">
					<i class="fas fa-arrow-left"></i>
					返回
				</a>
			</div>
		</div>
		<router-view v-slot="{ Component, route  }" @updateStatus="updateStatus">
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
      title: '會員列表',
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