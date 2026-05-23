import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import knightLogo from "../assets/knight-logo.png";

function Header() {
  const { auth, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link className="nav-link" to="/">
          ChessTrack™
        </Link>
      </div>

      <div className="nav-links">
        <Link className="nav-link" to="/">
          Home
        </Link>

        <Link className="nav-link" to="/chesstrack">
          ChessTrack
        </Link>

        {auth ? (
          <>
            <span className="nav-user">{`Logged in as ${auth.email}`}</span>
            <button className="auth-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="auth-link" to="/login">
              Login
            </Link>
            <Link className="auth-link" to="/register">
              Register
            </Link>
          </>
        )}

        <div className="profile-menu-container">
          <button
            className="settings-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            <img
              src={knightLogo}
              alt="Knight Menu"
              className="knight-icon"
            />
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <button type="button">👤 My Profile</button>
              <button type="button">📈 View Sessions</button>
              <button type="button">♟️ Elo Boosting</button>
              <button type="button">⚙️ Settings</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
