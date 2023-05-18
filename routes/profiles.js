var express = require('express');
require("../models/connection");

var router = express.Router();
const Profile = require("../models/profiles");
const User = require("../models/users");

router.post('/create', (req,res) => {   
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

router.post('/update', (req,res) => {   
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

router.get('/myartists/:token', (req, res) => {
   User.findOne({ token: req.params.token }).then((user) => {
      Profile.findOne({ user: user.id}).populate("artists").then((profile) => {
         if (profile.artists.length > 0) {
            const artists = profile.artists.map((data, i) => {
               return ({ name: data.name, mbid: data.mbid })
            })
            res.json({ result: true, artists })
         } else {
            res.json({ result: true, error: 'No artists followed' })
         }
      })
   })
})

module.exports = router;