const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
   email: String,
   password: String,
   token: Number,
   profile: {type: mongoose.Schema.Types.ObjectId, ref: 'profile'}
})

const User = mongoose.model('users', userSchema);
module.exports = User;