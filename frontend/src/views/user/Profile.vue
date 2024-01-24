<template>
	<div class="row mt-3">
		<div class="col-10 col-md-5 offset-md-1">
			<div class="form-group">
		    <label class="form-label">姓名</label>
		    <input type="text" class="form-control" v-model="$store.state.user.name" placeholder="請輸入姓名">
		  </div>
			<div class="form-group mt-2">
		    <label class="form-label">E-mail</label>
		    <input type="email" class="form-control" v-model="$store.state.user.email" placeholder="請輸入E-mail">
		  </div>
		  <div class="form-group mt-2">
		    <label class="form-label">密碼</label>
		    <input type="password" class="form-control" placeholder="請輸入密碼">
		  </div>
	  </div>
	</div>
	<div class="row mt-3">
		<div class="col-10 col-md-5 offset-md-1 text-center">
			<button class="btn btn-outline-success">儲存</button>
		</div>
	</div>
	<br />
</template>