import { BRAND } from '@/lib/constants';

export const paths = {
  home: {
    url: '/',
    text: BRAND.title,
  },
  workspaces: {
    url: '/workspaces',
    text: 'Workspaces',
  },
  about: {
    url: '#about',
    text: 'About',
  },
  guide: {
    url: '#how-it-works',
    text: 'Guide',
  },
  auth: {
    login: {
      url: '/auth/login',
      text: 'Login',
    },
    signup: {
      url: '/auth/sign-up',
      text: 'Sign Up',
    },
    error: {
      url: '/auth/error',
      text: 'Error page',
    },
    forgotPassword: {
      url: '/auth/forgot-password',
      text: 'Forgot Password',
    },
    signUpSuccess: {
      url: '/auth/sign-up-success',
      text: 'Sign Up Success',
    },
    updatePassword: {
      url: '/auth/update-password',
      text: 'Update Password',
    },
  },
} as const;
