const mongoose = require('mongoose');

const artistSchema = mongoose.Schema({
   mbid: String,
   name: String,
   conflict: { type : Boolean, default : false }
})

const Artist = mongoose.model( 'artists', artistSchema )
module.exports = Artist