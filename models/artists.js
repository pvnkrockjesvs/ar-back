const mongoose = require('mongoose');

const artistSchema = mongoose.Schema({
   mbid: String
})

const Artist = mongoose.model( 'artists', artistSchema )
module.exports = Artist