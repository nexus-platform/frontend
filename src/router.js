import Vue from 'vue'
import Router from 'vue-router'
import store from './store.js'

Vue.use(Router)

let routes = [{
    path: '*',
    name: 'not-found',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/NotFound')
    }
  },
  {
    path: '/404',
    name: '404',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/NotFound')
    }
  },
  {
    path: '/',
    name: 'home',
    component: function () {
      return import('@/components/Home')
    }
  },
  {
    path: '/about',
    name: 'about',
    component: function () {
      return import('@/views/About.vue')
    }
  },
  {
    path: '/auth/:action',
    name: 'auth',
    meta: {
      requiresAnon: true
    },
    component: function () {
      return import('@/components/PublicAuth')
    }
  },
  {
    path: '/dsa/:dsa_slug/:action/:parameter?/:id?',
    name: 'dsa',
    meta: {
      requiresAuth: false
    },
    component: function () {
      return import('@/components/DSA')
    }
  },
  {
    path: '/my-profile',
    name: 'my-profile',
    meta: {
      requiresAuth: true,
      roles: ['do']
    },
    component: function () {
      return import('@/components/MyProfile')
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'na', 'student']
    },
    component: function () {
      return import('@/components/Dashboard')
    }
  },
  {
    path: '/assessment-centre/calendar',
    name: 'ac-calendar',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'na', 'student']
    },
    component: function () {
      return import('@/components/ACCalendar')
    }
  },
  {
    path: '/assessment-centre/submitted-forms',
    name: 'submitted-forms',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'student']
    },
    component: function () {
      return import('@/components/ACSubmittedForms')
    }
  },
  {
    path: '/assessment-centre/students',
    name: 'ac-students',
    meta: {
      requiresAuth: true,
      roles: ['ac']
    },
    component: function () {
      return import('@/components/ACStudents')
    }
  },
  {
    path: '/assessment-centre/settings',
    name: 'ac-settings',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'na']
    },
    component: function () {
      return import('@/components/ACSettings')
    }
  },
  {
    path: '/assessment-centre/needs-assessors',
    name: 'ac-needs-assessors',
    meta: {
      requiresAuth: true,
      roles: ['ac']
    },
    component: function () {
      return import('@/components/ACAssessors')
    }
  },
  {
    path: '/assessment-centre/services',
    name: 'ac-services',
    meta: {
      requiresAuth: true,
      roles: ['ac']
    },
    component: function () {
      return import('@/components/ACServices')
    }
  },
  {
    path: '/assessment-centre/submitted-forms/:token',
    name: 'submitted-form',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'student']
    },
    component: function () {
      return import('@/components/ACSubmittedForm')
    }
  },
  {
    path: '/assessment-centre/student/:token',
    name: 'student-page',
    meta: {
      requiresAuth: true,
      roles: ['na']
    },
    component: function () {
      return import('@/components/ACStudentPage')
    }
  },
  {
    path: '/assessment-centre/:slug/:action/:token?',
    name: 'ac',
    meta: {
      requiresAuth: false,
      roles: ['na', 'student']
    },
    component: function () {
      return import('@/components/AC')
    }
  }
]

let router = new Router({
  //mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
})

router.beforeEach((to, from, next) => {
  //let payload = store._modules.root._rawModule.state.payload;
  if (to.meta.requiresAuth) {
    if (store.getters.isGuest) {
      store.commit('setAuthRouteRequested', to.path)
      next('/')
    } else if (to.meta.hasOwnProperty('roles')) {
      let found = false
      for (let i in to.meta.roles) {
        if (store.getters.getRoles.includes(to.meta.roles[i])) {
          found = true
          break
        }
      }
      if (found) {
        next()
      } else {
        next('/not-allowed')
      }
    } else {
      next()
    }
  } else if (to.meta.requiresAnon) {
    if (!store.getters.isGuest) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router