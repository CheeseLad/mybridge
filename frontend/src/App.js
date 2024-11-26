// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyBridgeLogin from "./MyBridgeLogin";
import BiddingSystem from "./BiddingSystem";
import Game from "./Game";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyBridgeLogin />} />
        <Route path="/bidding" element={<BiddingSystem />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
