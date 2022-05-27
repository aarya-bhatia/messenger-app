const express = require("express");
const models = require("./models");
const router = express.Router();

router.get("/messages", (req, res) => {
  return models.Message.find({})
    .then((result) => res.json(result))
    .catch(err => next(err))
});