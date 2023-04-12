require("dotenv").config();

const { API_TOKEN } = process.env;

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { MongoClient, ObjectId } = require("mongodb");

const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Function for getting countries from API
const getCountries = async (req, res) => {
  try {
    const countryIds = req.query.ids;
    const parsedIds = countryIds.split(",");

    // had to use for loop to slow down consecutive requests.
    let countryArr = [];

    for (const id of parsedIds) {
      const response = await fetch(
        `	https://api.soccersapi.com/v2.2/countries/?user=george2001&token=${API_TOKEN}&t=info&id=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const parsedResponse = await response.json();
      countryArr.push(parsedResponse);
    }

    return res.status(200).json({
      status: 200,
      data: countryArr.map((country) => country.data),
    });
  } catch (error) {
    console.error(error);
  }
};

// Function for getting leagues for specific country from API
const getLeaguesbyCountry = async (req, res) => {
  try {
    const { countryId } = req.query;
    const leagueInfo = await fetch(
      `https://api.soccersapi.com/v2.2/leagues/?user=george2001&token=${API_TOKEN}&t=list&country_id=${countryId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const parsedInfo = await leagueInfo.json();
    return res.status(200).json({ status: 200, data: parsedInfo.data });
  } catch (error) {
    console.error(error);
  }
};

// Function for getting squads for specific league from my mongoDB
const getSquadByLeague = async (req, res) => {
  const league = req.params.league;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("finalproject");
    const squadsCollection = db.collection(league);

    const squads = await squadsCollection.find().toArray();
    console.log(squads);
    res.status(200).json({ status: 200, data: squads });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ status: 400, message: "Error, bad request" });
  } finally {
    client.close();
  }
};

// Function to save the submitted team in my teams collection in mongoDB
const saveTeam = async (req, res) => {
  const { user, players } = req.body;
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("finalproject");
    const teamsCollection = db.collection("teams");

    const newTeam = {
      user,
      players,
    };

    await teamsCollection.insertOne(newTeam);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: "Error saving the team" });
  } finally {
    client.close();
  }
};

//Function that gets all the submitted teams from my teams collection in mongoDB
const getTeams = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("finalproject");
    const teamsCollection = db.collection("teams");

    const teams = await teamsCollection.find().toArray();
    res.status(200).json({ status: 200, data: teams });
    console.log(teams);
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
};

// Function that deletes a specific team from my teams collection in mongoDB
const deleteTeam = async (req, res) => {
  const { id } = req.params;
  const client = new MongoClient(MONGO_URI, options);
  console.log("id from params:", id);

  try {
    await client.connect();
    const db = client.db("finalproject");
    const teamsCollection = db.collection("teams");

    const result = await teamsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Team deleted successfully" });
    } else {
      res.status(404).json({ message: "Team not found" });
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};

// Function that replaces a player from the users team with another player from another users team
const replacePlayerInTeam = async (req, res) => {
  const { id } = req.params;
  const { playerIdToReplace, newPlayer } = req.body;
  const client = new MongoClient(MONGO_URI, options);

  console.log("playerIdToReplace:", playerIdToReplace);
  console.log("newPlayer:", newPlayer);

  try {
    await client.connect();
    const db = client.db("finalproject");
    const teamsCollection = db.collection("teams");

    const team = await teamsCollection.findOne({ _id: new ObjectId(id) });

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    console.log("team.players:", team.players);

    const updatedPlayers = team.players.map((player) => {
      if (player.name === playerIdToReplace) {
        return newPlayer;
      } else {
        return player;
      }
    });

    console.log("updatedPlayers:", updatedPlayers);

    await teamsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { players: updatedPlayers } }
    );

    res.status(200).json({ ...team, players: updatedPlayers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error replacing player in the team" });
  } finally {
    await client.close();
  }
};

module.exports = {
  getCountries,
  getLeaguesbyCountry,
  getSquadByLeague,
  saveTeam,
  getTeams,
  deleteTeam,
  replacePlayerInTeam,
};
