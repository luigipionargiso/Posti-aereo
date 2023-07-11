import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Stack, Button } from "react-bootstrap";
import API from "./API";
import { UserContext } from "./UserContext.js";

function Sidebar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useContext(UserContext);

  function handleLogout() {
    user.setWaiting(true);
    API.logout()
      .then(() => {
        user.setIsLoggedIn(false);
        user.setUserName("");
        navigate("/");
      })
      .catch((errs) => {
        user.setErrors((e) => e.concat(errs));
      })
      .finally(() => {
        user.setWaiting(false);
      });
  }

  function showNavigationButtons() {
    if (location.pathname.includes("your-reservations")) {
      return (
        <Button
          variant="info"
          className="text-white shadow-sm fw-semibold"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      );
    } else if (location.pathname.includes("airplane")) {
      return (
        <>
          <Button
            variant="info"
            className="text-white shadow-sm fw-semibold"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
          {user.isLoggedIn && (
            <Button
              variant="info"
              className="text-white shadow-sm fw-semibold"
              onClick={() => navigate("/your-reservations")}
              disabled={user.waiting}
            >
              Your reservations
            </Button>
          )}
        </>
      );
    } else if (user.isLoggedIn) {
      return (
        <Button
          variant="info"
          className="text-white shadow-sm fw-semibold"
          onClick={() => navigate("/your-reservations")}
          disabled={user.waiting}
        >
          Your reservations
        </Button>
      );
    }
  }

  return (
    <>
      <Stack
        gap={2}
        className="w-75 p-4 my-3 shadow-sm rounded-4 bg-white text-center fs-5"
      >
        {"Hi, " + (user.isLoggedIn ? user.userName : "please login")}
        {showNavigationButtons()}
        {user.isLoggedIn ? (
          <Button
            variant="outline-secondary"
            className="shadow-sm fw-semibold"
            onClick={handleLogout}
            disabled={user.waiting}
          >
            Logout
          </Button>
        ) : (
          <Button
            variant="info"
            className="text-white shadow-sm fw-semibold"
            onClick={() => navigate("/login")}
            disabled={user.waiting}
          >
            Login
          </Button>
        )}
      </Stack>
      {props.total && (
        <SeatsInfo
          total={props.total}
          nSelected={props.nSelected}
          nUnavailable={props.nUnavailable}
          nOccupied={props.nOccupied}
        />
      )}
    </>
  );
}

function SeatsInfo(props) {
  return (
    <Stack
      gap={2}
      className="w-75 p-4 my-3 shadow-sm rounded-4 bg-white text-center fs-5"
    >
      Seats
      <Button variant="info" className="fw-semibold text-white">
        Total: {props.total}
      </Button>
      <Button variant="secondary" className="fw-semibold">
        Unavailable: {props.nUnavailable}
      </Button>
      <Button variant="warning" className="fw-semibold">
        Selected: {props.nSelected}
      </Button>
      <Button variant="success" className="fw-semibold">
        Free: {props.total - props.nUnavailable - props.nSelected}
      </Button>
      {props.nOccupied != 0 && (
        <Button variant="danger" className="fw-semibold">
          Occupied: {props.nOccupied}
        </Button>
      )}
    </Stack>
  );
}

export default Sidebar;
