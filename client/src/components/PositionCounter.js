import styled from "styled-components";

const PositionCounter = ({ positionCounts }) => {
  return (
    <Wrapper>
      <P>Goalkeepers: {positionCounts.G}</P>
      <P>Defenders: {positionCounts.D}</P>
      <P>Midfielders: {positionCounts.M}</P>
      <P>Forwards: {positionCounts.F}</P>
    </Wrapper>
  );
};

export default PositionCounter;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  margin: 20px 5px;
`;

const P = styled.p`
  font-family: "Exo 2", sans-serif;
  margin: 5px;
`;
