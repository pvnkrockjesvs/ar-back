const mongoose = require('mongoose');

const topreleasesSchema = mongoose.Schema({
   mbid: String,
   title: String,
   date: Date,
   arid: String,
   artist: String,
   type: String,
   cover: String,
   dbCount: Number,
   trackCount: Number,
})

const TopRelease = mongoose.model( 'topreleases', topreleasesSchema )
module.exports = TopRelease