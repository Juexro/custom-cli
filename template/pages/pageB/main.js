import '@babel/polyfill'
import Vue from 'vue'
import App from './app'

const isProduction = process.env.NODE_ENV !== 'production'
Vue.config.debug = isProduction
Vue.config.devtools = isProduction
Vue.config.productionTip = isProduction

/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(App)
})
