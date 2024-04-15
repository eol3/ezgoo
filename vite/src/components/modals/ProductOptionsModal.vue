<template>
	<div class="modal fade" id="productOptionsModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">設定商品選項</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-for="(item, pkey) in options">
            <div class="input-group mb-2">
              <input type="text" class="form-control" v-model="item.name" :disabled="loading" :placeholder="pkey === 0 ? 'Ex: 顏色' : ''"/>
              <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="delOption(pkey)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <div class="ms-4">
              <div v-for="(value, key) in item.values" :key="key" class="input-group mb-2">
                <input type="text" class="form-control" v-model="item.values[key]" :disabled="loading" :placeholder="pkey === 0 ? placeholderExText[key] : ''"/>
                <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="delSubOption(pkey, key)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <div class="my-2">
                <button class="btn btn-outline-primary btn-sm" @click="newSubOption(pkey)">新增子項目</button>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <button class="btn btn-outline-primary" @click="newOption">新增商品選項</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="confirm()" :disabled="loading">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { Modal } from 'bootstrap'
import { onMounted, reactive, ref  } from 'vue'
import { axios } from "@/tools/requestCache";

const store = useStore()
const route = useRoute()

const props = defineProps({
  productId: {
		type: String,
		default: ''
	},
})

const emit = defineEmits(['needNewItem', 'selectedOptions'])
defineExpose({ setParentOptions })

let modal = reactive({})
const loading = ref(false)
const options = ref([{
  name: '',
  values: ['','', '']
}])
const placeholderExText = ref(['紅', '藍', '綠'])

onMounted(() => {
  var modalEl = document.getElementById('productOptionsModal')
  modal = new Modal(modalEl)
})

function confirm() {
  if (!checkOptions()) return
  loading.value = true
  if (!props.productId) {
    emit('needNewItem', setOptions)  
  } else {
    setOptions()
  }
}

function checkOptions() {
  if (options.value.length > 3) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '商品選項不能超過3層'
    })
    return false
  }

  for (const item of options.value) {
    if (item.name === '') {
      store.dispatch('showAlert', {
        type: 'warning',
        text: '尚有商品選項未填寫'
      })
      return false
    }
    for (const value of item.values) {
      if (value === '') {
        store.dispatch('showAlert', {
          type: 'warning',
          text: '尚有商品選項未填寫'
        })
        return false
      }
    }
  }

  return true
}

function setOptions() {
  axios.put('/product/' + props.productId, {
    options: options.value
  }, {
    params: { storeId: route.params.storeId }
  }).then(() => {
    emit('selectedOptions', options.value)
    modal.hide()
  }).finally(() => {
    loading.value = false
  })
}

function setParentOptions(parentOptions) {
  options.value = JSON.parse(JSON.stringify(parentOptions))
}

function newSubOption(pkey) {
  options.value[pkey].values.push('')
}

function delSubOption(pkey, key) {
  if (pkey === 0) {
    placeholderExText.value.splice(key, 1)
  }
  options.value[pkey].values.splice(key, 1)
}

function newOption() {
  options.value.push({
    name: '',
    values: ['','', '']
  })
}

function delOption(pkey) {
  options.value.splice(pkey, 1)
}

</script>