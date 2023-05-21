var express = require('express');
var router = express.Router();

const url = 'http://musicbrainz.org/ws/2/release?release-group='

/* get the release with the RELEASE MBID */
router.get('/:mbid', (req, res) => {
   fetch(url+`${req.params.mbid}&inc=recordings+labels+genres+release-groups&status=official&limit=2&fmt=json`)
   .then(response => response.json())
   .then((releasegroup) => {
      if (releasegroup.error) {
         res.json({result : true, error : releasegroup.error})
      } else {
         let albumLength = 0
         const tracks = releasegroup.releases[0].media[0].tracks.map((data, i) => {
            albumLength += data.length
            return ({ title: data.title, trackLength: data.length })
         })
         let genre = releasegroup.releases[0]['release-group'].genres.map((data, i) => {
            return ({ name: data.name, count: data.count })
         })
         genre.sort(function(a,b){ return new Date(b.count) - new Date(a.count)})
         genre = genre.slice( 0, 1 )


         res.json({
            date: releasegroup.releases[0].date, 
            title: releasegroup.releases[0].title,
            label: releasegroup.releases[0]['label-info'][0].label.name,
            trackCount: releasegroup.releases[0].media[0]['track-count'],
            genre: genre[0].name,
            albumLength,
            tracks,
         })         
      }
   })
})

module.exports = router;  