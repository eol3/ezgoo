<template>
	<div class="my-2" v-for="(item, key) in list">
		<router-link :to="'/store/' + item.id">
			{{ item.name }}
		</router-link>
	</div>
</template>

<script>
export default {
	data() {
		return {
			list: []
		}
	},
	created() {
		this.axios.get('/user/store').then(response => {
  		this.list = response.data
  	})
	}
}
</script>