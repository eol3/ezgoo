<template>
  <div class="col-md-10 offset-md-1 pt-3">
    <post-list :post="post"></post-list>
  </div>
</template>

<script>
import PostList from "@/components/PostList.vue";
import no_image_sm from '@/assets/no-image-sm.webp';

export default {
  name: "post",
  components: {
    PostList,
  },
  data() {
    return {
      post: []
    };
  },
  created() {
    console.log('post created')
    this.init_post()
    this.getList()
  },
  methods: {
    init_post() {
      for(let i = 0; i < 4; i++) {
        this.post[i] = {
          thumbnail: no_image_sm,
          content: ''
        }
      }
    },
    getList() {
			this.axios
				.get("/store/" + this.$route.params.store_id + "/post", {
					params: {
						page_size: 8,
            page_num: 1
					}
				})
				.then(response => {
					this.post = response.data.data
				});
    }
  },
};
</script>

<style scoped>
.card:hover {
  cursor: pointer;
}
</style>
