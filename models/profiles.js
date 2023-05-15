const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
   avatar: String,
   newsletter: Number,
   genres: [String],
   releaseTypes: [String],
   isPremium: Boolean,
   ical: String,
   rss: String,
   artists: [{type: mongoose.Schema.Types.ObjectId, ref: 'artists'}],
   albums: [{type: mongoose.Schema.Types.ObjectId, ref: 'albums'}],
   user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
})

const Profile = mongoose.model('profiles', profileSchema);
module.exports = Profile;