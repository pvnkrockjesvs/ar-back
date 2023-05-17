var express = require('express');
require("../models/connection");

var router = express.Router();
const Profile = require("../models/profiles");
const User = require("../models/users");

router.post('/create', async(req,res) => {   
   User.findOne({ token: req.body.token }).then((user) => {
      console.log('USER:', user)
      Profile.findOne({ user: user.id}).then((profile) => {
         if (profile === null) {
            const newProfile = new Profile({
               avatar: req.body.avatar,
               newsletter: req.body.newsletter,
               genres: req.body.genres,
               releaseTypes: req.body.releaseTypes,
               ical: req.body.ical,
               rss: req.body.rss,
               artists: req.body.artists,
               albums: req.body.albums,
               user: user.id,
               isPremium: req.body.isPremium
            })
            newProfile.save().then((profile) => {
               res.json({result: true, profile})
            })
         }
      })
   })
})

router.get('/', (req, res) => {
   User.findOne({ token: req.body.token }).then((user) => {
      Profile.findOne({ user: user.id}).then((profile) => {
         if (profile === null) {
            res.json({result: false, error: 'No profile found'})
         } else {
            res.json({result: true, profile})
         }
      })
   })
})

router.post('/update', async(req,res) => {   
   User.findOne({ token: req.body.token }).then((user) => {
      Profile.updateOne({ user: user.id }, {
         avatar: req.body.avatar,
         newsletter: req.body.newsletter,
         genres: req.body.genres,
         releaseTypes: req.body.releaseTypes,
      }).then((profile) => {
         res.json({ result: true, profile })
      })
   })
})

module.exports = router;