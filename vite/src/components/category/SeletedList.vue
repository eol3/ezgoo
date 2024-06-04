<template>
  <button
    class="ms-1 btn btn-outline-primary btn-sm d-flex align-items-center"
    v-for="(item, key) in selectedCategories"
    :key="key"
    :disabled="loading"
    @click="unSelectedItem(item)"
  >
    {{ item.name }}
    <i class="ms-1 fa-regular fa-circle-xmark"></i>
  </button>
</template>

<script setup>
const props = defineProps({
	selectedCategories: {
		type: Array,
		default: []
	},
	loading: {
	  type: Boolean,
	  default: false
	}
})

const emit = defineEmits(['unselected-item'])

function unSelectedItem(item) {
  emit('unselected-item', item)
}
</script>