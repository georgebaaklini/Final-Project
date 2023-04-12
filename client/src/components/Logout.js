import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styled from "styled-components";

const LogoutButton = () => {
  const { isAuthenticated, logout } = useAuth0();
  return (
    isAuthenticated && (
      <Logout onClick={() => logout({ returnTo: window.location.origin })}>
        Logout
      </Logout>
    )
  );
};

export default LogoutButton;

const Logout = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  font-family: "Exo 2", sans-serif;
  font-weight: 700;
  padding: 5px 15px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  position: absolute;
  right: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;
