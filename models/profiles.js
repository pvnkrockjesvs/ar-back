const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
   avatar: String,
   newsletter: Number,
   genres: { type: [String], default: [] },
   releaseTypes: [String],
   isPremium: { type: Boolean, default: false },
   ical: String,
   rss: String,
   artists: { type : [{type: mongoose.Schema.Types.ObjectId, ref: 'artists'}], default: []},
   releases: { type : [{type: mongoose.Schema.Types.ObjectId, ref: 'releases'}], default: []},
   user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
   conflicts: [String]
})

const Profile = mongoose.model('profiles', profileSchema);
module.exports = Profile;