
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import { getUserHealthProfile, saveUserHealthProfile } from "../auth";
import heroImg from "../assets/chess-bg.png";
import "../App.css";

const formatTime = (value) => {
  if (!value) {
    return "—";
  }

  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12) + 1;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const computeBmi = (height, weight) => {
  if (!height || !weight) {
    return null;
  }

  return Number(((weight / ((height / 100) ** 2)) || 0).toFixed(1));
};

const getRestLevel = (profile) => {
  if (!profile) {
    return "Set up your health profile";
  }

  return profile.sleepTime
    ? `Aim to sleep by ${formatTime(profile.sleepTime)}`
    : "Set your bedtime to get a rest recommendation";
};

const getPlayRecommendation = (profile) => {
  if (!profile) {
    return "Complete your health profile to get play and sleep guidance.";
  }

  const stopTime = new Date(Date.now() + profile.playtimeLimitMinutes * 60000);
  const stopLabel = `${String(stopTime.getHours()).padStart(2, "0")}:${String(
    stopTime.getMinutes()
  ).padStart(2, "0")}`;

  return `Stop playing around ${formatTime(stopLabel)} and aim to go to sleep by ${formatTime(
    profile.sleepTime
  )}.`;
};

function Home() {
  const { auth } = useContext(AuthContext);
  const [monitoringStarted, setMonitoringStarted] = useState(false);
  const [healthProfile, setHealthProfile] = useState(null);
  const playtimeAlertSent = useRef(false);

  useEffect(() => {
    if (!auth?.email) {
      setHealthProfile(null);
      playtimeAlertSent.current = false;
      return;
    }

    setHealthProfile(getUserHealthProfile(auth.email));
  }, [auth]);

  useEffect(() => {
    if (!monitoringStarted || !healthProfile?.playtimeLimitMinutes) {
      playtimeAlertSent.current = false;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (playtimeAlertSent.current) {
        return;
      }

      playtimeAlertSent.current = true;
      window.dispatchEvent(
        new CustomEvent("app-notification", {
          detail: {
            title: "Playtime limit reached",
            content: `You have reached your ${healthProfile.playtimeLimitMinutes}-minute playtime limit. Take a break and hydrate.`,
          },
        })
      );
    }, healthProfile.playtimeLimitMinutes * 60000);

    return () => window.clearTimeout(timeoutId);
  }, [healthProfile?.playtimeLimitMinutes, monitoringStarted]);

  const handleHydrate = () => {
    if (!auth?.email || !healthProfile) {
      return;
    }

    const updatedProfile = {
      ...healthProfile,
      hydrated: true,
    };

    saveUserHealthProfile(auth.email, updatedProfile);
    setHealthProfile(updatedProfile);
  };

  const bmi = computeBmi(healthProfile?.height, healthProfile?.weight);
  const hydrationLabel = healthProfile?.hydrated ? "Hydrated" : "Unhydrated";
  const restLevel = getRestLevel(healthProfile);

  return (
    <main className="app" style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="hero-content">
        <p className="eyebrow">Chess Performance Assistant</p>
        <h1>Track your environment. Improve your game.</h1>

        <button className="start-btn" onClick={() => setMonitoringStarted(true)}>
          Start Monitoring
        </button>
      </div>

      {monitoringStarted && (
        <section id="track" className="dashboard">
          <h2>Live Metrics</h2>

          <div className="cards-grid">
            <div className="metric-card">
              <span>Temperature</span>
              <strong>22°C</strong>
              <p>Optimal playing condition</p>
            </div>

            <div className="metric-card">
              <span>CO2 Level</span>
              <strong>820 ppm</strong>
              <p>Room air quality is stable</p>
            </div>

            <div className="metric-card">
              <span>Light Level</span>
              <strong>74%</strong>
              <p>Good visibility for focus</p>
            </div>

            <div className="metric-card">
              <span>Focus Score</span>
              <strong>86%</strong>
              <p>Ready for a strong session</p>
            </div>
          </div>

          <div className="session-card">
            <div>
              <p className="eyebrow">Current Session</p>
              <h2>Session Performance</h2>
              <p>Tracking your chess performance during this play session.</p>
            </div>

            <div className="session-stats">
              <div>
                <span>Games</span>
                <strong>5</strong>
              </div>
              <div>
                <span>Wins</span>
                <strong>3</strong>
              </div>
              <div>
                <span>Losses</span>
                <strong>2</strong>
              </div>
              <div>
                <span>Win Rate</span>
                <strong>60%</strong>
              </div>
            </div>
          </div>

          <div className="health-summary">
            <div className="health-summary-header">
              <div>
                <p className="eyebrow">Physical stats</p>
                <h2>Health Overview</h2>
              </div>
              <Link to="/health-input" className="start-btn health-inline-btn">
                Set your health profile
              </Link>
            </div>

            {!healthProfile ? (
              <div className="health-empty-state">
                <p>
                  Your health data is blank by default. Add your height, weight,
                  bedtime, and playtime limit to get personalized guidance.
                </p>
              </div>
            ) : (
              <>
                <div className="health-summary-grid">
                  <article className="health-stat-card">
                    <p className="eyebrow">BMI</p>
                    <strong className="health-stat-value">
                      {bmi !== null ? `${bmi} kg/m²` : "—"}
                    </strong>
                    <p>
                      {bmi !== null
                        ? "Your BMI is calculated from your saved height and weight."
                        : "Add your height and weight to calculate BMI."}
                    </p>
                  </article>

                  <article className="health-stat-card">
                    <p className="eyebrow">Hydration</p>
                    <strong className="health-stat-value">{hydrationLabel}</strong>
                    <p>
                      {healthProfile.hydrated
                        ? "Hydration is marked as complete."
                        : "Tap hydrate after drinking water to update your status."}
                    </p>
                    <button
                      type="button"
                      className="health-action-btn"
                      onClick={handleHydrate}
                      disabled={healthProfile.hydrated}
                    >
                      {healthProfile.hydrated ? "Hydrated" : "Hydrate"}
                    </button>
                  </article>

                  <article className="health-stat-card">
                    <p className="eyebrow">Rest level</p>
                    <strong className="health-stat-value">{restLevel}</strong>
                    <p>
                      Use your saved bedtime to keep your rest balance steady and
                      avoid overplaying.
                    </p>
                  </article>
                </div>

                <div className="health-recommendations">
                  <p className="eyebrow">Recommendations</p>
                  <p>{getPlayRecommendation(healthProfile)}</p>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;