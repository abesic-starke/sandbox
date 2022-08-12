import { createRouter, createWebHistory } from 'vue-router'
import MoveResize from '../views/MoveResize.vue'

const routes = [
  {
    path: '/move-resize',
    name: 'move-resize',
    component: MoveResize
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
