<template>
	<div v-show="$store.state.alert.show" :class="['alert', alert_type, 'alert-dismissible', 'fade', 'show', 'fixed-top', 'custom-alert']" role="alert" style="z-index: 1100;">
		<i v-if="type === 'success'" class="fa-solid fa-circle-check"></i>
		<i v-if="type === 'danger' || type === 'warning'" class="fa-solid fa-circle-exclamation"></i>
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
			this.$store.commit("set_alert", {
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

<style lang="scss">
@import '@/assets/main.scss';
.alert {
	width: 40%;
	margin: 30px auto;
	color: $primary;
  background-color: #fff;
  border: 1px solid $primary;
}
@media (max-width: 768px) {
	.alert {
		width: 80%;
	}
}
.alert .icon-close {
	color: #e11477;
	font-size: 18px;
	position: absolute;
  top: 0;
  right: 0;
  padding: 1.25rem 1rem;
  opacity: .75;
  cursor: pointer;
}
.alert .icon-close:hover {
	opacity: 1;
}
</style>