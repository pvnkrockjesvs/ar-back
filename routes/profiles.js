var express = require('express');
require("../models/connection");

var router = express.Router();
const Profile = require("../models/profiles");
const User = require("../models/users");
const Artist = require("../models/artists");
const lastapi = process.env.LASTFM_API

router.post('/create', (req,res) => {   
   User.findOne({ token: req.body.token }).then((user) => {
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

router.post('/', (req, res) => {
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
            const conflicts = profile.conflicts.map((data, i) => {
               return ({ name: data })
            })
            res.json({ result: true, artists, conflicts })
         } else {
            res.json({ result: true, error: 'No artists followed' })
         }
      })
   })
})

router.post('/import-last-fm', (req, res) => {
   const body = req.body
   const url = 'https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user='
   fetch(url+body.user+`&api_key=${lastapi}&period=${body.period}&limit=${body.limit}&format=json`)
   .then(response => response.json()).then(data => {
      if (data.error) {
         res.json({ result: false, error: data.error })
      } else {
         return Promise.all(data.topartists.artist.map((data, i) => {
            if (data.playcount > Number(body.min) && data.mbid !== '') {
               return Artist.findOne({ mbid: data.mbid }).then((dbartist) => {
                  if (dbartist == null) {
                     const newArtist = new Artist({ mbid: data.mbid, name: data.name})
                     newArtist.save().then((newdbartist) => {
                        return ({
                           mbid: data.mbid,
                           name: data.name,
                           id: newdbartist.id
                        })
                     })
                  } else {
                     return ({
                        mbid: data.mbid,
                        name: data.name,
                        id: dbartist.id
                     })
                  }
               })
               
            } else if (data.playcount > Number(body.min) && data.mbid === '')   {
               console.log(data)
               if (data.name != null && data.name !== '') {
                  return {conflict : data.name}
               }
            }         
         })).then(data => {
            data = data.filter( Boolean ); 
            const artistSet = data.map((data,i) => { return data.id })
            const conflictSet = data.map((data,i) => { return data.conflict })
            
            User.findOne({ token: req.body.token }).then((user) => {
               Profile.updateOne({ user: user.id }, {
                  $addToSet: { 
                     artists: artistSet,
                     conflicts: conflictSet
                  }
               }).then((profile) => {
                  res.json({ result: true, profile })
               })
            })
         })
      }
   })
})
module.exports = router;