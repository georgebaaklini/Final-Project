"use strict";

// import the needed node_modules.
const express = require("express");
const morgan = require("morgan");

const {
  getCountries,
  getLeaguesbyCountry,
  getSquadByLeague,
  saveTeam,
  getTeams,
  deleteTeam,
  replacePlayer,
  addAllPlayers,
} = require("./Handlers");

express()
  // Below are methods that are included in express(). We chain them for convenience.
  // --------------------------------------------------------------------------------

  // This will give us will log more info to the console. see https://www.npmjs.com/package/morgan
  .use(morgan("tiny"))
  .use(express.json())

  // Any requests for static files will go into the public folder
  .use(express.static("public"))

  .get("/api/countries", getCountries)

  .get("/api/leagues-by-country", getLeaguesbyCountry)

  .get("/api/squads/:league", getSquadByLeague)

  .post("/api/save-team", saveTeam)

  .get("/api/teams", getTeams)

  .get("/api/players:name?", addAllPlayers)

  .delete("/api/teams/:id", deleteTeam)

  .patch("/api/players/:id", replacePlayer)

  // this is our catch all endpoint.
  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "This is obviously not what you are looking for.",
    });
  })

  // Node spins up our server and sets it to listen on port 8000.
  .listen(8000, () => console.log(`Listening on port 8000`));
