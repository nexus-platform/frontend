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
    name: 'root',
    component: function () {
      return import('@/components/PublicAuth')
    }
  },
  {
    path: '/home',
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
      return import('@/components/dsa/DSA')
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
      requiresAuth: true
    },
    component: function () {
      return import('@/components/Dashboard')
    }
  },
  {
    path: '/activate-account/:token',
    name: 'activate-account',
    meta: {
      requiresAnon: true
    },
    component: function () {
      return import('@/components/ActivateAccount')
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
      return import('@/components/ac/ACCalendar')
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
      return import('@/components/ac/ACSubmittedForms')
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
      return import('@/components/ac/ACStudents')
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
      return import('@/components/ac/ACSettings')
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
      return import('@/components/ac/ACAssessors')
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
      return import('@/components/ac/ACServices')
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
      return import('@/components/ac/ACSubmittedForm')
    }
  },
  {
    path: '/assessment-centre/student/:token/:tab?',
    name: 'student-page',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'na', 'student']
    },
    component: function () {
      return import('@/components/ac/ACStudentPage')
    }
  },
  {
    path: '/assessment-centre/application',
    name: 'ac-application',
    meta: {
      requiresAuth: true,
      roles: ['ac']
    },
    component: function () {
      return import('@/components/ac/application/Application')
    }
  },
  {
    path: '/assessment-centre/files',
    name: 'ac-files',
    meta: {
      requiresAuth: true,
      roles: ['student']
    },
    component: function () {
      return import('@/components/AttachedFiles')
    },
    props: { targetType: 'ac' }
  },
  {
    path: '/invoicing',
    name: 'invoicing',
    meta: {
      requiresAuth: true,
      roles: ['ac', 'nmh']
    },
    component: function () {
      return import('@/components/Invoicing')
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
      return import('@/components/ac/AC')
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