import { useState } from "react";
import "../App.css";
import heroImg from "../assets/chess-bg.png";

const isChesscomUsername = (value) => {
  return /^[A-Za-z0-9_-]+$/.test(value);
};

const parsePgn = (content) => {
  const tags = {};
  const tagRegex = /\[([A-Za-z0-9_]+)\s+"([^"\\]*(?:\\.[^"\\]*)*)"\]/g;
  let match;

  while ((match = tagRegex.exec(content))) {
    tags[match[1]] = match[2];
  }

  const body = content
    .replace(/\[(?:.|\n)*?\]/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/;[^\n]*/g, "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = body
    .split(" ")
    .filter(
      (token) =>
        token &&
        !/^\d+\.+$/.test(token) &&
        !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)
    );

  const result = tags.Result || "Unknown";
  const moves = tokens.filter(
    (token) => !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)
  );
  const fullMoveCount = Math.ceil(moves.length / 2);
  const halfMoveCount = moves.length;

  const white = tags.White || "Unknown";
  const black = tags.Black || "Unknown";
  const opening = tags.Opening || tags.ECO || tags.Event || moves.slice(0, 6).join(" ");

  return {
    headers: tags,
    moves,
    fullMoveCount,
    halfMoveCount,
    result,
    white,
    black,
    opening,
  };
};

const openingLookupMap = {
  A00: "Uncommon Opening",
  A10: "English Opening",
  A20: "English Opening",
  A30: "English Opening",
  A40: "Queen's Pawn Game",
  A45: "Trompowsky Attack",
  A46: "Queen's Pawn Game",
  A48: "King's Indian Attack",
  A50: "Queen's Pawn Opening",
  A55: "Torre Attack",
  A60: "Benoni Defense",
  A70: "Benoni Defense",
  A80: "Dutch Defense",
  A90: "Dutch Defense",
  B00: "King's Pawn Opening",
  B01: "Scandinavian Defense",
  B07: "Pirc Defense",
  B10: "Caro-Kann Defense",
  B20: "Sicilian Defense",
  B30: "Sicilian Defense",
  B40: "Sicilian Defense",
  B50: "Sicilian Defense",
  B60: "Sicilian Defense",
  B70: "Sicilian Defense",
  B80: "Sicilian Defense",
  B90: "Sicilian Defense",
  C00: "French Defense",
  C10: "French Defense",
  C20: "King's Pawn Game",
  C30: "Spanish Opening",
  C40: "King's Knight Opening",
  C50: "Italian Game",
  C60: "Ruy Lopez",
  C70: "Ruy Lopez",
  C80: "Ruy Lopez",
  C90: "Ruy Lopez",
  D00: "Queen's Pawn Game",
  D10: "Slav Defense",
  D20: "Queen's Gambit",
  D30: "Queen's Gambit Declined",
  D40: "Queen's Gambit Declined",
  D50: "Queen's Gambit Declined",
  D60: "Queen's Gambit Declined",
  D70: "Neo-Grünfeld Defense",
  D80: "Grünfeld Defense",
  D90: "Grünfeld Defense",
  E00: "Catalan Opening",
  E10: "Catalan Opening",
  E20: "Nimzo-Indian Defense",
  E30: "Nimzo-Indian Defense",
  E40: "Nimzo-Indian Defense",
  E50: "Nimzo-Indian Defense",
  E60: "King's Indian Defense",
  E70: "King's Indian Defense",
  E80: "King's Indian Defense",
  E90: "King's Indian Defense",
};

