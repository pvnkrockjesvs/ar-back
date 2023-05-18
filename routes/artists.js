var express = require('express');
require("../models/connection");
var router = express.Router();
const Profile = require("../models/profiles");
const User = require("../models/users");
const Artist = require("../models/artists");


const lastapi = process.env.LASTFM_API
const url = 'http://musicbrainz.org/ws/2/'

/* fetch info artist */
router.get('/:mbid', (req, res) => {
   fetch(url+`artist/${req.params.mbid}?fmt=json`)
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

/* fetch info last album */
router.get('/:mbid/lastalbum', (req, res) => {
   fetch(url+`release-group?artist=${req.params.mbid}&type=album|ep&limit=100&fmt=json`)
   .then(response => response.json()).then((mbalbums) => {
      return Promise.all(mbalbums['release-groups'].map((datagroup, i) => {
         if (datagroup['secondary-types'].length == 0) {
            return fetch(url+`release?release-group=${datagroup.id}&status=official&inc=recordings&limit=1&fmt=json`)
            .then(response => response.json()).then((data) => {
               const rel = data.releases[0]
               let releaseLength = 0 

               if (data.releases.length > 0 && rel.media.length>0 ) {
                  rel.media[0].tracks.map((data, i) => { releaseLength += data.length })

                  if (releaseLength > 0) {
                     return fetch(`http://coverartarchive.org/release-group/${datagroup.id}?fmt=json`)
                     .then(response => response.json()).then((data) => {
                        return ({cover : data.images[0].image, date: datagroup['first-release-date'], title: datagroup.title})
                     })
                  }
               }
            }) 
         }
      })).then(data => { 
         data.sort(function(a,b){ return new Date(b.date) - new Date(a.date)})
         data = data.slice( 0, 1 ); 
         res.json({result: true, releases: data})
      })

   })
}) 

/** fetch info release **/
router.get('/:mbid/album', (req, res) => {
   // const sectype = 'NOT secondarytype:compilation NOT secondarytype:live NOT secondarytype:soundtrack NOT secondarytype:spokenword NOT secondarytype:interview NOT secondarytype:audiobook NOT secondarytype:remix NOT secondarytype:djmix NOT secondarytype:demo NOT secondarytype:mixtape'

   // fetch(url+`release-group/?query=arid:${req.params.mbid} AND status:official AND primarytype:album ${sectype}&fmt=json&inc=releases+recordings`)
   // .then(response => response.json()).then((mbalbums) => {
   //    // return Promise.all(mbalbums['release-groups'].map((datagroup, i) => {
   //    //    return fetch(url+`release?release-group=${datagroup.id}&status=official&inc=recordings&limit=1&fmt=json`)
   //    //    .then(response => response.json()).then((data, i) => {
   //    //       if (data.error) {
   //    //          console.log(data)
   //    //       }
   //    //       const rel = data.releases[0]
   //    //       let releaseLength = 0 

   //    //       if (data.releases.length > 0 && rel.media.length>0 ) {
   //    //          rel.media[0].tracks.map((data, i) => { releaseLength += data.length })

   //    //          if (releaseLength > 0) {
   //    //             const newAlbum = {
   //    //                date: rel.date,
   //    //                title: datagroup.title,
   //    //                id: rel.id,
   //    //                length: releaseLength,
   //    //                numberTracks: rel.media[0]['track-count']
   //    //             }
   //    //             return newAlbum    
   //    //          }  
   //    //       }
   //    //    })     
   //    // })).then(data => { 
   //    //    data.sort(function(a,b){ return new Date(a.date) - new Date(b.date)})
   //    //    data = data.filter( Boolean ); // removes undefined
   //    //    res.json({result: true, releases: data})
   //    // })

   //    const albums = {
   //       date: mbalbums['release-groups'].
   //    }

   //    res.json({ result: true, mbalbums })
   // })

   // http://musicbrainz.org/ws/2/release-group/?query=arid:f59c5520-5f46-4d2c-b2c4-822eabf53419 AND status:official AND primarytype:album&fmt=json&inc=releases+recordings
   
   
   fetch(url+`release-group?artist=${req.params.mbid}&type=album&limit=100&fmt=json`)
   .then(response => response.json()).then((mbalbums) => {
      return Promise.all(mbalbums['release-groups'].map((datagroup, i) => {
         if (datagroup['secondary-types'].length == 0 && datagroup['first-release-date'] !== '') {
            const album = {
               title: datagroup.title,
               mbid: datagroup.id,
               date: datagroup['first-release-date']
            }
            return album
         }
      })).then(data => { 
         data.sort(function(a,b){ return new Date(a.date) - new Date(b.date)})
         data = data.filter( Boolean ); // removes undefined
         res.json({result: true, releases: data})
      })
   })
}) 

router.get('/:mbid/ep', (req, res) => {
   fetch(url+`release-group?artist=${req.params.mbid}&type=ep&limit=100&fmt=json`)
   .then(response => response.json()).then((mbalbums) => {
      return Promise.all(mbalbums['release-groups'].map((datagroup, i) => {
         if (datagroup['secondary-types'].length == 0 && datagroup['first-release-date'] !== '') {
            const album = {
               title: datagroup.title,
               mbid: datagroup.id,
               date: datagroup['first-release-date']
            }
            return album
         }
      })).then(data => { 
         data.sort(function(a,b){ return new Date(a.date) - new Date(b.date)})
         data = data.filter( Boolean ); // removes undefined
         res.json({result: true, releases: data})
      })
   })
})

router.get('/:mbid/single', (req, res) => {
   fetch(url+`release-group?artist=${req.params.mbid}&type=single&limit=100&fmt=json`)
   .then(response => response.json()).then((mbalbums) => {
      return Promise.all(mbalbums['release-groups'].map((datagroup, i) => {
         if (datagroup['secondary-types'].length == 0 && datagroup['first-release-date'] !== '') {
            const album = {
               title: datagroup.title,
               mbid: datagroup.id,
               date: datagroup['first-release-date']
            }
            return album
         }
      })).then(data => { 
         data.sort(function(a,b){ return new Date(a.date) - new Date(b.date)})
         data = data.filter( Boolean ); // removes undefined
         res.json({result: true, releases: data})
      })
   })
})

/* follow an artist */
router.post('/', (req, res) => {
   fetch(url+`artist/${req.body.mbid}?fmt=json`)
   .then(response => response.json()).then((artist) => {
      Artist.findOne({ mbid: req.body.mbid }).then((dbartist) => {
         if (dbartist == null) {
            const newArtist = new Artist({ mbid: req.body.mbid, name: artist.name})

            newArtist.save().then((newdbartist) => {
               User.findOne({ token: req.body.token }).then((user) => {
                  Profile.updateOne({ user: user.id }, {
                     $push: { artists: newdbartist.id }
                  }).then((profile) => {
                     res.json({ result: true, profile })
                  })
               })
            })
         } else {
            User.findOne({ token: req.body.token }).then((user) => {
               Profile.updateOne({ user: user.id }, {
                  $addToSet: { artists: dbartist.id }
               }).then((profile) => {
                  res.json({ result: true, profile })
               })
            })
         }
      })
   })
})

/* unfollow an artist */
router.delete('/', (req, res) => {
   fetch(url+`artist/${req.body.mbid}?fmt=json`)
   .then(response => response.json()).then((artist) => {
      Artist.findOne({ mbid: req.body.mbid }).then((dbartist) => {
         User.findOne({ token: req.body.token }).then((user) => {
            Profile.updateOne({ user: user.id }, {
               $pull: { artists: dbartist.id }
            }).then((profile) => {
               res.json({ result: true, profile })
            })
         })
      })
   })
})
module.exports = router;  