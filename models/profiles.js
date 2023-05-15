const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
   avatar: { type: String, default: 'https://www.pngkey.com/png/full/115-1150152_default-profile-picture-avatar-png-green.png' },
   newsletter: Number,
   genres: { type: [String], default: [] },
   releaseTypes: [String],
   isPremium: { type: Boolean, default: false },
   ical: String,
   rss: String,
   artists: { type : [{type: mongoose.Schema.Types.ObjectId, ref: 'artists'}], default: []},
   albums: { type : [{type: mongoose.Schema.Types.ObjectId, ref: 'albums'}], default: []},
   user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
})

const Profile = mongoose.model('profiles', profileSchema);
module.exports = Profile;