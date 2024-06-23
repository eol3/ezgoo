<template>
	<div class="container my-3">
		<div class="row">
			<div class="col-md-6 mx-auto">
				<div class="mb-3">
					<span class="h3">建立商店</span>
				</div>
				<div class="mb-1">
					<label class="col-form-label">商店名稱</label>
					<input type="text" class="form-control" v-model="formData.name" @focus="formValidClear()">
			    <div class="form-text text-danger">
			    	{{ formValidFeild('name') ? formValid.errors.name[0] : '&nbsp;' }}
			    </div>
			  </div>
			  <button class="btn btn-primary" @click="create()">建立商店</button>
			</div>
		</div>
	</div>
</template>

<script>
import formValidTools from '@/tools/composition/formValid'
import wrapValidator from '@/tools/validator'

export default {
	setup() {
    const { formValid, formValidFeild, formValidClear } = formValidTools();
    
    return {
      formValid,
      formValidFeild,
      formValidClear
    }
  },
  data() {
    return {
    	loading: false,
    	formData: {
    		name: ''
    	}
    }
  },
  created() {
  },
  methods: {
  	create() {
  		if (this.loading) return
  		const validator = wrapValidator(this.formData, {
		    name: 'required|string|max:64',
		  }, 'store');
		  if (validator.fail) {
		  	this.formValid = {
          fails: true,
          ...validator.errors
        }
        return
		  }
		  this.loading = true
		  this.axios.post('/store', this.formData).then(response => {
		  	this.loading = false
      	this.formValid = {
          fails: false
        }
        this.$store.dispatch('showAlert', {
					type: 'success',
        	text: response.data.msg
				})
				this.$router.push('/store/' + response.data.store.id)
		  }).catch(error => {
      	this.loading = false
      	if (error.response.status === 400) {
	        this.formValid = {
	          fails: true,
	          errors: error.response.data.errors
	        }
      	}
      });
  	}
  }
}
</script>