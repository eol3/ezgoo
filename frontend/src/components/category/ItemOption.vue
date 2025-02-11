<template>
  <div v-show="expand">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <div class="narmal-link-wrap w-100 d-flex justify-content-between align-items-center mb-1 rounded-3 cursor-pointer" :class="{ active: childrenCategory.active }">
        <div class="w-100 p-2 rounded-3 rounded-3" @click="selectedItem(childrenCategory)">
          {{ childrenCategory.id === 'root' ? '所有分類' : childrenCategory.name }}
        </div>
        <template v-if="hasChildren">
          <span v-show="!childrenCategory.hasExpand" class="py-2 px-3" @click="clickExpand">
            <i class="fa-solid fa-plus"></i>
          </span>
          <span v-show="childrenCategory.hasExpand" class="py-2 px-3" @click="clickCollapse">
            <i class="fa-solid fa-minus"></i>
          </span>
        </template>
        <div class="d-flex ms-2" v-if="formMode !== 'new' && formMode !== 'edit' && childrenCategory.id !== 'root'">
          <div class="p-2 cursor-pointer" @click="doOption('moveUp', childrenCategory)">
            <i class="fa-fw fa-solid fa-arrow-up"></i>
          </div>
          <div class="p-2 cursor-pointer" @click="doOption('moveDown', childrenCategory)">
            <i class="fa-fw fa-solid fa-arrow-down"></i>
          </div>
          <div class="p-2 cursor-pointer" @click="doOption('edit', childrenCategory)">
            <i class="fa-fw fa-solid fa-pen"></i>
          </div>
        </div>
      </div>
    </div>
    <template v-if="hasChildren">
      <div class="ms-4" v-for="(item, key) in childrenCategory.children" :key="key">
        <ItemOption
          :formMode="formMode"
          :children-category="item"
          :expand="childrenCategory.subExpand"
          @selected-item="selectedItem"
          @do-option="doOption"
        ><slot></slot></ItemOption>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  formMode: {
    type: String,
    default: ''
  },
	childrenCategory: {
    type: Object,
    default: () => {}
  },
  expand: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['selected-item', 'do-option'])

const hasChildren = computed(() => {
  let check = (props.childrenCategory.children !== undefined && props.childrenCategory.children.length > 0)
  return check
})

function selectedItem(item) {
  emit('selected-item', item)
}

function doOption(action, data) {
  emit('do-option', action, data)
}

function clickExpand() {
  props.childrenCategory.subExpand = true;
  props.childrenCategory.hasExpand = true;
}
function clickCollapse() {
  props.childrenCategory.subExpand = false;
  props.childrenCategory.hasExpand = false;
}

</script>