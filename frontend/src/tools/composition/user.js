

export async function checkIsLoging(loading, axios, store, router) {
  if (store.state.localUser) {
    loading.value = true
    axios.get('/user', { selfErrorHandle: true }).then(() => {
      store.dispatch("showAlert", {
        type: "success",
        text: "已經登入"
      })
      router.push('/')
    }).catch((error) => {
      if (error.response && error.response.status === 403) {
        store.dispatch('userLogout')
        loading.value = false
      }
    })
  }
}