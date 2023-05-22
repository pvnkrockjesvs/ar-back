require('dotenv').config();
var express = require('express');
require("../models/connection");

const TopRelease = require('../models/topreleases');
const Release = require('../models/releases');
const Profile = require('../models/profiles');

const Artist = require('../models/artists');
const moment = require('moment')

Release.find({ date: { $gte: moment().subtract(3, 'weeks').toDate(),
                        $lte: moment().toDate() 
                     }})
.then((release) => {
   return Promise.all(release.map((data, i) => {
      return Artist.findOne({mbid: data.arid}).then((artist) => {
         if (artist) {
            return Profile.find({artists: artist.id}).then((profile) => {
               return { album: data.mbid, count: profile.length } 
            })         
         }
      })
   })).then((data) => {
      data = data.filter( Boolean )
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
})