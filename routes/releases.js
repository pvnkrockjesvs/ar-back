var express = require('express');
var router = express.Router();

const url = 'http://musicbrainz.org/ws/2/release/'

/* get the release with the RELEASE MBID */
router.get('/:mbid', (req, res) => {
   fetch(url+`${req.params.mbid}?inc=recordings+labels+genres+release-groups&fmt=json`)
   .then(response => response.json())
   .then((release) => {
      fetch(`http://coverartarchive.org/release/${req.params.mbid}?fmt=json`)
      .then(response => response.json()).then((cover) => {
         const tracks = release.media[0].tracks.map((data, i) => {
            return ({ title: data.title, length: data.length })
         })
         let genre = release['release-group'].genres.map((data, i) => {
            return ({ name: data.name, count: data.count })
         })
         genre.sort(function(a,b){ return new Date(b.count) - new Date(a.count)})
         genre = genre.slice( 0, 1 )
         res.json({
            cover : cover.images[0].image, 
            date: release.date, 
            title: release.title,
            label: release['label-info'][0].label.name,
            genre: genre[0].name,
            tracks,
         })         
      })
   })
})

module.exports = router;  