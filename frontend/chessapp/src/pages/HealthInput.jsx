import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { saveUserHealthProfile } from "../auth";

function HealthInput() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sleepTime, setSleepTime] = useState("02:00");
  const [playtimeLimitMinutes, setPlaytimeLimitMinutes] = useState("90");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!auth?.email) {
      setError("Please log in to save your health profile.");
      return;
    }

    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);
    const parsedPlaytime = Number(playtimeLimitMinutes);

    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setError("Please enter a valid height in centimeters.");
      return;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Please enter a valid weight in kilograms.");
      return;
    }

    if (!Number.isFinite(parsedPlaytime) || parsedPlaytime <= 0) {
      setError("Please enter a playtime limit greater than zero.");
      return;
    }

    saveUserHealthProfile(auth.email, {
      height: parsedHeight,
      weight: parsedWeight,
      sleepTime,
      playtimeLimitMinutes: parsedPlaytime,
      hydrated: false,
      savedAt: new Date().toISOString(),
    });

    setError("");
    setSaved("Health profile saved. Redirecting to the home page...");

    window.setTimeout(() => navigate("/"), 400);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Health profile</p>
        <h1>Set up your physical stats</h1>
        <p>
          Complete your profile to unlock BMI, hydration tracking, sleep
          recommendations, and playtime reminders.
        </p>

        {!auth ? (
          <div className="health-empty-state">
            <p>Please log in to save your profile.</p>
            <Link to="/login" className="auth-submit">
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Height (cm)
              <input
                type="number"
                min="1"
                step="1"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="Example: 175"
              />
            </label>

            <label>
              Weight (kg)
              <input
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="Example: 70"
              />
            </label>

            <label>
              Usual bedtime
              <input
                type="time"
                value={sleepTime}
                onChange={(event) => setSleepTime(event.target.value)}
                min="02:00"
                max="09:00"
              />
            </label>

            <label>
              Playtime limit (minutes)
              <input
                type="number"
                min="15"
                step="5"
                value={playtimeLimitMinutes}
                onChange={(event) => setPlaytimeLimitMinutes(event.target.value)}
                placeholder="Example: 90"
              />
            </label>

            {error && <div className="auth-error">{error}</div>}
            {saved && <div className="health-success">{saved}</div>}

            <button type="submit" className="auth-submit">
              Save health profile
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default HealthInput;
