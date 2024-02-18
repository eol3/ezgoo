<template>
	<h5>{{ store.name }}</h5>
	<button class="btn btn-primary">test</button>
</template>

<script>
export default {
	data() {
    return {
      store: {}
    }
  },
  created() {
    this.axios.get('/store/' + this.$route.params.storeId + '/dashboard').then(response => {
      this.store = response.data
    })
  },
}
</script>
