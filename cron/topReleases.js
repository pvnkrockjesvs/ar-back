require('dotenv').config();
var express = require('express');
require("../models/connection");

const TopRelease = require('../models/topreleases');
const Release = require('../models/releases');
const Profile = require('../models/profiles');
var cron = require('node-cron');

const Artist = require('../models/artists');
const moment = require('moment')
const url = 'http://musicbrainz.org/ws/2/release?release-group='

//cron.schedule('*/10 * * * *'), () => {
   TopRelease.deleteMany({}).then(
      Release.find({ date: { 
         $gte: moment().subtract(3, 'weeks').toDate(),
         $lte: moment().toDate() 
      }})
      .then((release) => {
         return Promise.all(release.map((data, i) => {
            if (data.type === 'Album' || data.type === 'EP'){
               return Artist.findOne({mbid: data.arid}).then((artist) => {
                  if (artist) {
                     return Profile.find({artists: artist.id}).then((profile) => {
                        return { album: data.mbid, type: data.type, title: data.title, date: data.date, count: profile.length, artist: artist.name, arid: artist.mbid} 
                     })         
                  }
               })
            }
         })).then((data) => {
            data.sort(function(a,b){ return new Date(b.count) - new Date(a.count)})
            data = data.filter( Boolean )
            data.slice(0, 14)

            let i = 0
            const interv = setInterval(async () => { 
               await fetch(`http://coverartarchive.org/release-group/${data[i].album}?fmt=json`)
                  .then(response => response.json()).then((cover) => {
                     const newtoprelease = new TopRelease({
                        mbid : data[i].album,
                        date: data[i].date, 
                        title: data[i].title,
                        dbCount: data[i].count,
                        artist: data[i].artist,
                        arid: data[i].arid,
                        cover: cover.images[0].thumbnails['500'],
                        type: data[i].type
                     })    
                     newtoprelease.save()             
               })
               i < data.length - 1 ? i++ : clearInterval(interv)
            }, 2000)
         })
      })
   )
//}

   