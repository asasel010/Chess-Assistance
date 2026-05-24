import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import Home from "./pages/Home";
import ChessTrack from "./pages/ChessTrack";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HealthInput from "./pages/HealthInput";
import Header from "./components/Header";
import { clearAuth, getStoredAuth, storeAuth } from "./auth";

export const AuthContext = createContext(null);

function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getStoredAuth());
  }, []);

  const login = (token) => {
    storeAuth(token);
    setAuth(getStoredAuth());
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chesstrack" element={<ChessTrack />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/health-input" element={<HealthInput />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
