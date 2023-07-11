import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import API from "./API";
import HomePage from "./HomePage";
import AirplanePage from "./AirplanePage";
import ReservationsPage from "./ReservationsPage";
import LoginPage from "./LoginPage";
import { Header, NotFoundPage, UserErrorsModal } from "./Miscellaneous";
import { UserContext } from "./UserContext.js";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [errors, setErrors] = useState([]);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    // Check if the user was already logged in
    API.fetchUser()
      .then((user) => {
        setIsLoggedIn(true);
        setUserName(user.name);
      })
      .catch((errs) => {
        // Remove eventual 401 Unauthorized errors from the list, those are expected
        setErrors(errs.filter((e) => e !== "Unauthenticated user"));
      })
      .finally(() => setWaiting(false));
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <UserContext.Provider
        value={{
          isLoggedIn: isLoggedIn,
          setIsLoggedIn: setIsLoggedIn,
          userName: userName,
          setUserName: setUserName,
          errors: errors,
          setErrors: setErrors,
          waiting: waiting,
          setWaiting: setWaiting,
        }}
      >
        <UserErrorsModal />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/airplane/:airplaneId" element={<AirplanePage />} />
          <Route path="/your-reservations" element={<ReservationsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
