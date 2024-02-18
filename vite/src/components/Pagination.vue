<template>
	<nav v-if="totalPage > 1" aria-label="Page navigation">
	  <ul class="pagination mb-4">
	    <li class="page-item">
	      <button class="page-link" @click="firstPage()">
	        <span aria-hidden="true">&laquo;</span>
	      </button>
	    </li>
	    <li :class="['page-item', {disabled: disableFirstPage()}]">
	      <button class="page-link" @click="prevPage()" :disabled="currentPage === 1">
	        <span aria-hidden="true">&#60;</span>
	      </button>
	    </li>
	    <li v-for="(item, key) in pages" :class="['page-item', {active: isCurrentPage(item)}]">
	    	<button class="page-link" @click="changePage(item)">{{ item }}</button>
	    </li>
	    <li :class="['page-item', {disabled: disableLastPage()}]">
	      <button class="page-link" @click="nextPage()" :disabled="currentPage === totalPage">
	        <span aria-hidden="true">&#62;</span>
	      </button>
	    </li>
	    <li class="page-item">
	      <button class="page-link" @click="finalPage()">
	        <span aria-hidden="true">&raquo;</span>
	      </button>
	    </li>
	  </ul>
	</nav>
</template>

<script>

export default {
	props: {
    currentPage: {
      type: Number,
      default: 1
    },
    totalPage: {
      type: Number,
      default: 5
    },
    showPageNum: {
    	type: Number,
      default: 2
    }
  },
  emits: ["change-page"],
  data() {
  	return {
	  	beforeHide: false,
	  	afterHide: false,
  	}
  },
  computed: {
  	pages() {
  		this.beforeHide = false
  		this.afterHide = false
  		let start = this.currentPage - this.showPageNum
			let end = this.currentPage + this.showPageNum

  		if (start <= 1) {
				end += -1 * start + 1
				start = 1
			} else this.beforeHide = true
  		// console.log(end)
			// console.log(end - this.totalPage + 1)
  		if (end >= this.totalPage) {
				start -= end - this.totalPage
				end = this.totalPage
			} else this.afterHide = true

			if (start <= 1)  start = 1

  		let result = []
  		for (let i=start; i<=end; i++) {
	  		result.push(i)
	  	}
	  	return result
  	}
  },
  created() {
  },
  methods: {
  	changePage(i) {
  		this.$emit('change-page', i)
  	},
  	isCurrentPage(i) {
  		return (this.currentPage === i) ? true : false
  	},
  	disableFirstPage() {
  		return (this.currentPage === 1) ? true : false
  	},
  	disableLastPage() {
  		return (this.currentPage === this.totalPage) ? true : false
  	},
  	firstPage() {
  		this.$emit('change-page', 1)
  	},
  	nextPage() {
  		let next = this.currentPage + 1
  		this.$emit('change-page', next)
  	},
  	prevPage() {
  		let prev = this.currentPage - 1
  		this.$emit('change-page', prev)
  	},
  	finalPage() {
  		this.$emit('change-page', this.totalPage)
  	}
  }
}

</script>