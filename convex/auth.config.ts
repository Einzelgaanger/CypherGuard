export default {
  providers: [
    {
      domain: process.env.AUTH_URL,
      applicationID: process.env.AUTH_PASSWORD_ID,
    },
  ],
}; 