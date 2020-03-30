import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import FloatCar from '@/components/FloatCar'
import History from '@/components/History'
import Daily from '@/components/Daily'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', name: 'Home', component: Home},
    { path: '/float', name: 'FloatCar', component: FloatCar},
    { path: '/history', name: 'History', component: History},
    { path: '/daily', name: 'Daily', component: Daily}
  ],
  mode: 'history'
})
