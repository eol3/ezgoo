<template>
	<div class="container my-3">
		<div class="row">
			<div class="col-md-6 mx-auto">
				<div class="mb-3">
					<span class="h3">登入</span>
					<span class="h5">
						&nbsp;&nbsp;/&nbsp;&nbsp;
						<router-link to="/register" class="link-underline-light">註冊</router-link>
					</span>
				</div>
				<div class="mb-3 row">
			    <label for="staticEmail" class="col-sm-2 col-form-label">Email</label>
			    <div class="col-sm-10">
			      <input type="text" class="form-control" id="staticEmail" value="email@example.com">
			    </div>
			  </div>
			  <div class="mb-3 row">
			    <label for="inputPassword" class="col-sm-2 col-form-label">Password</label>
			    <div class="col-sm-10">
			      <input type="password" class="form-control" id="inputPassword">
			    </div>
			  </div>
			  <button class="btn btn-primary">登入</button>
		  </div>
		</div>
	</div>
</template>
