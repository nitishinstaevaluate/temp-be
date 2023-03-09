// const { auth } = require('express-openid-connect');
const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const express = require("express");
const path = require("path");
// export const authconfig = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: 'd_bmUKm4pEJRA0N1pJWkkCz_tB42ni0LtcxKw66qdhdZOCcdP-w_imMTMAnNnsAE',
//   baseURL: 'http://localhost:3000',
//   clientID: 'LN9C4sqcScV6jhVFPSv3SFsXBWTWNOEn',
//   issuerBaseURL: 'https://dev-m5j25rojmoxblkh0.us.auth0.com'
// };

// // auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));

// // req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });



const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
  };
  
//   if (app.get("env") === "production") {
//     // Serve secure cookies, requires HTTPS
//     session.cookie.secure = true;
//   }