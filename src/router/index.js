import { createRouter, createWebHistory } from 'vue-router'
import MoveResize from '../views/MoveResizeTest.vue'
import TableView from '../views/TableView.vue'

const routes = [
  {
    path: '/move-resize',
    name: 'move-resize',
    component: MoveResize
  },
  {
    path: '/table',
    name: 'table',
    component: TableView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router