import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Homepage from "./Homepage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </Router>
  );
}

export default App;
