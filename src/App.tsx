import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./routes/Login";
import Logout from "./routes/Logout";
import ListTeam from "./routes/ListTeam";
import Dashboard from "./routes/Dashboard";
import Search from "./routes/Search";
import ProtectedRoute from "./routes/ProtectedRoute";

import FullMap from "./routes/FullMap";
import MainMenu from "./routes/Menu";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/logout" element={<Logout />} />
          <Route path="/" element={<MainMenu />} />
          <Route path="/search" element={<Search />} />
          <Route path="/teams" element={<ListTeam />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<FullMap />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
