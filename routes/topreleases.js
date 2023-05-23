var express = require('express');
const Profile = require('../models/profiles');
var router = express.Router();
const Release = require('../models/releases');
const Artist = require('../models/artists');
const moment = require('moment')
const TopRelease = require('../models/topreleases');


router.get('/', function(req, res) {
   TopRelease.find({}).then(releases => {
      res.json({result :true, releases})
   })
})

module.exports = router;  