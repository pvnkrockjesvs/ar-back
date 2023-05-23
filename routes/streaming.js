var express = require("express");
require("../models/connection");
var router = express.Router();
//const { getToken } = require("../modules/getToken");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let API_TOKEN = "";

// Code pour récupérer un Token Automatiquement à chaque chargement de la page
function getToken() {
  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&client_id=" +
      client_id +
      "&client_secret=" +
      client_secret,
  })
    .then((response) => response.json())
    .then((data) => {
      API_TOKEN = data.access_token;
      console.log("APITOKENS Initialized OK ");
    })
    .catch((error) => console.error(error));
}

//Route .post /spotify/album pour récupérer le lien spotify d'un album
router.post("/spotify/album", async (req, res) => {
  await getToken();
  //Remplacer les espaces de la requete par %2520 avec une regex
  const album = req.body.album.replace(/ /g, "%2520");
  const artist = req.body.artist.replace(/ /g, "%2520");

  fetch(
    `https://api.spotify.com/v1/search?q=${album}%2520artist%3A${artist}&type=album`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  )
    .then((response) => response.json())
    .then((albumData) => {
      if (!albumData) {
        res.json({ result: false, error: "No album found" });
      } else {
        // console.log(albumData.albums.items[0].external_urls.spotify); //url spotify de l'album
        res.json({ result: true, data: albumData.albums.items });
      }
    });
});

module.exports = router;
