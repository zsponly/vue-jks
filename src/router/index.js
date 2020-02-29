import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import FloatCar from '@/components/FloatCar'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', name: 'Home', component: Home},
    { path: '/float', name: 'FloatCar', component: FloatCar},
  ],
  mode: 'history'
})
