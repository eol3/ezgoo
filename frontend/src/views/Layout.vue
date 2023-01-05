<template>
	<div>ezgoo</div>
	<alert />
</template>

<script>
import Alert from "@/components/Alert.vue";

export default {
	components: {
    Alert
  },
  created() {
    this.axios.get('/product/31').catch(() => {})
  }
}

</script>