<template>
	<div class="row pt-3">
    <div class="col-12">
      <h6 class="mb-3">最新消息</h6>
      <div class="col-md-10 offset-md-1">
        <post-list :post="post"></post-list>
      </div>
      <div class="row" v-show="post.length !== 0">
        <div class="col-12 mt-3 text-center">
          <router-link :to="'/store/' + $route.params.store_id + '/post'" class="text-decoration-none">
            查看更多
          </router-link>
        </div>
      </div>
      <hr />
    </div>
  </div>
  <div class="row">
    <div class="col-12">
      <h6 class="mb-3">最新上架</h6>
      <div class="row">
        <div class="col-md-10 offset-md-1">
          <product-list :product="product"></product-list>
        </div>
      </div>
      <div class="row" v-show="product.length !== 0">
        <div class="col-12 mt-3 text-center">
          <router-link :to="'/store/' + $route.params.store_id + '/product'" class="text-decoration-none">
            查看更多
          </router-link>
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script>
import PostList from "@/components/PostList.vue";
import ProductList from "@/components/ProductList.vue";
import no_image_sm from '@/assets/no-image-sm.webp';

export default {
  name: "product",
	components: {
    PostList,
    ProductList
  },
	data() {
		return {
			post: [],
			product: []
		}
	},
	created() {
    this.init_post();
    this.init_product()
    this.getList()
	},
	methods: {
    init_post() {
      for(let i = 0; i < 4; i++) {
        this.post[i] = {
          image_url: no_image_sm,
          content: ''
        }
      }
    },
    init_product() {
      for (let i = 0;i < 4; i++) {
        this.product[i] = {
          name: "",
          price: null,
          spec: null,
          spec_price: 0,
          thumbnail: no_image_sm
        }
      }
    },
		getList() {
		  let obj = {
        page_size: 8,
        page_num: 1
      };
			this.axios
				.get("/store/" + this.$route.params.store_id + "/post", {
					params: obj
				})
				.then(response => {
					this.post = response.data.data
				});
			this.axios
        .get("/store/" + this.$route.params.store_id + "/product", {
          params: obj
        })
        .then(response => {
          this.product = response.data.data;
        });
		}
	}
}
</script>