const mongoose = require('mongoose');

const topreleasesSchema = mongoose.Schema({
   mbid: String,
   title: String,
   date: Date,
   arid: String,
   arname: String,
   type: String,
   cover: String,

})

const TopRelease = mongoose.model( 'topreleases', topreleasesSchema )
module.exports = TopRelease