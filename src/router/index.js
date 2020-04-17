import Vue from 'vue'
import VueRouter from 'vue-router'
import LevelUI from '../components/LevelUI/LevelUI.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LevelUI',
    component: LevelUI
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router