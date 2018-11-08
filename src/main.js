import Vue from 'vue'
import './plugins/vuetify'
import SvgIcon from 'vue-svgicon'
import App from './App.vue'


Vue.config.productionTip = false

Vue.use(SvgIcon, {
  tagName: 'svgicon'
})

new Vue({
  render: h => h(App),
}).$mount('#app')
