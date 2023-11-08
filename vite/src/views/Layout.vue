<template>
	<h5>layout</h5>
	<router-link to='/'>home</router-link>
	<router-link to='/cart'>cart</router-link>
	<button class="btn btn-primary">aa</button>
  <router-view/>
</template>

<script>
export default {
	created() {
		this.axios.get('/user').then(response => {
			console.log(response)
		})
	}
}
</script>