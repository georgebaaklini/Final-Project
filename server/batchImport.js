const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;
const { API_TOKEN } = process.env;

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const premierLeagueSquadIds = [
  1, 3, 4, 5, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 262, 265, 271, 274,
];

const championshipSquadIds = [
  2, 6, 7, 11, 253, 254, 255, 256, 257, 260, 263, 264, 266, 269, 270, 272, 273,
  275, 279, 293, 304, 322,
];

const leagueOneSquadIds = [
  261, 264, 268, 276, 281, 282, 283, 284, 286, 289, 291, 294, 298, 311, 313,
  324, 325, 326, 327, 328,
];

const leagueTwoSquadIds = [
  278, 280, 285, 290, 292, 297, 299, 306, 309, 314, 315, 316, 321, 323, 329,
];

const bundesligaSquadIds = [
  98, 101, 111, 114, 2806, 2808, 2810, 2812, 2813, 2814, 2815, 2816, 2817, 2818,
  2819, 2849, 2860,
];

const bundesliga2SquadIds = [
  2807, 2811, 2835, 2848, 2853, 2854, 2856, 2857, 2858, 2859, 2861, 2864, 3155,
];

const laligaSquadIds = [
  99, 103, 107, 113, 116, 117, 118, 119, 122, 123, 127, 128, 129, 130, 131,
  2403, 2380, 2411,
];

const laliga2SquadIds = [
  120, 121, 124, 125, 126, 2393, 2395, 2382, 2407, 2409, 2413, 2416, 2419, 2425,
  2429, 2432, 2434,
];

const serieaSquadIds = [
  94, 102, 108, 109, 2313, 2336, 2343, 2345, 2355, 389, 390, 391, 393, 394, 397,
  398, 399, 400, 401, 403,
];

const seriebSquadIds = [
  388, 392, 395, 396, 2303, 2333, 2335, 2338, 2339, 2340, 2341, 2346, 2349,
  2351, 402, 5313, 5316, 5323,
];

const ligue1SquadIds = [
  95, 97, 112, 582, 583, 586, 587, 588, 590, 591, 592, 594, 595, 2538, 2540,
  2551, 2557, 2559, 2560,
];

const ligue2SquadIds = [
  584, 585, 589, 593, 596, 597, 2537, 2541, 2542, 2543, 2544, 2550, 2552, 2553,
  2555, 2556, 2590, 2638, 2649, 2686,
];

const eredivisieSquadIds = [80, 85, 1055, 1060, 1063, 1064];

const eerstedivisieSquadIds = [
  1056, 1057, 1058, 1059, 1062, 1065, 1066, 1067, 1069, 1070, 1071, 1072, 1073,
];

const canadianPremierLeagueSquadIds = [
  7817, 7818, 7819, 7821, 7823, 9517, 18835, 1111530845,
];

const primeiraLigaSquadIds = [
  89, 100, 2271, 2281, 2282, 2285, 2287, 2288, 2289, 2290, 2292, 2293, 2294,
  2296, 2297, 2298, 2790, 2798,
];

const mlsSquadIds = [
  3245, 3247, 3248, 3252, 3253, 3256, 3257, 3258, 3261, 3262, 3263, 3264, 3266,
  3268, 3904,
];

const superLigSquadIds = [1014];

const getSquad = async (squadId) => {
  const response = await fetch(
    `https://api.soccersapi.com/v2.2/teams/?user=george2001&token=${API_TOKEN}&t=squad&id=${squadId}`
  );
  const data = await response.json();
  return data.data.squad;
};

const addSquads = async (collectionName, squadIds) => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("finalproject");
    const squadsCollection = db.collection(collectionName);

    for (const squadId of squadIds) {
      const squad = await getSquad(squadId);
      await squadsCollection.insertOne({ squadId, squad });
      console.log("Squads added successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.close();
  }
};

(async () => {
  await addSquads("mls", mlsSquadIds);
})();
