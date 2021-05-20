import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Bingo from '../views/Bingo.vue'

import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/bingos/:id',
    name: 'Bingo',
    component: Bingo
  },
  {
    path: '/tpcs',
    name: 'Topics',
    component: () => import(/* webpackChunkName: "topics" */ '../views/Topics.vue')
  },
  {
    path: '/wrds',
    name: 'Words',
    component: () => import(/* webpackChunkName: "words" */ '../views/Words.vue')
  },
  {
    path: '/opts',
    name: 'Options',
    component: () => import(/* webpackChunkName: "options" */ '../views/Options.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  const adminRoutes = ['Topics', 'Words', 'Options']
  try {
    await store.dispatch('auth/authenticate')
  } catch (error) {
    console.log('anon user')
  }

  if (adminRoutes.includes(to.name)) {
    if (!store.state?.auth?.user) {
      return next(false)
    }
    const userPermissions = store.state.auth.user.rights.map(x => x.name)
    if (userPermissions.includes('isAdmin')) {
      return next()
    } else {
      return next(false)
    }
  }

  next()
})

export default router
