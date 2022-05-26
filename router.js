const express = require("express");
router = express.Router();

const { User, Message } = require("./models");

router.get("/", (req, res) => {
  res.render("welcome");
});

router.get("/home/:id", (req, res) => {
  const userid = req.params.id;
  User.findOne(
    {
      _id: userid,
    },
    function (err, user) {
      if (err) console.log(err);
      else {
        if (user) {
          res.render("home", {
            user: user,
          });
        }
      }
    }
  );
});

router.get("/inbox/:id", (req, res) => {
  const userid = req.params.id;
  User.findOne(
    {
      _id: userid,
    },
    function (err, user) {
      if (err) console.log(err);
      else {
        if (user) {
          Message.find({}, function (e, found) {
            res.render("inbox", {
              user: user,
              messages: found,
            });
          });
        }
      }
    }
  );
});

router.get("/sign-up", (req, res) => {
  res.render("sign-up", {
    message: "",
  });
});

router.get("/sign-in", (req, res) => {
  res.render("sign-in", {
    message: "",
  });
});

router.post("/sign-up", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ username }).then((user) => {
    if (user) {
      return res.render("sign-up", {
        message: "Sorry, this username is taken",
      });
    }

    user = new User({
      email: email,
      password: password,
      username: username,
    });

    console.log(user);

    user
      .save()
      .then(() => {
        return res.render("home", {user});
      })

      .catch((err) => {
        next(err);
      });
  });
});

router.post("/sign-in", (req, res, next) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return next({ message: "please fill all fields", status: 400 });
  }

  User.findOne({ email })
    .then((user) => {
      if(!user)
      {
        return next({ message: "No account found for this email", status: 400 });
      }

      if (user.password == password) {
        res.render("home", {
          user: user,
        });
      } else {
        res.render("sign-in", {
          message: "Invalid username or password.",
        });
      }
    })
    .catch((err) => next(err));
});

router.use((err, req, res, next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json({ ...err, message: err.message || "Internal Server Error" });
});

module.exports = router;
