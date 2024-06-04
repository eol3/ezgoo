<template>
	<div class="modal fade" id="addCartModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">加入購物車</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" v-if="product">
          <div class="mt-2">
            <p v-if="product.name === ''" class="card-text text-secondary fst-italic">尚無內容</p>
            <h4 v-else class="fw-bold">{{ product.name }}</h4>
          </div>
          <div>
            <span class="fs-5 text-primary">
              ${{ selectedProductVariant ? selectedProductVariant.price : product.price }}
            </span>
          </div>
          <div class="my-2">
            <div v-for="(pItem, pKey) in product.options" :key="pKey" class="mb-1">
              <span class="fw-bold">{{ pItem.name }}</span>
              <div class="d-flex align-items-center">
                <button
                  class="ms-1 btn btn-outline-secondary btn-sm"
                  :class="{ active: selectedOptions.indexOf(item) > -1 }"
                  v-for="(item, key) in pItem.values"
                  :key="key"
                  @click="clickOption(pKey, item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </div>
          <div class="d-flex my-3">
            <div class="product-number-group input-group me-2">
              <button class="btn btn-outline-secondary" @click="minus()">
                <i class="fa-solid fa-minus"></i>
              </button>
              <input type="number" class="form-control" v-model="choiceNumber">
              <button class="btn btn-outline-secondary" @click="choiceNumber += 1">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <button class="btn btn-outline-primary btn-sm" @click="addCart()">加入購物車</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { onMounted, ref, reactive, watch  } from 'vue'
import { axios } from "@/tools/requestCache";
import { useStore } from "vuex";
import { setCart } from '@/tools/libs'

const store = useStore()

const props = defineProps({
	product: {
		type: Object,
		default: null
	},
})

const storeInfo = ref(null)
const loading = ref(false)
const selectedOptions = ref([null, null, null]) // ['red', 'xl']
const proudctVariant = ref([])
const selectedProductVariant = ref(false)
const choiceNumber = ref(1)

const queryObj = reactive({
  storeId: null,
  status: '1'
})
if (store.state.preview) {
  delete queryObj.status
}

let modal = reactive({})
onMounted(async () => {
  var modalEl = document.getElementById('addCartModal')
  modal = new Modal(modalEl)
})

watch(() => props.product , async (newValue) => {
  selectedProductVariant.value = false
  choiceNumber.value = 1
  queryObj.storeId = props.product.storeId
  storeInfo.value = await store.dispatch('getCache', 'currentStore')
  getProductVariant()
})

function getProductVariant() {
  axios.get('/product/' + props.product.id + '/variant', {
    params: queryObj
  }).then((response) => {
    proudctVariant.value = response.data
    proudctVariant.value.forEach(e =>
      e.productOption = e.productOption ? JSON.parse(e.productOption) : []
    )
  })
}

function clickOption(pKye, item) {
  if (selectedOptions.value[pKye] === item) {
    selectedOptions.value[pKye] = null
  } else {
    selectedOptions.value[pKye] = item
  }
  const found = proudctVariant.value.find(e => isSame(e.productOption, selectedOptions.value))
  if (found) {
    selectedProductVariant.value = {
      id: found.id,
      price: found.price,
    }
  } else {
    selectedProductVariant.value = false
  }
}

function isSame(array1, array2) {
  return (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index]; 
  });
}

function minus() {
  choiceNumber.value -= 1
  if (choiceNumber.value < 1) choiceNumber.value = 1
}

function addCart() {
  if (store.state.preview) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '預覽模式無法新增至購物車'
    })
    return
  }
  if (storeInfo.value.status === 2) {
    store.dispatch('showAlert', {
      type: 'warning',
      text: '商店僅展示無法下單'
    })
    return
  }
  props.product.selectedOptions = selectedOptions.value
  props.product.variant = selectedProductVariant.value
  props.product.choiceNumber = choiceNumber.value
  setCart(storeInfo.value, props.product);
  store.dispatch('showAlert', {
    type: 'success',
    text: '成功加入購物車'
  })
  modal.hide()
}
</script>

<style lang="scss" scoped>
.product-number-group {
  width: 140px
}

.product-number-group > input {
  text-align: center;
  border-color: var(--d-gray-600);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

input[type=number] {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>