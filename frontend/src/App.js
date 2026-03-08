import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddSchedule from "./pages/AddSchedule";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddSchedule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
