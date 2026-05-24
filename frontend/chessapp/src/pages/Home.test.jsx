import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../App";
import HealthInput from "./HealthInput";
import Home from "./Home";

function renderApp(initialPath = "/", auth = null) {
  return render(
    <AuthContext.Provider value={{ auth, logout: jest.fn() }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health-input" element={<HealthInput />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

test("shows a blank health prompt on the home dashboard", () => {
  renderApp("/", null);

  fireEvent.click(screen.getByRole("button", { name: /start monitoring/i }));

  expect(
    screen.getByText(/your health data is blank by default/i)
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /set your health profile/i })).toHaveAttribute(
    "href",
    "/health-input"
  );
});

test("saves a health profile from the health input page", () => {
  localStorage.clear();

  render(
    <AuthContext.Provider
      value={{ auth: { email: "user@example.com" }, logout: jest.fn() }}
    >
      <MemoryRouter initialEntries={["/health-input"]}>
        <Routes>
          <Route path="/health-input" element={<HealthInput />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

  fireEvent.change(screen.getByLabelText(/height/i), { target: { value: "175" } });
  fireEvent.change(screen.getByLabelText(/weight/i), { target: { value: "70" } });
  fireEvent.change(screen.getByLabelText(/usual bedtime/i), { target: { value: "02:00" } });
  fireEvent.change(screen.getByLabelText(/playtime limit/i), { target: { value: "90" } });

  fireEvent.click(screen.getByRole("button", { name: /save health profile/i }));

  const storedProfile = JSON.parse(
    localStorage.getItem("chessapp_health_profile_user@example.com")
  );

  expect(storedProfile.height).toBe(175);
  expect(storedProfile.weight).toBe(70);
  expect(storedProfile.sleepTime).toBe("02:00");
  expect(storedProfile.playtimeLimitMinutes).toBe(90);
  expect(storedProfile.hydrated).toBe(false);
});
