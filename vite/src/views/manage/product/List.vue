<template>
	<div>
		<div class="row justify-content-between">
			<div class="col-12 col-md-4 mb-3 mb-md-0">
				<div class="row">
					<div class="col-auto pe-0">
						<button class="btn btn-outline-secondary btn-sm">批次修改</button>
					</div>
					<div class="col-auto">
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6">
				<div class="row justify-content-end">
					<div class="col-auto pe-0">
						<button class="btn btn-outline-secondary btn-sm">選擇分類</button>
					</div>
					<div class="col-auto pe-0">
						<input type="text" class="form-control">
					</div>
					<div class="col-auto my-auto">
						<button class="btn btn-outline-secondary btn-sm">搜尋</button>
					</div>
				</div>
			</div>
		</div>
    <div v-if="product.length === 0" class="text-center py-5">
      尚無資料
    </div>
		<div v-else class="manage-table">
			<div class="row manage-table-head">
				<div class="col-2 col-md-1 d-flex justify-content-center">
					<div class="form-check mb-0">
					  <input class="form-check-input" type="checkbox" id="productHeadCheck">
					  <label class="form-check-label" for="productHeadCheck">
					    #
					  </label>
					</div>
				</div>
				<div class="col-8 col-md-8">
					<div class="ms-3">
						商品名稱
					</div>
				</div>
				<div class="col-2 col-md-1">
					售價
				</div>
				<div class="col-3 col-md-1 text-center mobile-hide">
					狀態
				</div>
				<div class="col-9 col-md-1 text-center mobile-hide">
					操作
				</div>
			</div>
			<div class="row" v-for="(item, key) in product" :key="key">
				<div class="col-2 col-md-1 d-flex justify-content-center">
					<div class="form-check mb-0">
					  <input class="form-check-input" type="checkbox" :id="'productItemCheck' + item.id">
					</div>
				</div>
				<div class="col-8 col-md-8 d-flex align-items-center">
					<div>
						<img :src="item.thumbnail" width='50'>
					</div>
					<div class="ms-3">
						{{ item.name }}
					</div>
				</div>
				<div class="col-2 col-md-1">${{ item.price }}</div>
				<div class="col-3 col-md-1 text-center">
					<span v-if="item.status === -1">
						<small>
							<i class="fas fa-circle text-secondary"></i>
							草稿
						</small>
					</span>
					<span v-if="item.status === 0">
						<small>
							<i class="fas fa-circle text-warning"></i>
							未上架
						</small>
					</span>
					<span v-if="item.status === 1">
						<small>
							<i class="fas fa-circle text-success"></i>
							已上架
						</small>
					</span>
				</div>
				<div class="col-9 col-md-1">
					<div class="d-flex justify-content-center">
						<router-link class="btn btn-outline-secondary btn-sm" :to="'/manage/store/' + $route.params.storeId + '/product/edit/' + item.id">
							編輯
						</router-link>
					</div>
				</div>
			</div>
		</div>
		<div class="bg-white p-4">
			<pagination :current-page="page.num" :total-page="page.total" @change-page="changePage"></pagination>
		</div>
	</div>
</template>

<script>
import { page, setPageTotal, changePage } from '@/tools/composition'
import Pagination from "@/components/Pagination.vue";

export default {
  setup() {
    return {
      page, setPageTotal, changePage
    }
  },
	components: {
    Pagination
  },
	data() {
    return {
      product: [],
      queryProductObj: {},
    };
  },
  async created() {
  	this.$emit('updateStatus', {
  		title: '商品列表',
  		showBack: false,
  	})
  	this.initQueryProductObj()
    await this.getList()
  },
  methods: {
  	initQueryProductObj() {
      this.queryProductObj = {
        storeId: this.$route.params.storeId,
      	status: 'all',
      	sortBy: 'id',
      	orderBy: 'desc',
        limit: this.page.size,
        offset: this.page.size * (this.page.num - 1),
      }
    },
  	getList() {
			this.axios
        .get("/product", {
          params: this.queryProductObj
        })
        .then(response => {
          this.setPageTotal(response.data.length)
        	// this.page = response.data.page;
          this.product = response.data.data;
        });
    },
    changePage(i) {
    	window.scrollTo(0, 0);
    	this.page.num = i
    	this.$router.push({ query: { page: i }})
    }
  },
  watch: {
    '$route.query': function(to, from) {
    	if (this.$route.path !== '/manage/store/' + this.$route.params.store_id + '/product') {
        // 不在商品頁時，不做任何動作
        return
      }
    	this.initQueryProductObj()
    	this.getList()
    }
  }
}

</script>