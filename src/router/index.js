import { createRouter, createWebHistory } from 'vue-router'
import routePaths from '../data/routePaths.js'

const routes = [...routePaths]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router