require('dotenv').config();
var express = require('express');
require("../models/connection");

const TopRelease = require('../models/topreleases');
const Release = require('../models/releases');
const Profile = require('../models/profiles');

const Artist = require('../models/artists');
const moment = require('moment')
const url = 'http://musicbrainz.org/ws/2/release?release-group='

TopRelease.deleteMany({}).then(
   Release.find({ date: { 
      $gte: moment().subtract(3, 'weeks').toDate(),
      $lte: moment().toDate() 
   }})
   .then((release) => {
      return Promise.all(release.map((data, i) => {
         if (data.type !== 'Single'){
            return Artist.findOne({mbid: data.arid}).then((artist) => {
               if (artist) {
                  return Profile.find({artists: artist.id}).then((profile) => {
                     return { album: data.mbid, count: profile.length, artist: artist.name, arid: artist.mbid} 
                  })         
               }
            })
         }
      })).then((data) => {
         data.sort(function(a,b){ return new Date(b.count) - new Date(a.count)})
         data = data.filter( Boolean )
         data.slice(0, 14)

         let i = 0
         const interv = setInterval(() => {
            fetch(url+`${data[i].album}&inc=recordings+labels+genres+release-groups&status=official&limit=2&fmt=json`)
            .then(response => response.json())
            .then((releasegroup) => {
               if (releasegroup.error) {
                  console.log({result : true, error : releasegroup.error})
               } else {   
                  fetch(`http://coverartarchive.org/release-group/${data[i].album}?fmt=json`)
                  .then(response => response.json()).then((cover) => {
                     const newtoprelease = new TopRelease({
                        date: releasegroup.releases[0].date, 
                        title: releasegroup.releases[0].title,
                        trackCount: releasegroup.releases[0].media[0]['track-count'],
                        dbCount: data[i].count,
                        artist: data[i].artist,
                        arid: data[i].arid,
                        cover: cover.images[0].thumbnails['500']
                     })    
                     
                     newtoprelease.save()                  
                  })

               }
            })
            i++
         }, 2000)
      })
   })
)

   