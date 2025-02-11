<template>
  <div v-show="expand">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <div class="narmal-link-wrap w-100 d-flex justify-content-between align-items-center mb-1 rounded-3 cursor-pointer" :class="{ active: childrenCategory.active }">
        <div class="w-100 p-2 rounded-3 rounded-3" @click="clickItem(childrenCategory)">
          {{ childrenCategory.id === 'root' ? '所有分類' : childrenCategory.name }}
          {{ ( showShildrenNumber && childrenCategory.number ) ? '(' + childrenCategory.number + ')' : '' }}
        </div>
        <template v-if="hasChildren">
          <span v-show="!childrenCategory.hasExpand" class="py-2 px-3" @click="clickExpand">
            <i class="fa-solid fa-plus"></i>
          </span>
          <span v-show="childrenCategory.hasExpand" class="py-2 px-3" @click="clickCollapse">
            <i class="fa-solid fa-minus"></i>
          </span>
        </template>
      </div>
      <slot ></slot>
    </div>
    <template v-if="hasChildren">
      <div class="ms-4" v-for="(item, key) in childrenCategory.children" :key="key">
        <item
          :children-category="item"
          :expand="childrenCategory.subExpand"
          :showShildrenNumber="showShildrenNumber"
          @selected-item="selectedItem"
          @unselected-item="unSelectedItem"
        ><slot></slot></item>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	childrenCategory: {
    type: Object,
    default: () => {}
  },
  expand: {
    type: Boolean,
    default: false
  },
  showShildrenNumber: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['selected-item', 'unselected-item'])

const hasChildren = computed(() => {
  let check = (props.childrenCategory.children !== undefined && props.childrenCategory.children.length > 0)
  return check
})

function clickItem(item) {
  if(!item.active) {
    item.active = true
    emit('selected-item', item)
  } else {
    item.active = false
    emit('unselected-item', item)
  }
}

function selectedItem(item) {
  emit('selected-item', item)
}

function unSelectedItem(item) {
  emit('unselected-item', item)
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