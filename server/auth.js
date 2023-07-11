"use strict";

const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const userDao = require("./user-dao");

/**
 * Helper function to initialize passport authentication with the LocalStrategy
 *
 * @param app express app
 */
function initAuthentication(app) {
  // setup passport
  passport.use(
    new LocalStrategy((email, password, done) => {
      userDao
        .authUser(email.toLowerCase(), password)
        .then((user) => {
          if (user) done(null, user);
          else
            done(null, false, {
              status: 401,
              errors: ["Incorrect username and/or password"],
            });
        })
        .catch(() =>
          done(null, false, { status: 500, errors: ["Database error"] })
        );
    })
  );

  // serialization and deserialization of the user to and from a cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    userDao
      .getUserById(id)
      .then((user) => {
        done(null, user); // this will be available in req.user
      })
      .catch((err) => {
        done(err, null);
      });
  });

  // set up the express-session
  app.use(
    session({
      secret: "wge8d239bwd93rkskb",
      resave: false,
      saveUninitialized: false,
      cookie: { sameSite: "strict" },
    })
  );

  // initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}

/**
 * Custom middleware: check if a given request is coming from an authenticated user
 */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ errors: ["Not authenticated"] });
}

module.exports = { initAuthentication, isLoggedIn };
