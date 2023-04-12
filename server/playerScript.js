const { MongoClient, ObjectId } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const leagueCollections = [
  "2.bundesliga",
  "bundesliga",
  "canadianpremierleague",
  "championship",
  "eerstedivisie",
  "eredivisie",
  "laliga",
  "laliga2",
  "leagueone",
  "leaguetwo",
  "ligue1",
  "ligue2",
  "mls",
  "premierleague",
  "primeiraliga",
  "seriea",
  "serieb",
  "superlig",
];
const client = new MongoClient(MONGO_URI, options);

const mergeCollections = async () => {
  try {
    await client.connect();
    const db = client.db("finalproject");

    for (const leagueCollection of leagueCollections) {
      const collection = db.collection(leagueCollection);

      await collection
        .aggregate([
          {
            $merge: {
              into: "players",
              whenMatched: "merge",
              whenNotMatched: "insert",
            },
          },
        ])
        .toArray();
    }
    console.log("Merging completed");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};

mergeCollections();
