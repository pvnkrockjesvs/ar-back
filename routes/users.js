var express = require('express');
require("../models/connection");
const nodemailer = require("nodemailer");

var router = express.Router();
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const { checkBody } = require("../modules/checkBody");
const User = require("../models/users");

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
        res.json({ result: true, token: user.token, username: user.username })
      })
    } else {
      res.json({ result: false, error: "User already in db" });
    }
  })
})

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((user) => {
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.json({ result: true, token: user.token, username: user.username })
    } else {
      res.json({ result: false, error: "Wrong username/password"})
    }
  })
})

router.post('/update', (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.updateOne({ token : req.body.token }, {
    email: req.body.email,
    password: hash,
  }).then((user) => {
    res.json({ result: true, token: user.token, username: user.username })
  })
})

router.post('/signupconfirm', (req, res) => {
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

      newUser.save().then((userInfo) => {
        // send verification email
        const transporter = nodemailer.createTransport({
          host: process.env.HOST,
          port: process.env.PORT,
          secure: process.env.SECURE,
          auth: {
            user: process.env.USER_NAME,
            pass: process.env.USER_PASSWORD
          }
        })
        let confirmationCode = userInfo.token
        let mailOptions = {
          from: 'myemail4@ethereal.com',
          to: userInfo.email,
          subject: 'Subscription Confirmation Link',
          html: `<div>
                <h1>Email Confirmation</h1>
                <h2>Hello ${userInfo.username}</h2>
                <p>Thank you for subscribing. Please verify your email account by clicking on the following link</p>
                <a href=https://${req.headers.host}/confirm/${confirmationCode}> Click here</a>
                </div>`,
        }
        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            res.json({ result: false, error: err});
          } else {
            res.json({ result: true, token: userInfo.token, username: userInfo.username, message: `Confirmation email sent to ${userInfo.email}` })
          }
        })
      })
    } else {
      res.json({ result: false, error: "User already in db" });
    }
  })
})

module.exports = router;
