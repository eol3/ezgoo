<template>
  <div v-if="publishedAt" class="text-secondary">
    {{ fieldText }}：{{ formatDate(publishedAt) }}
  </div>
</template>

<script setup>

const props = defineProps({
	fieldText: {
		type: String,
		default: null
	},
  publishedAt: {
		type: String,
		default: null
	},
})

function formatDate(date) {
  return new Date(date).toLocaleString()
}
</script>