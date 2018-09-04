import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Login';
import Signup from '@/components/Signup';
import RequestPasswordReset from '@/components/RequestPasswordReset';
import Contact from '@/components/Contact';
import NotFound from '@/components/NotFound';
import MyProfile from '@/components/MyProfile';
import DSAForms from '@/components/DSAForms';
import DSAForm from '@/components/DSAForm';
import MyDSAForms from '@/components/MyDSAForms';
import ActivateAccount from '@/components/ActivateAccount';
import ResetPassword from '@/components/ResetPassword';
import TestComponent from '@/components/TestComponent';
import SignFromMobile from '@/components/SignFromMobile';
import DOSubmittedForms from '@/components/DOSubmittedForms';
import MyInstitute from '@/components/MyInstitute';
import QRCodeScanner from '@/components/QRCodeScanner';
import NotAllowed from '@/components/NotAllowed';
import AssessmentCentres from '@/components/AssessmentCentres';
import AssessmentCentre from '@/components/AssessmentCentre';
import AcceptInvitation from '@/components/AcceptInvitation';
import store from '../store';

Vue.use(Router);

const routes = [{
    path: '*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/',
    name: 'Index',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/signup/:university_token?',
    name: 'Signup',
    component: Signup,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/request-password-reset',
    name: 'RequestPasswordReset',
    component: RequestPasswordReset,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/my-profile',
    name: 'MyProfile',
    component: MyProfile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/dsa-forms',
    name: 'DSAForms',
    component: DSAForms,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/dsa-form/:univ/:form/:entity?',
    name: 'DSAForm',
    component: DSAForm,
    meta: {
      requiresAuth: true,
      roles: ['do', 'student']
    }
  },
  {
    path: '/activate-account/:token',
    name: 'ActivateAccount',
    component: ActivateAccount,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/test',
    name: 'Test',
    component: TestComponent
  },
  {
    path: '/my-dsa-forms',
    name: 'MyDSAForms',
    component: MyDSAForms,
    meta: {
      requiresAuth: true,
      roles: ['student']
    }
  },
  {
    path: '/do-submitted-forms',
    name: 'DOSubmittedForms',
    component: DOSubmittedForms,
    meta: {
      requiresAuth: true,
      roles: ['do']
    }
  },
  {
    path: '/sign-from-mobile/:random_code',
    name: 'SignFromMobile',
    component: SignFromMobile,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/my-institute',
    name: 'MyInstitute',
    component: MyInstitute,
    meta: {
      requiresAuth: true,
      roles: ['do']
    }
  },
  {
    path: '/qrscan',
    name: 'QRCodeScanner',
    component: QRCodeScanner,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/not-allowed',
    name: 'NotAllowed',
    component: NotAllowed,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/assessment-centres',
    name: 'AssessmentCentres',
    component: AssessmentCentres,
    meta: {
      requiresAuth: true,
      roles: ['student']
    }
  },
  {
    path: '/assessment-centre/:slug/:action/:role',
    name: 'AssessmentCentre',
    component: AssessmentCentre
  },
  {
    path: '/accept-invitation/:token',
    name: 'AcceptInvitation',
    component: AcceptInvitation
  }
];

var router = new Router({
  routes
});

router.beforeEach((to, from, next) => {
  var payload = store._modules.root._rawModule.state.payload;
  if (to.meta.requiresAuth) {
    if (payload.is_guest) {
      store._modules.root._rawModule.state.authRouteRequested = to.path;
      next('/login');
    } else if (to.meta.hasOwnProperty('roles')) {
      var found = false;
      for (var i in to.meta.roles) {
        if (payload.roles.includes(to.meta.roles[i])) {
          found = true;
          break;
        }
      }
      if (found) {
        next();
      } else {
        next('/not-allowed');
      }
    } else {
      next();
    }
  } else if (to.meta.requiresAnon) {
    if (!payload.is_guest) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
