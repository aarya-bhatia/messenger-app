const mongoose = require("mongoose");
const models = require("./models");

require('./db')

models.User.find({})
  .then(async (users) => {
    for (const user of users) {
      user.username = user.username.toLowerCase();
      user.email = user.email.toLowerCase();
      await user.save();
      console.log("update: ", user);
    }
  })
  .catch((err) => {
    console.err(err);
  })