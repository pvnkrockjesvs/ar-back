const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
   mbid: String
})

const Album = mongoose.model( 'albums', albumSchema )
module.exports = Album