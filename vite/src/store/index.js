import { createStore } from 'vuex'

export default createStore({
  state: {
    alert: {
      show: false,
      disappear_seconds: 0,
      type: "",
      text: ""
    },
  },
  getters: {
  },
  mutations: {
    set_alert(state, val) {
      state.alert = val;
    },
  },
  actions: {
    show_alert(context, payload) {
      if (context.state.alert.show) {
        context.commit("set_alert", {
          show: false,
        })
        setTimeout(() => {
          context.commit("set_alert", {
            show: true,
            disappear_seconds: 5,
            type: payload.type,
            text: payload.text
          });
        }, 100)
      } else {
        context.commit("set_alert", {
          show: true,
          disappear_seconds: 5,
          type: payload.type,
          text: payload.text
        });
      }
    },
  },
  modules: {
  }
})
