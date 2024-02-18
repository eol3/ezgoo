import { createStore } from 'vuex'
import { axios } from "@/tools/request";

export default createStore({
  state: {
    localUser: null, // null 未曾登入, 有資料表示曾經有登入
    user: null, //null 未取得, false 未登入, 有資料表示有登入
    alert: {
      show: false,
      disappear_seconds: 0,
      type: "",
      text: ""
    },
    showSlider: {
      left: false,
      right: false,
      overlay: false,
    },
    theme: 'light', // light, dark
  },
  getters: {
  },
  mutations: {
    setLocalUser(state, value) {
      state.localUser = value
    },
    setUser(state, value) {
      state.user = value;
    },
    setAlert(state, val) {
      state.alert = val;
    },
    setShowSlider(state, val) {
      state.showSlider = val;
    },
    setTheme(state, val) {
      state.theme = val;
    }
  },
  actions: {
    getLocalUser(context) {
      if (localStorage.getItem('user')) {
      	try {
      		let user = JSON.parse(localStorage.getItem('user'))
      		if (user.id) { // 檢查格式
      			context.commit('setLocalUser', user)
      		}
      	} catch(e) {
      		console.log(e)
      	}
      }
    },
    async getUser(context) {
      let response = await axios.get('/user/')
      context.commit('setUser', response.data)
    },
    userLogout(context) {
      context.commit('setLocalUser', null)
      context.commit('setUser', false)
      localStorage.removeItem('user')
    },
    showAlert(context, payload) {
      if (context.state.alert.show) {
        context.commit("setAlert", {
          show: false,
        })
        setTimeout(() => {
          context.commit("setAlert", {
            show: true,
            disappear_seconds: 5,
            type: payload.type,
            text: payload.text
          });
        }, 100)
      } else {
        context.commit("setAlert", {
          show: true,
          disappear_seconds: 5,
          type: payload.type,
          text: payload.text
        });
      }
    },
    switchTheme(context) {
      if (context.state.theme === 'light') {
        context.commit("setTheme", "dark")
      } else if (context.state.theme === 'dark') {
        context.commit("setTheme", "light")
      }
      document.documentElement.dataset.bsTheme = context.state.theme
    }
  },
  modules: {
  }
})
