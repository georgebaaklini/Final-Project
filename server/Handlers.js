require("dotenv").config();

const { API_TOKEN } = process.env;

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const getLeagues = async (req, res) => {
  try {
    const leagueInfo = await fetch(
      `https://api.soccersapi.com/v2.2/leagues/?user=george2001&token=${API_TOKEN}&t=list`,
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

const getCountries = async (req, res) => {
  try {
    const countryIds = req.query.ids;
    const parsedIds = countryIds.split(",").map(Number);

    const countryInfo = parsedIds.map((id) =>
      fetch(
        `	https://api.soccersapi.com/v2.2/countries/?user=george2001&token=${API_TOKEN}&t=info&id=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
    const countryResponse = await Promise.all(countryInfo);
    const parsedResponse = await Promise.all(
      countryResponse.map((res) => res.json())
    );
    return res.status(200).json({
      status: 200,
      data: parsedResponse.map((country) => country.data),
    });
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getLeagues,
  getCountries,
};
