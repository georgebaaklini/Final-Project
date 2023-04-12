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

const addAllPlayers = async (req, res) => {
  const { name } = req.params;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("finalproject");
    const playersCollection = db.collection("players");

    const query = name
      ? { name: { $regex: new RegExp(`^${name}$`, "i") } }
      : {};
    const players = await playersCollection.find(query).toArray();
    res.status(200).json({ status: 200, data: players });
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
};

const replacePlayer = async (req, res) => {
  const { id } = req.params;
  const { newPlayer } = req.body;
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("finalproject");
    const teamsCollection = db.collection("teams");

    const team = await teamsCollection.findOne({ _id: new ObjectId(id) });

    if (team) {
      const updatedPlayers = team.players.map((player) => {
        if (player.id === newPlayer.id) {
          return newPlayer;
        }
        return player;
      });

      await teamsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { players: updatedPlayers } }
      );

      res.status(200).json({ message: "Player replaced successfully" });
    } else {
      res.status(404).json({ message: "Team not found" });
    }
  } catch (error) {
    console.error(error);
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
  replacePlayer,
  addAllPlayers,
};
