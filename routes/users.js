var express = require('express');
require("../models/connection");

var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { checkBody } = require("../modules/checkBody");
const User = require("../models/users");


uid2(32);

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((user) => {
    if (user === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32)
      })

      newUser.save().then((user) => {
        res.json({ result: true, user })
      })
    } else {
      res.json({ result: false, error: "User already in db" });
    }
  })
})


module.exports = router;
