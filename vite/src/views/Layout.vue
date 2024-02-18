<template>
	<nav class="navbar navbar-expand navbar-border-bottom px-3">
		<router-link class="navbar-brand pb-1" to="/">
      <img width="100" src="@/assets/logo.png" alt="EzGOO"/>
    </router-link>
    <ul class="navbar-nav ms-auto">
    	<li class="nav-item">
    		<router-link class="nav-link me-0" to="/cart">
    			<i class="fas fa-shopping-cart"></i>
  			</router-link>
  		</li>
  		<li class="nav-item">
    		<router-link class="nav-link" :to="$store.state.localUser ? '/user' : '/login'">
    			<i class="fas fa-user"></i>
  			</router-link>
  		</li>
  	</ul>
	</nav>
  <router-view/>
  <div class="footer">
    <div class="text-center p-3 bg-2">
      © 2021 EzGOO
    </div>
  </div>
</template>


<script>
export default {
  components: {
  },
	created() {
	}
}
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>