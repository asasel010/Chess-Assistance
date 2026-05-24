import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../App";
import knightLogo from "../assets/knight-logo.png";

function Header() {
  const { auth, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const location = useLocation();

  const unreadCount = notifications.filter((notification) => !notification.read)
    .length;

  const markAllNotificationsAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  useEffect(() => {
    if (location.pathname !== "/" || notifications.length > 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotifications([
        {
          id: "welcome-10s",
          title: "Time alert",
          content: "You've been on the website for 10 seconds",
          read: false,
        },
      ]);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [location.pathname, notifications.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link className="nav-link" to="/">
          ChessTrack™
        </Link>
      </div>

      <div className="nav-links">
        <Link className="nav-link" to="/">
          ChessAnalysis
        </Link>

        <Link className="nav-link" to="/chesstrack">
          ChessTrack
        </Link>

        {auth ? (
          <>
            <button className="auth-button" onClick={logout}>
              Logout
            </button>
            <span className="nav-user">{`Logged in as ${auth.email}`}</span>
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

        <div className="profile-menu-container" ref={menuRef}>
          <button
            className="settings-btn notification-toggle"
            onClick={() => {
              const nextOpen = !menuOpen;
              setMenuOpen(nextOpen);

              if (nextOpen && unreadCount > 0) {
                markAllNotificationsAsRead();
              }
            }}
            type="button"
            aria-label="Open notifications"
            aria-expanded={menuOpen}
          >
            <img
              src={knightLogo}
              alt="Knight Menu"
              className="knight-icon"
            />
            {unreadCount > 0 && (
              <span
                className="notification-badge"
                aria-label={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="profile-dropdown notification-dashboard">
              <div className="notification-header">
                <div>
                  <h2>Notifications</h2>
                  <p>{unreadCount} unread</p>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="notification-empty">No notifications yet.</div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <article
                      className="notification-item"
                      key={notification.id}
                    >
                      <div className="notification-title-row">
                        <strong>{notification.title}</strong>
                        <span>Just now</span>
                      </div>
                      <p>{notification.content}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
