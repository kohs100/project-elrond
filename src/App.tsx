import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./routes/Login";
import Logout from "./routes/Logout";
import ListTeam from "./routes/ListTeam";
import Dashboard from "./routes/Dashboard";
import Search from "./routes/Search";
import ProtectedRoute from "./routes/ProtectedRoute";

import FullMap from "./routes/FullMap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/logout" element={<Logout />} />
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/teams" element={<ListTeam />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<FullMap />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
