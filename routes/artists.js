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
         console.log(lastfmartist)
         const art = {
         ended: artist['life-span'].ended,
         name: artist.name,
         image: lastfmartist.image[3]['#text']
         }

         if (artist !== null) { 
            res.json({ result: true, art })
         }
      })
   })
})

module.exports = router;