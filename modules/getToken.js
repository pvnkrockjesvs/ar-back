function getToken(id, secret) {
  let API_TOKEN = "";
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&client_id=" +
      id +
      "&client_secret=" +
      secret,
  })
    .then((response) => response.json())
    .then((data) => {
      API_TOKEN = data.access_token;
      console.log("APITOKENS Initialized OK " + API_TOKEN);
    })
    .catch((error) => console.error(error));
  return API_TOKEN;
}

module.exports = { getToken };
