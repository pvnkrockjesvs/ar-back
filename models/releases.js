const mongoose = require('mongoose');

const releasesSchema = mongoose.Schema({
   mbid: String,
   title: String,
   date: Date,
   arid: String,
   arname: String,
   type: String,
})

const Release = mongoose.model( 'releases', releasesSchema )
module.exports = Release