<template>
  {{ storeInfo.about }}
</template>

<script setup>
const props = defineProps({
	storeInfo: {
		type: Object,
		default: {}
	},
})
console.log(props.storeInfo)
</script>
