<template>
  <div class="container bg-white pt-3">
    <div class="row py-3">
      <div class="col-2 col-sm-2 col-md-1 offset-md-1">
        <img
          :src="user.avatar_url"
          class="rounded-circle avatar-image mr-2"
          width="60"
        />
      </div>
      <div class="col-10 col-sm-10 col-md-7 d-flex align-items-center">
        <h4 class="pl-2 pl-md-0 mb-0" style="word-wrap: break-word;">
          {{ user.nickname }}
        </h4>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-10 offset-md-1">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <router-link
              :class="['nav-link', { active: is_active('index') }]"
              :to="base_url"
            >
              個人資料
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { active: is_active('order') }]"
              :to="base_url + '/order'"
            >
              我的訂單
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { active: is_active('like') }]"
              :to="base_url + '/like'"
            >
              我喜歡的
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { active: is_active('history') }]"
              :to="base_url + '/history'"
            >
              瀏覽紀錄
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :class="['nav-link', { active: is_active('manage') }]"
              :to="base_url + '/store/manage'"
            >
              商店管理
            </router-link>
          </li>
          <li class="nav-item cursor-pointer">
            <b-link class="nav-link" @click="logout">登出</b-link>
          </li>
        </ul>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
  </div>
</template>

<script>
import noImageSm from '@/assets/no-image-sm.webp'

export default {
  name: "userHead",
  data() {
    return {
      base_url: ''
    }
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  mounted() {
    if (this.$store.state.user) {
      // this.user = this.$store.state.user
      this.base_url = '/user/' + this.user.account
    }
  },
	methods: {
		logout() {
      this.axios
        .post("/user/logout")
        .then(response => {
          this.$store.dispatch('show_alert', {
            type: 'success',
            text: response.data.msg
          })
          this.$store.commit("set_user", false);
          this.$router.push("/");
        })
		},
    is_active(resource) {
      if (this.$route.fullPath.indexOf(resource) > 0) {
        return true;
      } else if (
        resource === "index" &&
        this.$route.fullPath === this.base_url
      ) {
        return true;
      }
      else return false;
    },
	}
}
</script>