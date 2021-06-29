import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: { name: 'application_list', params: {direction: 'submitted'} }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/applications/:direction',
    name: 'application_list',
    component: () => import('../views/ApplicationList.vue')
  },
  {
    path: '/applications/new',
    alias: '/new_application',
    name: 'new_application',
    component: () => import('../views/NewApplication.vue')
  },
  {
    path: '/applications/:application_id',
    name: 'application',
    component: () => import('../views/Application.vue')
  },
  {
    path: '/*',
    name: 'not_found',
    component: () => import('../views/NotFound.vue')
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
