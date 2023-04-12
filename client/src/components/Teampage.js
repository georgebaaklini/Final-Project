import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Teampage = () => {
  const [teams, setTeams] = useState([]);
  const { user } = useAuth0();
  const [playerNames, setPlayerNames] = useState([]);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.data);
        setTeams(data.data);
      })
      .catch((error) => console.error(error));
  }, []);

  const deleteTeam = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();

        setTeams(teams.filter((team) => team._id !== teamId));
      } else {
        console.error("Failed to delete team");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const replacePlayer = async (teamId, playerName) => {
    try {
      const playerResponse = await fetch(
        `/api/players?name=${encodeURIComponent(playerName)}`
      );
      const playerData = await playerResponse.json();
      const newPlayer = playerData.data;

      if (!newPlayer) {
        console.error("Player not found");
        return;
      }

      const response = await fetch(`/api/players/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPlayer }),
      });

      if (response.ok) {
        const updatedTeams = teams.map((team) => {
          if (team._id === teamId) {
            return {
              ...team,
              players: team.players.map((player) => {
                if (player.id === newPlayer.id) {
                  return newPlayer;
                }
                return player;
              }),
            };
          }
          return team;
        });
        setTeams(updatedTeams);
      } else {
        console.error("Failed to replace player");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Teams</h2>
      {teams.map((team, index) => (
        <div key={index}>
          <h3>{team.user}'s team</h3>
          <ul>
            {team.players.map((player, idx) => (
              <div key={idx}>
                <li>
                  {player.name}{" "}
                  <img
                    src={player.image}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src =
                        "https://freesvg.org/img/defaultprofile.png";
                    }}
                    alt={player.name}
                    width={50}
                    height={50}
                  ></img>
                </li>
                {user && team.user === user.email && (
                  <div>
                    <input
                      type="text"
                      value={playerNames[idx] || ""}
                      onChange={(e) => {
                        const newPlayerNames = [...playerNames];
                        newPlayerNames[idx] = e.target.value;
                        setPlayerNames(newPlayerNames);
                      }}
                      placeholder="Enter new player name"
                    />
                    <button
                      onClick={() => replacePlayer(team._id, playerNames[idx])}
                    >
                      Replace player
                    </button>
                  </div>
                )}
              </div>
            ))}
          </ul>
          {user && team.user === user.email && (
            <button onClick={() => deleteTeam(team._id)}>Delete Team</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Teampage;
