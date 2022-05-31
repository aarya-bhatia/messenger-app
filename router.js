const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const axios = require("axios");
const store = require("./store");
const { User, Message } = require("./models");
const { validationResult, body, check } = require("express-validator");
const req = require("express/lib/request");

router = express.Router();

const dailyQuoteAPI = "https://zenquotes.io/api/random";

// middleware to test if authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    req.session.redirectURL = req.url;
    return res.redirect("/sign-in");
  }
}

router.get("/", (req, res) => {
  axios
    .get(dailyQuoteAPI)
    .then((apiRes) => {
      quote = apiRes.data[0];
      return res.render("home", {
        quote: quote.q,
        author: quote.a,
        user: req.session.user || null,
      });
    })
    .catch((err) => {
      return res.render("home", {
        quote: "",
        author: "",
        user: req.session.user || null,
      });
    });
});

router.get("/dashboard", isAuthenticated, (req, res) => {
  const user = req.session.user;
  res.render("dashboard", { user });
});

router.get("/inbox", isAuthenticated, (req, res) => {
  const user = req.session.user;

  res.render("inbox", {
    user,
  });
});

router.get("/settings", isAuthenticated, (req, res) => {
  const user = req.session.user;

  res.render("settings", {
    user,
  });
});

router.get("/api/messages", isAuthenticated, (req, res) => {
  Message.find({
    time: {
      $gte: req.session.user.createdAt,
    },
  })
    .sort({ time: 1 })
    .limit(100)
    .exec()
    .then((messages) => {
      res.json(messages);
    });
});

router.get("/sign-up", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("sign-up", {
    message: "",
    errors: [],
    user: null,
  });
});

router.get("/sign-in", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("sign-in", {
    message: "",
    errors: [],
    user: null,
  });
});

router.post(
  "/sign-up",
  check("first_name", "First Name is required").trim().not().isEmpty(),
  check("last_name", "Last Name is required").trim().not().isEmpty(),
  check("username", "username is required").trim().not().isEmpty(),
  check("email", "email is required").trim().not().isEmpty(),
  check("password", "password is required").trim().not().isEmpty(),
  check("first_name", "First Name must contain alphabets only").isAlpha(),
  check("last_name", "Last Name must contain alphabets only").isAlpha(),
  check("password", "Password must be at least 6 characters long").isLength({
    min: 6,
  }),
  check(
    "username",
    "username should contain alphabets, numbers, dots or underscore only"
  ).matches(/^[A-Za-z0-9_\.]+$/),
  check("password", "Password should contain a number").matches(/\d/),
  check("password", "Password should contain a special character").matches(
    /[!@#$%^&*]/
  ),
  check("email", "Email should be a valid").isEmail(),
  body("first_name").customSanitizer((value) => {
    return value[0].toUpperCase() + value.toLowerCase().substring(1);
  }),
  body("last_name").customSanitizer((value) => {
    return value[0].toUpperCase() + value.toLowerCase().substring(1);
  }),
  body("username").customSanitizer((value) => value.toLowerCase()),
  body("email").customSanitizer((value) => value.toLowerCase()),
  check("username").custom((username) => {
    return User.findOne({
      username: username,
    }).then((user) => {
      if (user) {
        return Promise.reject("This username is already in use");
      }
      Promise.resolve();
    });
  }),
  (req, res) => {
    /* check input validation errors */
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("sign-up", {
        errors: errors.array(),
        message: "",
        user: null,
      });
    }

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    bcrypt.hash(password, saltRounds).then((password_hash) => {
      User.create({
        first_name,
        last_name,
        email,
        password: password_hash,
        username: username,
      }).then((user) => {
        req.session.user = user;
        return res.redirect("/");
      });
    });
  }
);

function findUser(value) {
  return new Promise(function (resolve, reject) {
    User.findOne({ username: value }).then((user) => {
      if (!user) {
        User.findOne({ email: value }).then((user) => {
          if (!user) {
            return reject({
              message: "No user account found with this username or email",
            });
          } else {
            resolve(user);
          }
        });
      } else {
        resolve(user);
      }
    });
  });
}

function checkPassword(password, user) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        return reject({ message: "Password does not match" });
      } else {
        resolve();
      }
    });
  });
}

router.post(
  "/sign-in",
  check("username", "username is required").trim().not().isEmpty(),
  check("password", "password is required").trim().not().isEmpty(),
  body("username").customSanitizer((value) => value.toLowerCase()),
  (req, res) => {
    /* check input validation errors */
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("sign-in", {
        errors: errors.array(),
        message: "",
        user: null,
      });
    }

    const { username, password } = req.body;
    console.log(req.body);

    if (!username) {
      throw new Error({ message: "Username is required", status: 400 });
    }

    if (!password) {
      throw new Error({ message: "Password required", status: 400 });
    }

    findUser(username)
      .then((user) => {
        checkPassword(password, user)
          .then(() => {
            req.session.user = user;

            if (req.session.redirectURL) {
              tmp = req.session.redirectURL;
              req.session.redirectURL = null;
              return res.redirect(tmp);
            } else {
              return res.redirect("/");
            }
          })
          .catch((err) => {
            res.render("error", { message: err.message });
          });
      })
      .catch((err) => {
        res.render("error", { message: err.message, user: null });
      });
  }
);

router.get("/sign-out", (req, res) => {
  req.session.destroy(() => {
    return res.redirect("/");
  });
});

router.get("/api/store", (req, res) => {
  res.json({
    online: store.online,
    last_seen: store.last_seen,
  });
});

router.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).render("error", {
    message: err.message || "Internal Server Error",
    user: req.session.user || null,
  });
});

module.exports = router;
