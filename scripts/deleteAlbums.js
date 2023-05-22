require('dotenv').config();
var express = require('express');
require("../models/connection");

const Release = require('../models/releases');
const Artist = require('../models/artists');
const moment = require('moment')

Release.deleteMany({
  date: { $lte: moment().subtract(2, 'months').toDate()}
}).then(data => {
   console.log(data)
})