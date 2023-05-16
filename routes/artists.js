var express = require('express');
require("../models/connection");

var router = express.Router();
const Artist = require("../models/artists");

const lastapi = process.env.LASTFM_API
router.get('/:mbid', async (req, res) => {
   fetch(`http://musicbrainz.org/ws/2/artist/${req.params.mbid}?fmt=json`)
   .then(response => response.json()).then((artist) => {
      fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist.name}&api_key=${lastapi}&format=json`)
      .then(response => response.json()).then((lastfmartist) => {
         const art = {
         ended: artist['life-span'].ended,
         name: artist.name,
         bio: lastfmartist.artist.bio.summary,
         image: lastfmartist.artist.image[2]['#text']
         }

         if (artist !== null) { 
            res.json({ result: true, art })
         }
      })
   })
})

router.get('/albums/:mbid', (req, res) => {
   fetch(`http://musicbrainz.org/ws/2/release-group?artist=${req.params.mbid}&type=album&limit=100&fmt=json`)
   .then(response => response.json()).then((mbalbums) => {
      let albums = []
      mbalbums['release-groups'].map((data, i) => {
         if (data['secondary-types'].length == 0) {
            albums.push({
               release: data['first-release-date'],
               title: data.title,
               id: data.id
            })
         }
      })
      albums.sort(function(a,b){ return new Date(a.release) - new Date(b.release)})
      res.json({result: true, albums})
   })
})

router.get('/eps/:mbid', (req, res) => {
   fetch(`http://musicbrainz.org/ws/2/release-group?artist=${req.params.mbid}&type=ep&limit=100&fmt=json`)
   .then(response => response.json()).then((mbeps) => {
      let eps = []
      mbeps['release-groups'].map((data, i) => {
         if (data['secondary-types'].length == 0) {
            eps.push({
               release: data['first-release-date'],
               title: data.title,
               id: data.id
            })
         }
      })
      eps.sort(function(a,b){ return new Date(a.release) - new Date(b.release)})
      res.json({result: true, eps})
   })
})

router.get('/singles/:mbid', (req, res) => {
   fetch(`http://musicbrainz.org/ws/2/release-group?artist=${req.params.mbid}&type=single&limit=100&fmt=json`)
   .then(response => response.json()).then((mbsingles) => {
      let singles = []
      mbsingles['release-groups'].map((data, i) => {
         if (data['secondary-types'].length == 0 ) {
            singles.push({
               release: data['first-release-date'],
               title: data.title,
               id: data.id
            })
         }
      })
      singles.sort(function(a,b){ return new Date(a.release) - new Date(b.release)})
      res.json({result: true, singles})
   })
})


module.exports = router;