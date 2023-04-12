import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ReactPaginate from "react-paginate";
import PositionCounter from "./PositionCounter";
import { useAuth0 } from "@auth0/auth0-react";

const Homepage = () => {
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [squads, setSquads] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const playersPerPage = 50;
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [positionCounts, setPositionCounts] = useState({
    G: 0,
    D: 0,
    M: 0,
    F: 0,
  });

  useEffect(() => {
    fetch("/api/countries?ids=3,4,5,6,7,28,81,96,118,124")
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.data);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleCountryClick = (countryId) => {
    setSelectedCountry(countryId);
    fetch(`/api/leagues-by-country?countryId=${countryId}`)
      .then((res) => res.json())
      .then((data) => {
        setLeagues(data.data);
      })
      .catch((error) => console.error(error));
  };

  const handleLeagueClick = (leagueName) => {
    const parsedLeagueName = leagueName.toLowerCase().replace(/ /g, "");
    setSelectedLeague(parsedLeagueName);
    console.log(`Fetching squads for league: ${parsedLeagueName}`);
    fetch(`/api/squads/${parsedLeagueName}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSquads(data.data);
      })
      .catch((error) => console.error(error));
  };

  const getAllPlayers = () => {
    return squads
      .flatMap((squad) => squad.squad)
      .filter((player) =>
        player.player.common_name
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
  };
  const positionRules = {
    G: 1,
    D: 4,
    M: 3,
    F: 3,
  };
  const togglePlayerSelection = (playerName, position, playerImage) => {
    const player = { name: playerName, image: playerImage };

    if (selectedPlayers.some((p) => p.name === playerName)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.name !== playerName));
      setPositionCounts({
        ...positionCounts,
        [position]: positionCounts[position] - 1,
      });
    } else if (
      selectedPlayers.length < 11 &&
      positionCounts[position] < positionRules[position]
    ) {
      setSelectedPlayers([...selectedPlayers, player]);
      setPositionCounts({
        ...positionCounts,
        [position]: positionCounts[position] + 1,
      });
    }
  };

  const { user } = useAuth0();

  const submitTeam = async () => {
    const team = {
      user: user.email,
      players: selectedPlayers,
    };

    try {
      const response = await fetch("/api/save-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(team),
      });
      if (response.ok) {
        alert("Team submitted successfully");
      } else {
        alert("Error submitting team");
      }
    } catch (error) {
      alert("Error submitting team");
    }
  };

  if (countries.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <H2>Select a country!</H2>
      <Countries>
        {countries.map((country) => (
          <DivCountries
            key={country.id}
            onClick={() => handleCountryClick(country.id)}
          >
            <p>{country.name}</p>
            <img src={country.img} alt={country.name} width={75} height={50} />
          </DivCountries>
        ))}
      </Countries>
      {selectedCountry && (
        <>
          <H3>Select a league!</H3>
          <Leagues>
            {leagues.map((league) => (
              <LeagueInfo
                key={league.id}
                onClick={() => handleLeagueClick(league.name)}
              >
                <img
                  src={league.img}
                  alt={league.name}
                  width={75}
                  height={75}
                />
                <p key={league.id}>{league.name}</p>
              </LeagueInfo>
            ))}
          </Leagues>
          {selectedLeague && (
            <>
              <DivInput>
                <Input
                  type="text"
                  placeholder="Search a player"
                  value={searchName}
                  onChange={(event) => setSearchName(event.target.value)}
                />
              </DivInput>
              <H3>
                Select 1 goalkeeper, 4 defenders, 3 midfielders and 3 forwards
              </H3>
              <PositionCounter positionCounts={positionCounts} />
              <DivSubmit>
                <SubmitButton
                  onClick={submitTeam}
                  disabled={
                    selectedPlayers.length !== 11 ||
                    !Object.entries(positionRules).every(
                      ([position, count]) => positionCounts[position] === count
                    )
                  }
                >
                  Submit team
                </SubmitButton>
              </DivSubmit>
              <Players>
                {getAllPlayers()
                  .slice(
                    currentPage * playersPerPage,
                    (currentPage + 1) * playersPerPage
                  )
                  .map((player) => (
                    <DivPlayer key={player.player.id}>
                      <PlayerInfo>
                        <img
                          src={player.player.img}
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src =
                              "https://freesvg.org/img/defaultprofile.png";
                          }}
                          alt={player.player.common_name}
                          width={100}
                          height={100}
                        />
                        <p>{player.player.common_name}</p>
                        <p>{player.position}</p>
                        <AddButton
                          onClick={() =>
                            togglePlayerSelection(
                              player.player.common_name,
                              player.position,
                              player.player.img
                            )
                          }
                        >
                          +/-
                        </AddButton>
                      </PlayerInfo>
                    </DivPlayer>
                  ))}
              </Players>
              <Pagination>
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  pageCount={Math.ceil(getAllPlayers().length / playersPerPage)}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName={"pagination"}
                  activeClassName={"active"}
                />
              </Pagination>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Homepage;

const DivSubmit = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddButton = styled.button`
  background-color: rgb(0, 102, 204);
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  font-family: "Exo 2", sans-serif;
  font-weight: 700;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
`;

const SubmitButton = styled.button`
  background-color: rgb(0, 102, 204);
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  font-family: "Exo 2", sans-serif;
  font-weight: 700;
  padding: 5px 15px;
  cursor: pointer;
  right: 50%;
  bottom: 0;
`;

const Input = styled.input`
  width: 80%;
  max-width: 400px;
  padding: 10px 20px;
  font-size: 18px;
  font-family: "Exo 2", sans-serif;
  background-color: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 7px;
  outline: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  margin-top: 60px;

  &:focus {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
`;

const DivInput = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlayerInfo = styled.div`
  margin: 5px;
  font-family: "Exo 2", sans-serif;
  font-weight: 400;
  font-size: 15px;
  position: relative;
`;

const Pagination = styled.div`
  font-family: "Exo 2", sans-serif;
  .pagination {
    display: flex;
    justify-content: center;
    padding: 1rem;
    margin: 50px;
    list-style-type: none;
  }

  .pagination a {
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    border: 1px solid #ddd;
    text-decoration: none;
    color: #000;
  }

  .pagination a:hover,
  .pagination a.active {
    background-color: #ddd;
  }
`;

const Countries = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 15px;
  justify-items: center;
  align-items: center;
  font-family: "Exo 2", sans-serif;
  font-weight: 400;
  font-size: 25px;
  text-align: center;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  margin: 0 5px;
`;

const DivPlayer = styled.div`
  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }

  transition: transform 0.3s;

  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 7px;

  width: 150px;
  height: 200px;
  margin: 20px 0;
`;

const DivCountries = styled.div`
  width: 150px;
  height: 150px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 25px 0;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 7px;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
`;

const Leagues = styled.div`
  font-family: "Exo 2", sans-serif;
  font-weight: 400;
  display: flex;
  justify-content: center;
  text-align: center;
  font-family: "Exo 2", sans-serif;
  font-weight: 400;
  font-size: 18px;
`;

const H2 = styled.h2`
  text-align: center;
  font-family: "Exo 2", sans-serif;
  font-weight: 500;
  font-size: 30px;
  color: rgb(0, 102, 204);
`;
const H3 = styled.h3`
  text-align: center;
  font-family: "Exo 2", sans-serif;
  font-weight: 500;
  font-size: 25px;
  margin-top: 40px;
  color: rgb(0, 102, 204);
`;

const LeagueInfo = styled.div`
  padding: 7px;
  margin: 5px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 7px;
  width: 125px;
  height: 160px;

  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }

  transition: transform 0.3s;
`;

const Players = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 15px;
  justify-items: center;
  align-items: center;
  text-align: center;
  margin-top: 20px;
  margin-left: 5px;
  margin-right: 5px;

  border: 2px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  padding: 15px;
`;
