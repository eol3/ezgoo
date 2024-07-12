<template>
	<div class="modal fade" :id="elementId" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">選擇分類</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mt-2">
            <SearchBar v-model="word" @clickSearch="clickSearch()"></SearchBar>
          </div>
          <hr v-if="allCategories.length !== 0" />
          <br v-else />
          <CategoryList
            :allCategories="allCategories"
            @selected-item="selectedItem"
            @unselected-item="unSelectedItem"
          >
          </CategoryList>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { onMounted, reactive  } from 'vue'
import CategoryList from "@/components/category/List.vue";
import SearchBar from "@/components/SearchBar.vue"

const props = defineProps({
	elementId: {
		type: String,
		default: 'MobileFilterModal'
	},
  allCategories: {
		type: Array,
		default: []
	}
})

const emit = defineEmits(['selected-item', 'unselected-item'])
const word = defineModel()

let modal = reactive({})

onMounted(() => {
  var modalEl = document.getElementById(props.elementId)
  modal = new Modal(modalEl)
})

function selectedItem(item) {
  modal.hide()
  emit('selected-item', item)
}

function unSelectedItem(item) {
  modal.hide()
  emit('unselected-item', item)
}

function clickSearch() {
  modal.hide()
}

</script>