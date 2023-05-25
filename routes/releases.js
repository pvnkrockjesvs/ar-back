var express = require("express");
const Profile = require("../models/profiles");
var router = express.Router();
const Release = require("../models/releases");
const Artist = require("../models/artists");
const moment = require("moment");
const url = "http://musicbrainz.org/ws/2/release?release-group=";
const url2 = "http://musicbrainz.org/ws/2/";

/* get the release with the RELEASE MBID */
router.get("/:mbid", (req, res) => {
  fetch(
    url +
      `${req.params.mbid}&inc=recordings+artist-credits+labels+genres+release-groups&status=official&limit=2&fmt=json`
  )
    .then((response) => response.json())
    .then((releasegroup) => {
      if (releasegroup.error) {
        res.json({ result: true, error: releasegroup.error });
      } else {
        // console.log(releasegroup.releases[0]["artist-credit"][0].artist.id);
        let albumLength = 0;
        let label, genre = []
        const tracks = releasegroup.releases[0].media[0].tracks.map(
          (data, i) => {
            albumLength += data.length;
            return { title: data.title, trackLength: data.length };
          }
        );
        if (releasegroup.releases[0]["release-group"].genres) {
          genre.push(releasegroup.releases[0]["release-group"].genres.map(
            (data, i) => {
              return { name: data.name, count: data.count };
            }
          ))
          genre.sort(function (a, b) {
            return new Date(b.count) - new Date(a.count);
          });
          genre = genre.slice(0, 1);
        }

        if (releasegroup.releases[0]["label-info"].length > 0) {
          label = releasegroup.releases[0]["label-info"][0].label.name
        }
       

        
        res.json({
          artist: releasegroup.releases[0]["artist-credit"][0].name,
          arid: releasegroup.releases[0]["artist-credit"][0].artist.id,
          date: releasegroup.releases[0].date,
          title: releasegroup.releases[0].title,
          label: releasegroup.releases[0]["label-info"][0].label.name,
          trackCount: releasegroup.releases[0].media[0]["track-count"],
          genre,
          albumLength,
          tracks,
        });
      }
    });
});

module.exports = router;
