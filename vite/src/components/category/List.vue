<template>
  <!-- <div class="narmal-link-wrap d-flex justify-content-between mb-1 rounded-3">
    <div class="w-100 p-2 rounded-3 cursor-pointer" @click="emit('selected-item', 'root')">
      所有分類
    </div>
  </div> -->
  <template v-for="(item, key) in allCategories" :key="key">
    <item
      :children-category="item"
      :expand="true"
      :showShildrenNumber="showShildrenNumber"
      @selected-item="selectedItem"
      @unselected-item="unSelectedItem"
    >
      <slot v-if="item.id !== 'root'"></slot>
    </item>
  </template>
</template>

<script setup>
import Item from "@/components/category/Item.vue";

const props = defineProps({
	allCategories: {
		type: Array,
		default: []
	},
  showShildrenNumber: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['selected-item', 'unselected-item'])

function selectedItem(item) {
  emit('selected-item', item)
}

function unSelectedItem(item) {
  emit('unselected-item', item)
}

</script>