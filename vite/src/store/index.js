import { createStore } from 'vuex'
import { axios } from "@/tools/request";

export default createStore({
  state: {
    localUser: null, // null 未曾登入, 有資料表示曾經有登入
    user: null, //null 未取得, false 未登入, 有資料表示有登入
    handleForbidden: false,
    updateData: false, // 有快取時，用這個值來更新資料，更新完需設回false
    alert: {
      show: false,
      disappear_seconds: 0,
      type: "",
      text: ""
    },
    modal: {
      title: "提示",
      show: false,
      loading: false,
      type: "primary",
      text: "",
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      confirmCallback: () =>{},
      cancelCallback: () =>{}
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
    setModal(state, val) {
      state.modal = {
        title: val.title ? val.title : "提示",
        show: val.show ? val.show : false,
        loading: val.loading ? val.loading : false,
        type: val.type ? val.type : "primary",
        text: val.text ? val.text : "",
        confirmButtonText: val.confirmButtonText ? val.confirmButtonText : '確認',
        cancelButtonText: val.cancelButtonText ? val.cancelButtonText : '取消',
        confirmCallback: val.confirmCallback ? val.confirmCallback : () =>{},
        cancelCallback: val.cancelCallback ? val.cancelCallback : () =>{}
      };
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
