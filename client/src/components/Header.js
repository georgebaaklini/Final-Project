import { GiSoccerBall } from "react-icons/gi";
import styled from "styled-components";
import SignInButton from "./Signin";
import LogoutButton from "./Logout";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <div>
      <Nav>
        <NavList>
          <List>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Home
            </Link>
          </List>
          <List>
            <Link
              to="/teams"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Teams
            </Link>
          </List>
        </NavList>
        <GiSoccerBall size="48" color="white" />
        <H1>Perfect Eleven</H1>
        <GiSoccerBall size="48" color="white" />
        {isAuthenticated ? (
          <>
            <Greeting>Welcome, {user.name || user.email}! </Greeting>
            <LogoutButton />
          </>
        ) : (
          <SignInButton />
        )}
      </Nav>
    </div>
  );
};

const NavList = styled.ul`
  list-style: none;
  display: flex;
  position: absolute;
  left: 0px;
`;

const List = styled.li`
  margin-right: 50px;
  font-family: "Exo 2", sans-serif;
  color: white;
`;

const Greeting = styled.p`
  position: absolute;
  right: 120px;
  font-family: "Exo 2", sans-serif;
  color: white;
`;

const Nav = styled.div`
  background-color: rgb(0, 102, 204);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const H1 = styled.h1`
  font-family: "Exo 2", sans-serif;
  font-weight: 700;
  color: white;
  margin: 15px 10px;
`;

export default Header;
