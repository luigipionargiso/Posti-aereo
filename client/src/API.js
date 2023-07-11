/**
 * All the API calls
 */

const BASE_URL = "http://localhost:3001/api/";

async function fetchAirplanes() {
  return new Promise((resolve, reject) => {
    fetch(BASE_URL + "airplanes")
      .then((response) => {
        response
          .json()
          .then((res) => {
            if (response.ok) resolve(res);
            else reject(res.errors);
          })
          .catch(() => reject(["Failed to process server response"]));
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

async function fetchAirplaneInfo(airplaneId) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE_URL}airplanes/${airplaneId}`)
      .then((response) => {
        response
          .json()
          .then((res) => {
            if (response.ok) resolve(res);
            else reject(res.errors);
          })
          .catch(() => reject(["Failed to process server response"]));
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

async function makeReservations(airplaneId, seats) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE_URL}airplanes/${airplaneId}/reservations`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seats: seats,
      }),
    })
      .then((response) => {
        if (response.ok) resolve();
        else {
          response
            .json()
            .then((res) => {
              reject(res);
            })
            .catch(() => reject(["Failed to process server response"]));
        }
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

async function deleteReservations(airplaneId) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE_URL}airplanes/${airplaneId}/reservations`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) resolve();
        else {
          response
            .json()
            .then((res) => {
              reject(res.errors);
            })
            .catch(() => reject(["Failed to process server response"]));
        }
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

async function fetchUserReservations() {
  return new Promise((resolve, reject) => {
    fetch(BASE_URL + "reservations", {
      credentials: "include",
    })
      .then((response) => {
        response
          .json()
          .then((res) => {
            if (response.ok) resolve(res);
            else reject(res.errors);
          })
          .catch(() => reject(["Failed to process server response"]));
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

/* Authentication */

function login(email, password) {
  return new Promise((resolve, reject) => {
    fetch(BASE_URL + "sessions", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    })
      .then((response) => {
        response
          .json()
          .then((res) => {
            if (response.ok) {
              resolve(res);
            } else {
              reject(res.errors);
            }
          })
          .catch(() => reject(["Failed to process server response"]));
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

function logout() {
  return new Promise((resolve, reject) => {
    fetch(BASE_URL + "sessions/current", {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => resolve())
      .catch(() => reject(["Failed to contact the server"]));
  });
}

async function fetchUser() {
  return new Promise((resolve, reject) => {
    fetch(BASE_URL + "sessions/current", {
      credentials: "include",
    })
      .then((response) => {
        response
          .json()
          .then((res) => {
            if (response.ok) {
              resolve(res);
            } else {
              reject(res.errors);
            }
          })
          .catch(() => reject(["Failed to process server response"]));
      })
      .catch(() => reject(["Failed to contact the server"]));
  });
}

const API = {
  fetchAirplanes,
  fetchAirplaneInfo,
  makeReservations,
  deleteReservations,
  fetchUserReservations,
  login,
  logout,
  fetchUser,
};
export default API;
