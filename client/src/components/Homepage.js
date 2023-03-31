import React, { useEffect, useState } from "react";

const Homepage = () => {
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch("/api/leagues")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data);
        setLeagues(data.data);
      })

      .catch((error) => console.error(error));

    fetch("/api/countries?ids=3,4,5")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data);
        setCountries(data.data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      {leagues.map((league) => (
        <p key={league.id}>{league.name}</p>
      ))}
      {countries.map((country) => (
        <div key={country.id}>
          <img src={country.img} alt={country.name} />
          <p>{country.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Homepage;
