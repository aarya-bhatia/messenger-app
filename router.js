const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const axios = require("axios");
const store = require("./store");
const { User, Message } = require("./models");

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
      return res.render("welcome", { quote: quote.q, author: quote.a });
    })
    .catch((apiErr) => next(apiErr));
});

router.get("/home", isAuthenticated, (req, res) => {
  const user = req.session.user;
  res.render("home", { user });
});

router.get("/inbox", isAuthenticated, (req, res) => {
  const user = req.session.user;

  Message.find({})
    .sort({ time: 1 })
    .limit(100)
    .exec()
    .then((messages) => {
      res.render("inbox", {
        user,
        messages,
      });
    })
    .catch((err) => next(err));
});

router.get("/sign-up", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home");
  }

  res.render("sign-up", {
    message: "",
  });
});

router.get("/sign-in", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home");
  }

  res.render("sign-in", {
    message: "",
  });
});

router.post("/sign-up", (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ username }).then((user) => {
    if (user) {
      return res.render("sign-up", {
        message: "Sorry, this username is taken",
      });
    }

    bcrypt
      .hash(password, saltRounds)
      .then((passwordHash) => {
        user = new User({
          name: name,
          email: email,
          password: passwordHash,
          username: username,
        });

        console.log(user);

        user
          .save()
          .then(() => {
            req.session.user = user;
            return res.redirect("/home");
          })

          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => next(err));
  });
});

router.post("/sign-in", (req, res, next) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return next({ message: "please fill all fields", status: 400 });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return next({
          message: "No account found for this email",
          status: 400,
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            req.session.user = user;

            if (req.session.redirectURL) {
              tmp = req.session.redirectURL;
              req.session.redirectURL = null;
              return res.redirect(tmp);
            }

            return res.redirect("/home");
          } else {
            res.render("sign-in", {
              message: "Invalid username or password.",
            });
          }
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.get("/sign-out", (req, res) => {
  req.session.destroy(() => {
    return res.redirect("/");
  });
});

router.get("/var", (req, res) => {
  res.json({
    online: store.online,
    last_seen: store.last_seen,
  });
});

router.use((err, req, res, next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json({ ...err, message: err.message || "Internal Server Error" });
});

module.exports = router;
