<template>
  <div class="row justify-content-md-center">
    <div class="col-lg-10">
      <div class="row">
        <div class="col-md-6">
          <ImageUploader
            ref="imageUploaderRef"
            :feildName="'商店封面圖片'"
            :modelId="itemId"
            :parentLoading="loading"
            :parentModelName="'store'"
          ></ImageUploader>
          <AvatorUploader></AvatorUploader>
          <div class="form-group mt-2">
            <label class="form-label">商店名稱</label>
            <input type="text" class="form-control" v-model="formData.name" @focus="formValidClear()" :disabled="loading" placeholder="請輸入商品名稱">
            <div class="form-text text-danger">
              {{ formValidFeild('name') ? formValid.errors.name[0] : '' }}
            </div>
          </div>
          <div class="form-group mt-2">
            <label class="form-label">關於商店</label>
            <textarea class="form-control" rows="5" v-model="formData.about" :disabled="loading"></textarea>
          </div>
          <hr />
          <div class="form-group mt-2">
            <label class="form-label">狀態</label>
            <select class="form-select" v-model="formData.status" :disabled="loading">
              <option selected value="0">未開放</option>
              <option value="1">開放</option>
              <option value="2">僅展示，不能下單</option>
              <option value="3">商店維護中</option>
            </select>
            <div class="form-text text-danger">
              {{ formValidFeild('status') ? formValid.errors.status[0] : '' }}
            </div>
          </div>
          <hr />
          <div class="form-group mt-2">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="swaitch_order" v-model="formData.setting.allowOrderWithoutLogIn">
              <label class="form-check-label" for="swaitch_order">允許未登入下單</label>
            </div>
          </div>
          <div class="row mt-3 justify-content-center">
            <div class="col-auto">
              <button class="btn btn-outline-success" @click="save" :disabled="loading">儲存</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onActivated, ref  } from 'vue'
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ImageUploader from "@/components/StoreImageUploader.vue";
import AvatorUploader from "@/components/StoreAvatorUploader.vue";
import wrapValidator from '@/tools/validator'
import CRUDTools from "@/tools/composition/CRUD";

const store = useStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['updateLayoutStatus'])

const { loading, baseUrl, storeId, itemId,
	modelName, formMode, formData, defineFormData,
	formValid, formValidFeild, formValidClear,
	getItem, saveItem } = CRUDTools()

modelName.value = 'store'
itemId.value = route.params.storeId
formMode.value = 'edit'

defineFormData({
  name: '',
	about: '',
  status: 0,
  setting: {
    untilAmountFreeShipping: null, // 訂單達到多少免運費
    allowOrderWithoutLogIn: true // 允許未登入下單
  }
})

onMounted(() => {
  getItem({ status: 'all' })
})

onActivated(() => {
  emit('updateLayoutStatus', {
    title: '商店基本資料設定',
    showBack: true,
  })
})

async function save() {
  if (loading.value) return

  formData.value.status = Number(formData.value.status)
  
  const validator = wrapValidator(formData.value, {
		name: 'required|string|max:64',
    about: 'string',
	}, 'store');
	
	if (validator.fail) {
		formValid.value = {
			fails: true,
			...validator.errors
		}
		return
	}

  let response = await saveItem()

  store.dispatch('showAlert', {
		type: 'success',
		text: '修改成功'
	})
}

</script>