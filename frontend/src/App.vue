<template>
  <router-view/>
</template>

<script>
export default {
	created() {
		// if (localStorage.getItem('user')) {
		//   try {
  //       let user_data = JSON.parse(localStorage.getItem('user'))
  //       this.$store.commit("set_user", user_data);
		//   } catch(e) {
		//     console.log(e)
		//   }
      // 為加快載入速度，有本地使用者資料先使用，之後再同步
      // 不一定要做，若使用者資料失效，之後存取相關api，也會禁用並跳轉
    	// this.$store.dispatch("get_user")
    // }
	}
}
</script>
