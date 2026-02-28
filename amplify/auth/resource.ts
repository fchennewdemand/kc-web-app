import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID || '',
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
      },
      callbackUrls: [
        'http://localhost:3000/login',
        'https://your-domain.com/login'
      ],
      logoutUrls: [
        'http://localhost:3000',
        'https://your-domain.com'
      ]
    }
  }
});
