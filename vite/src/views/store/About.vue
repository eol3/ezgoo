<template>
	<div class="row py-4">
		<div class="col-12 col-lg-10 offset-lg-1" v-if="storeInfo">
			<div class="row pb-2 align-items-center">
				<div class="col-auto">
					<label for="inputPassword6" class="col-form-label">商店名稱</label>
				</div>
				<div class="col-auto">
					<div class="text-break">
						{{ storeInfo.name }}
					</div>
				</div>
			</div>
			<div class="row pb-2 align-items-start">
				<div class="col-auto">
					<label for="inputPassword6" class="col-form-label">商店簡介</label>
				</div>
				<div class="col-auto">
					<div class="text-break pt-2" v-html="replaceNewLine(storeInfo.about)"></div>
				</div>
			</div>
			<div class="row pb-2 align-items-center">
				<div class="col-auto">
					<label for="inputPassword6" class="col-form-label">付款方式</label>
				</div>
				<div class="col-auto">
					<div class="text-break">
						{{ getPaymentText() }}
					</div>
				</div>
			</div>
			<div class="row pb-2 align-items-center">
				<div class="col-auto">
					<label for="inputPassword6" class="col-form-label">運送方式</label>
				</div>
				<div class="col-auto">
					<div class="text-break">
						{{ getShippingText() }}
					</div>
				</div>
			</div>
			<div class="row mt-2 pb-2 align-items-center">
				<div class="col-auto">
					<div class="form-check form-switch">
						<input class="form-check-input" type="checkbox" role="switch" id="swaitch_order" v-model="storeInfo.setting.allowOrderWithoutLogIn">
						<label class="form-check-label" for="swaitch_order">允許未登入下單</label>
					</div>
				</div>
			</div>
			<div class="row mb-2 pb-2 align-items-center" v-if="storeInfo.setting.untilAmountFreeShipping">
				<div class="col-auto">
					購物滿「{{ storeInfo.setting.untilAmountFreeShipping }}」免運費
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useStore } from "vuex";

const store = useStore()

const storeInfo = ref(null)
// storeInfo.value = store.dispatch('getCache', 'currentStore')

watch(() => store.state.cache, async () => {
	storeInfo.value = await store.dispatch('getCache', 'currentStore')
}, { deep: true });

onMounted( async () => {
  storeInfo.value = await store.dispatch('getCache', 'currentStore')
})

function getPaymentText() {
	let text = ''
	for (const item of storeInfo.value.payment) {
		if (item.enable) {
			text += item.name + ", "
		}
		
	}
	return text.slice(0, -2)
}

function getShippingText() {
	let text = ''
	for (const item of storeInfo.value.shippingMethod) {
		if (item.enable) {
			text += item.name + ", "
		}
		
	}
	return text.slice(0, -2)
}

function replaceNewLine(str) {
	return str.replace(/\n/g, "<br />")
}
</script>
