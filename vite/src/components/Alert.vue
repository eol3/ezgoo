<template>
	<div v-show="$store.state.alert.show" :class="['alert', 'alert-' + type, 'alert-dismissible', 'fade', 'show', 'fixed-top']" role="alert" style="z-index: 1100;">
		<i v-if="type === 'success'" class="fa-solid fa-circle-check"></i>
		<i v-if="type === 'warning'" class="fa-solid fa-circle-exclamation"></i>
		<i v-if="type === 'danger'" class="fa-solid fa-circle-xmark"></i>
		{{ $store.state.alert.text }}
		<i class="fa-solid fa-xmark icon-close" @click="close()"></i>
	</div>
</template>

<script>

export default {
	computed: {
		type() {
			return this.$store.state.alert.type
		},
    alert_type() {
      return 'alert-' + this.$store.state.alert.type
    }
	},
	data() {
		return {
			timeoutID: {}
		}
	},
	mounted() {
		this.handleAlertDisappear(this.$store.state.alert.show)
	},
	methods: {
		close() {
			this.$store.commit("setAlert", {
        show: false,
      })
		},
		handleAlertDisappear(show) {
			if (show) {
        if (this.$store.state.alert.disappear_seconds > 0) {
          this.timeoutID = setTimeout(() => {
            this.$store.state.alert.show = false
          }, this.$store.state.alert.disappear_seconds * 1000);
        }
      } else {
      	clearTimeout(this.timeoutID)
      }
		}
	},
	watch: {
    '$store.state.alert.show': function(to) {
      this.handleAlertDisappear(to)
    }
	}
}
</script>
