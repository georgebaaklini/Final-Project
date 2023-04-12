import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Homepage from "./Homepage";
import Teampage from "./Teampage";
import GlobalStyle from "../GlobalStyles";

function App() {
  return (
    <Router>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/teams" element={<Teampage />} />
      </Routes>
    </Router>
  );
}

export default App;
