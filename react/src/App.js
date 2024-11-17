// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyBridgeLogin from "./MyBridgeLogin";
import BiddingSystem from "./BiddingSystem";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyBridgeLogin />} />
        <Route path="/bidding" element={<BiddingSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
