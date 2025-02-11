<template>
	<div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-lg-10">
				<div class="row">
					<div class="col-md-6">
						<div class="form-group mt-2">
							<label class="form-label">商品名稱</label>
							<input type="text" class="form-control" v-model="formData.name" placeholder="請輸入商品名稱">
						</div>
						<div class="form-group mt-2">
							<label class="form-label">售價</label>
							<input type="number" class="form-control" v-model="formData.price" :disabled="loading">
						</div>
						<div class="form-group mt-2">
							<label class="form-label">數量</label>
							<input type="number" class="form-control" v-model="formData.number" :disabled="loading">
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group mt-2">
							<label class="form-label">規格</label>
							<input type="text" class="form-control">
						</div>
						<div class="form-group mt-2">
							<label class="form-label">分類</label>
							<input type="text" class="form-control">
						</div>
						<div class="form-group mt-2">
							<label class="form-label">描述</label>
							<textarea class="form-control" rows="5" v-model="formData.describe" :disabled="loading"></textarea>
						</div>
						<hr />
						<div class="form-group mt-2">
							<label class="form-label">狀態</label>
							<select class="form-select" v-model="formData.status" :disabled="loading">
								<option selected value="0">未上架</option>
								<option value="1">上架</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-md-auto">
				<button class="btn btn-outline-success" @click="save()">儲存</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { axios } from "@/tools/requestCache";

const store = useStore()
const router = useRouter()
const route = useRoute()
const emit = defineEmits(['updateLayoutStatus'])

emit('updateLayoutStatus', {
  title: '新增商品',
  showBack: true,
})

const formData = ref({
  name: '',
  price: 0,
  number: 1,
})
const loading = ref(false)

axios.get('/product/' + route.params.productId, { params: { storeId: 16 } }).then(response => {
  // console.log(response)
  // formData.value = response.data
  for (const [key, value] of Object.entries(response.data)) {
    if (formData.value.hasOwnProperty(key)) formData.value[key] = value
  }
})

function save() {
  axios.put('/product/' + route.params.productId, formData.value, { params: { storeId: 16 } }).then(response => {
    console.log(response)
    store.dispatch('showAlert', {
      type: 'success',
      text: '修改成功'
    })
    router.go(-1)
  })
}
</script>