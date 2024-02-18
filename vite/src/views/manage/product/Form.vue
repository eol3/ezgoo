<template>
	<div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-md-auto">
				<div class="form-group">
			    <label class="form-label">商品名稱</label>
			    <input type="text" class="form-control" v-model="product.name" placeholder="請輸入商品名稱">
			  </div>
			  <div class="form-group mt-2">
			    <label class="form-label">商品圖片</label>
			    <input type="file" class="form-control">
			  </div>
				<div class="form-group mt-2">
			    <label class="form-label">售價</label>
			    <input type="number" class="form-control" v-model="product.price">
			  </div>
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
			    <textarea class="form-control" rows="3" v-model="product.describe"></textarea>
			  </div>
			  <hr />
			  <div class="form-group mt-2">
			    <label class="form-label">狀態</label>
			    <select class="form-select" v-model="product.status">
					  <option selected value="0">未上架</option>
					  <option value="1">上架</option>
					</select>
			  </div>
		  </div>
		</div>
		<div class="row mt-3 justify-content-md-center">
			<div class="col-md-auto">
				<button class="btn btn-outline-success" @click="save">儲存</button>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			mode: 'new',
			product: {
				name: '',
		    price: 0,
			  status: '0',
			  describe: ''
			}
		}
	},
	created() {
		if (this.$route.path.indexOf('new') > 0) {
			this.$emit('updateStatus', {
	  		title: '新增商品',
	  		showBack: true,
	  	})
		} else {
			this.mode = 'edit'
			this.$emit('updateStatus', {
	  		title: '編輯商品',
	  		showBack: true,
	  	})
	  	this.axios
        .get("/store/" + this.$route.params.store_id + "/product/" + this.$route.params.product_id)
        .then(async response => {
          this.product = response.data;
        });
		}
  	
	},
	methods: {
		save() {
			let method, url = ''
			if (this.mode === 'new') {
				method = 'post'
				url = "/product?storeId=" + this.$route.params.storeId
			} else {
				method = 'put'
				url = "/product/" + this.$route.params.product_id + '?storeId=' + this.$route.params.storeId
			}
			this.axios({
				method: method,
				url: url,
				data: this.product
			})
			.then(response => {
          this.$store.dispatch('showAlert', {
            type: 'success',
            text: response.data.msg
          })
          this.$router.go(-1)
        })
        .catch(error => {
        	console.log(error)
        })
		}
	}
}

</script>