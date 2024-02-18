<template>
	<div v-if="nodata" class="text-center py-5">
		尚無資料
	</div>
	<div class="my-2" v-for="(item, key) in list">
		<router-link :to="'/store/' + item.store.id">
			{{ item.store.name }}
		</router-link>
	</div>
</template>

<script>
export default {
	data() {
		return {
			nodata: false,
			list: []
		}
	},
	created() {
		this.axios.get('/user/store/?withStore=true').then(response => {
  		this.list = response.data
			if (this.list.length === 0) {
				this.nodata = true
			}
  	})
	}
}
</script>