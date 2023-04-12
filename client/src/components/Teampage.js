import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";

const Teampage = () => {
  const [teams, setTeams] = useState([]);
  const { user } = useAuth0();
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetches all the teams submitted
  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        setTeams(data.data);
      })
      .catch((error) => console.error(error));
  }, []);

  // Delete team function
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

  // Replace player function
  const replacePlayer = async (team, playerToReplace) => {
    if (!selectedPlayer) {
      alert("Please select a player to replace");
      return;
    }

    if (selectedPlayer.position !== playerToReplace.position) {
      alert("Please select a player with the same position to replace");
      return;
    }

    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerIdToReplace: playerToReplace.name,
          newPlayer: selectedPlayer,
        }),
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams((prevTeams) =>
          prevTeams.map((t) => (t._id === team._id ? updatedTeam : t))
        );
        setSelectedPlayer(null);
      } else {
        console.error("Failed to replace player");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <H2>Teams</H2>
      {teams.map((team, index) => (
        <Wrapper key={index}>
          <H3>{team.user}'s team</H3>
          <PlayerList>
            {team.players.map((player, idx) => (
              <PlayerDiv key={idx}>
                <List>
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
                  />
                  <p>{player.name}</p>
                  <p>{player.position}</p>
                  {user && team.user !== user.email && (
                    <Button onClick={() => setSelectedPlayer(player)}>
                      Select Player
                    </Button>
                  )}
                </List>
                {user && team.user === user.email && (
                  <>
                    <Button onClick={() => replacePlayer(team, player)}>
                      Replace Player
                    </Button>
                  </>
                )}
              </PlayerDiv>
            ))}
          </PlayerList>
          <DeleteWrapper>
            {user && team.user === user.email && (
              <DeleteButton onClick={() => deleteTeam(team._id)}>
                Delete Team
              </DeleteButton>
            )}
          </DeleteWrapper>
        </Wrapper>
      ))}
    </div>
  );
};

export default Teampage;

const Wrapper = styled.div`
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  margin: 5px;
  font-family: "Exo 2", sans-serif;
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

const PlayerList = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const PlayerDiv = styled.div``;

const List = styled.li`
  margin: 15px;
`;

const Button = styled.button`
  background-color: rgb(0, 102, 204);
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  font-family: "Exo 2", sans-serif;
  font-weight: 700;
  padding: 5px 15px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background-color: red;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  font-family: "Exo 2", sans-serif;
  font-weight: 700;
  padding: 5px 15px;
  cursor: pointer;
`;

const DeleteWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
