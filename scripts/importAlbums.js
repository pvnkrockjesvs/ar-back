require('dotenv').config();
var express = require('express');
require("../models/connection");

const Release = require('../models/releases');
const Artist = require('../models/artists');
const moment = require('moment')

Artist.find().then((artists) => {
   let i = 0

   setInterval(() => {
      fetch(`http://musicbrainz.org/ws/2/release-group?query=arid:${artists[i].mbid} 
      AND status:official&limit=100&fmt=json`)
      .then(response => response.json()).then((mbalbums) => {
         console.log(mbalbums.name + ' ' + i)
         if (mbalbums.error) {
            console.log({ result: false, error: mbalbums.error})
         } else if (mbalbums.count == 0) {
         } else {
            return Promise.all(mbalbums['release-groups'].map((datagroup, i) => {
               if (!datagroup['secondary-types'] && datagroup['first-release-date'] !== ''  
               && datagroup['first-release-date'] && 
               moment(datagroup['first-release-date']) > moment().subtract(2, 'months') ){
                  console.log(datagroup)
                  const album = {
                     title: datagroup.title,
                     mbid: datagroup.id,
                     date: datagroup['first-release-date'],
                     arid: datagroup['artist-credit'][0].artist.id,
                     arname: datagroup['artist-credit'][0].artist.name,
                     type: datagroup['primary-type']
                  }
                  return album
               }
            })).then(data => {                   

               data.sort(function(a,b){ return new Date(b.date) - new Date(a.date)})
               data = data.filter( Boolean ); // removes undefined

               if (data != []) {
                  data.map((album, i) => {
                  Release.findOne({ mbid: album.mbid}).then(release => {
                     if (release === null) {
                        const newRelease = new Release({
                           mbid: album.mbid,
                           title: album.title,
                           date: album.date,
                           arid: album.arid,
                           arname: album.arname,
                           type: album.type
                        })
                        
                        newRelease.save().then((data) => {
                           console.log(data)
                        })
                     }
                  })
                  })
               }


            })
         }
      })
      if (i < artists.length) {
         i++                
      } else {
         clearInterval(this)
      }
   }, 1000)
   
})