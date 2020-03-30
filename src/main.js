// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../static/font/weathericons-regular-webfont.eot'
import '../static/css/weather-icons.css'
import App from './App'
import router from './router'
import echarts from 'echarts'
import axios from 'axios'
import papa from '../static/js/papaparse.min.js'
import saver from '../static/js/FileSaver.min.js'

Vue.config.productionTip = false;

Vue.prototype.$echarts = echarts;
Vue.prototype.$axios = axios;
Vue.prototype.$papa = papa;
Vue.prototype.$saver = saver;

Vue.use(ElementUI);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  components: { App }
})
