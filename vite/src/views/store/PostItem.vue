<template>
  <div class="container">
    <div class="row">
      <div class="col-12 col-md-8 offset-md-2 bg-white">
        <div class="row" v-if="post_image.length > 0">
          <div
            class=""
            style="overflow-x: auto; white-space: nowrap;"
          >
            <div
              v-for="(item, key) in post_image"
              :key="key"
              style="margin: 8px;display: inline-block;float: none;"
            >
              <img style="max-width:260px;" :src="item.url" />
            </div>
          </div>
        </div>
        <br v-else />
        <div class="row py-3 ps-3">
          <p>
            {{ post.content }}
          </p>
          <button class="btn btn-outline-secondary mx-3 w-25" @click="$router.go(-1)">
            <i class="fas fa-arrow-circle-left"></i>
            返回
          </button>
        </div>
        <br /><br />
      </div>
    </div>
    <br /><br />
  </div>
</template>

<script>
export default {
  name: "PostItem",
  data() {
    return {
      post: { content: '' },
      post_image: [],
      number: 1
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  created() {
    this.getPost();
  },
  methods: {
    getPost() {
      window.scrollTo(0, 0); //在iphone safari上，卷軸會提在下方，用這拉到上面
      if (this.$route.params.post_content) {
        this.post.content = this.$route.params.post_content
      }
      if (this.$route.params.post_thumbnail) {
        this.post_image = [{ url: this.$route.params.post_thumbnail }]
      }
      this.axios
        .get("/store/ignore/post/" + this.$route.params.post_id)
        .then(async response => {
          this.post = response.data;
          this.post_image = response.data.images;
        });
    },
    // set_meta() {
    //   this.$store.state.brand = {
    //     avatar: this.$store.state.store.avatar.url,
    //     name: this.$store.state.store.name,
    //     url: "/store/" + this.$store.state.store.account,
    //     show_prev: true
    //   };
    //   this.$store.state.meta.title =
    //     this.post.content + " - " + this.$store.state.store.name;
    //   this.$store.state.meta.describe = "";
    // }
  },
  // watch: {
  //   "$route.params.post_id": function() {
  //     if (this.$route.params.post_id !== undefined) {
  //       this.getPost();
  //     }
  //   }
  // }
};
</script>