const fetchOpeningName = async (eco) => {
  if (!eco) {
    return null;
  }

  const code = eco.toUpperCase();
  const prefix2 = code.slice(0, 2);
  const prefix1 = code.slice(0, 1);

  try {
    const response = await fetch(`https://api.chess.com/pub/eco/${code}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.name) {
        return data.name;
      }
    }
  } catch {
    // ignore network issues
  }

  return openingLookupMap[code] || openingLookupMap[prefix2] || openingLookupMap[prefix1] || null;
};

const fetchPlayerStats = async (username) => {
  if (!username || !isChesscomUsername(username)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.chess.com/pub/player/${username.toLowerCase()}/stats`
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
};

function ChessAnalysis() {
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzePgn = async (rawText) => {
    setError("");
    setLoading(true);
    setAnalysis(null);

    try {
      const parsed = parsePgn(rawText);
      const stats = {
        white: null,
        black: null,
      };

      if (isChesscomUsername(parsed.white)) {
        stats.white = await fetchPlayerStats(parsed.white);
      }
      if (isChesscomUsername(parsed.black)) {
        stats.black = await fetchPlayerStats(parsed.black);
      }

      const openingName =
        parsed.headers.Opening ||
        (parsed.headers.ECO ? await fetchOpeningName(parsed.headers.ECO) : null) ||
        parsed.opening ||
        "Unknown opening";

      setAnalysis({ ...parsed, stats, openingName });
    } catch (err) {
      setError("Failed to parse PGN file. Please verify the file contents and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pgn")) {
      setError("Please select a .pgn file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result || "";
      setFileName(file.name);
      analyzePgn(text);
    };
    reader.onerror = () => {
      setError("Unable to read the PGN file. Please try a different file.");
    };
    reader.readAsText(file);
  };

  return (
    <main className="app analysis-page" style={{ backgroundImage: `url(${heroImg})` }}>
      <section className="analysis-hero">
        <p className="eyebrow">Chess.com PGN Analysis</p>
        <h1>Upload your PGN and get quick game insights</h1>
        <p>
          Select a .pgn file from your computer. The page parses your game and
          enriches it with Chess.com player stats when available.
        </p>

        <div className="analysis-form">
          <label className="file-upload-label">
            Choose PGN file
            <input
              type="file"
              accept=".pgn"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>

          {fileName && <p className="file-name">Loaded: {fileName}</p>}

          {error && <div className="analysis-error">{error}</div>}
          {loading && <div className="analysis-loading">Analyzing your game…</div>}
        </div>
      </section>

      {analysis && (
        <section className="analysis-results">
          <div className="analysis-grid">
            <article className="analysis-card">
              <p className="eyebrow">Game summary</p>
              <strong>{analysis.headers.Event || "Custom PGN Game"}</strong>
              <p>
                {analysis.white} vs {analysis.black}
              </p>
              <p>Result: {analysis.result}</p>
              <p>Opening: {analysis.openingName}</p>
              <p>Move count: {analysis.fullMoveCount} full moves</p>
              {analysis.headers.Date && <p>Date: {analysis.headers.Date}</p>}
            </article>

            <article className="analysis-card">
              <p className="eyebrow">Chess.com player stats</p>
              <div className="analysis-player">
                <span>White: {analysis.white}</span>
                <strong>
                  {analysis.headers.WhiteElo || "N/A"} Elo
                </strong>
                <p>
                  {analysis.stats.white
                    ? `Rapid: ${analysis.stats.white.chess_rapid?.last?.rating ?? "N/A"}, Blitz: ${analysis.stats.white.chess_blitz?.last?.rating ?? "N/A"}`
                    : isChesscomUsername(analysis.white)
                    ? "Public Chess.com stats were not found."
                    : "White name is not a valid Chess.com username."}
                </p>
              </div>
              <div className="analysis-player">
                <span>Black: {analysis.black}</span>
                <strong>
                  {analysis.headers.BlackElo || "N/A"} Elo
                </strong>
                <p>
                  {analysis.stats.black
                    ? `Rapid: ${analysis.stats.black.chess_rapid?.last?.rating ?? "N/A"}, Blitz: ${analysis.stats.black.chess_blitz?.last?.rating ?? "N/A"}`
                    : isChesscomUsername(analysis.black)
                    ? "Public Chess.com stats were not found."
                    : "Black name is not a valid Chess.com username."}
                </p>
              </div>
            </article>
          </div>

          <article className="analysis-card">
            <p className="eyebrow">PGN details</p>
            <p>Event: {analysis.headers.Event || "Unknown"}</p>
            <p>Site: {analysis.headers.Site || "Unknown"}</p>
            <p>Date: {analysis.headers.Date || "Unknown"}</p>
            <p>Round: {analysis.headers.Round || "Unknown"}</p>
            <p>Time control: {analysis.headers.TimeControl || "Unknown"}</p>
            <p>Result: {analysis.result}</p>
          </article>
        </section>
      )}
    </main>
  );
}

export default ChessAnalysis;
