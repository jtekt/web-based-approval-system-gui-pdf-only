import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

Vue.config.productionTip = false


const get_received_pending_application_count = () =>{
  const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications`
  const params = {
    relationship: 'SUBMITTED_TO',
     state: 'pending',
     type: 'PDF',
   }
  Vue.axios.get(url, {params})
  .then( ({data}) => { store.commit('set_received_pending_application_count', data.count) })
  .catch(error => {
    console.error(error)
    setTimeout(get_received_pending_application_count,3000)
  })
}

router.afterEach( () => {
  get_received_pending_application_count()
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
