<template>
	<div v-if="nodata" class="text-center py-5">
		尚無資料
	</div>
	<div class="my-3" v-for="(item, key) in list">
		<div class="row justify-content-around align-items-center">
			<div class="col-7">
				<router-link :to="'/store/' + item.store.id" class="ms-4 text-decoration-none">
					<img
						src="https://placehold.co/200"
						class="rounded-circle avatar-image"
						width="60"
					/>
					{{ item.store.name }}
				</router-link>
			</div>
			<div class="col-5">
				<router-link class="btn btn-sm btn-outline-success me-2" :to="'/manage/store/' + item.store.id">管理後臺</router-link>
			</div>
		</div>
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