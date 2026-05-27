import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('./views/Dashboard.vue') },
    { path: '/review', name: 'review', component: () => import('./views/BedtimeReview.vue') },
    { path: '/notepads', name: 'notepads', component: () => import('./views/Notepads.vue') },
    { path: '/word/:spelling', name: 'word', component: () => import('./views/WordDetail.vue') },
    { path: '/stats', name: 'stats', component: () => import('./views/Stats.vue') },
  ],
})

export default router
