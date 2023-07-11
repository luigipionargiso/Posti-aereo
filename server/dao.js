"use strict";

const sqlite = require("sqlite3");

// open the database
const db = new sqlite.Database("db.sqlite", (err) => {
  if (err) throw err;
});

/**
 * Retrieve all the available airplanes
 *
 * @returns a Promise that resolves to an array
 * of airplanes object like: {id, type}
 */
function getAirplanes() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, type FROM airplanes";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const airplanes = rows.map((e) => ({
          id: e.id,
          type: e.type,
        }));
        resolve(airplanes);
      }
    });
  });
}

/**
 * Retrieve all reserved seats of the airplane
 *
 * @param airplaneId
 * @returns a Promise that resolves to an array of reservation objects like: {id, rowNumber, seatNumber}
 */
function getAirplaneReservations(airplaneId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM reservations WHERE airplaneId = ?";
    db.all(sql, [airplaneId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const reservations = rows.map((e) => ({
          id: e.id,
          rowNumber: e.rowNumber,
          seatNumber: e.seatNumber,
        }));
        resolve(reservations);
      }
    });
  });
}

/**
 * Retrieve all the available flights
 *
 * @param id
 * @returns a Promise that resolves to a airplaneInfo object like:
 * {id, type, nRows, seatsPerRow, [reservedSeats]}
 */
function getAirplaneInfo(id) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM airplanes WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row == undefined) {
        resolve(false);
      } else {
        getAirplaneReservations(id)
          .then((reservations) => {
            const airplaneInfo = {
              id: row.id,
              type: row.type,
              nRows: row.nRows,
              seatsPerRow: row.seatsPerRow,
              reservedSeats: [...reservations],
            };
            resolve(airplaneInfo);
          })
          .catch((err) => reject(err));
      }
    });
  });
}

/**
 * Add new reservations by the specified user
 *
 * @param seats array of objects like {rowNumber, seatNumber}
 * @param airplaneId airplane identifier
 * @param userId user identifier
 * @returns a Promise that resolves to nothing on success
 */
function addReservations(seats, airplaneId, userId) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO reservations(airplaneId, userId, rowNumber, seatNumber) VALUES" +
      seats
        .map((s, i, arr) => "(?, ?, ?, ?)" + (i < arr.length - 1 ? "," : ""))
        .reduce((prev, cur) => prev + cur);

    const values = seats.flatMap((e) => [
      airplaneId,
      userId,
      e.rowNumber,
      e.seatNumber,
    ]);

    db.run(sql, values, function (err) {
      if (err) {
        reject(err);
        return;
      }
    });
    resolve();
  });
}

/**
 * Delete reservations by a single user for a specific airplane
 *
 * @param airplaneId airplane identifier
 * @param userId user identifier
 * @returns a Promise that resolves to nothing on success
 */
function deleteReservations(airplaneId, userId) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM reservations WHERE airplaneId = ? AND userId = ?";
    db.run(sql, [airplaneId, userId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Retrieve all reservations by a single user
 *
 * @param userId
 * @returns a Promise that resolves to an array of reservation objects like:
 * {airplaneId, type, [reservedSeats]}
 */
function getReservationsByUser(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *, reservations.id AS reservationId, airplanes.id AS airplaneId
        FROM reservations
        JOIN airplanes ON reservations.airplaneId = airplanes.id
        WHERE userId = ?
    `;
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let result = rows.reduce((res, row) => {
          let index = res.findIndex((e) => e.airplaneId === row.airplaneId);

          // if the flight was already added just concatenate the reserved seat
          if (index !== -1) {
            res.splice(index, 1, {
              ...res[index],
              reservedSeats: res[index].reservedSeats.concat({
                id: row.reservationId,
                rowNumber: row.rowNumber,
                seatNumber: row.seatNumber,
              }),
            });
          } else {
            // otherwise add all the information
            res.push({
              airplaneId: row.airplaneId,
              type: row.type,
              reservedSeats: [
                {
                  id: row.reservationId,
                  rowNumber: row.rowNumber,
                  seatNumber: row.seatNumber,
                },
              ],
            });
          }
          return res;
        }, []);
        resolve(result);
      }
    });
  });
}

/**
 * Check if the selected seats are valid
 *
 * @param seats array of objects like {rowNumber, seatNumber}
 * @param airplaneId airplane identifier
 * @returns a Promise that resolves to a boolean that is true if seats are valid
 */
function validateSeats(seats, airplaneId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT nRows, seatsPerRow FROM airplanes WHERE id = ?";
    db.get(sql, [airplaneId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row == undefined) {
        resolve(false);
      } else {
        const res = seats.every(
          (s) =>
            s.rowNumber > 0 &&
            s.rowNumber <= row.nRows &&
            s.seatNumber > 0 &&
            s.seatNumber <= row.seatsPerRow
        );
        resolve(res);
      }
    });
  });
}

/**
 * Check if the selected seats are available
 * (seats numbers should be already validated)
 *
 * @param seats array of objects like {rowNumber, seatNumber}
 * @param airplaneId airplane identifier
 * @returns a Promise that resolves to:
 * - {available: true} if the seats are available
 * - {available: false, [occupiedSeats]} if one or more seats are occupied
 */
function checkAvailable(seats, airplaneId) {
  return new Promise((resolve, reject) => {
    let occupiedSeats = [];
    getAirplaneReservations(airplaneId)
      .then((reservations) => {
        reservations.forEach((e) => {
          if (
            seats.some(
              (s) => s.rowNumber == e.rowNumber && s.seatNumber == e.seatNumber
            )
          )
            occupiedSeats.push(e);
        });
        if (occupiedSeats.length !== 0)
          resolve({ available: false, occupiedSeats: occupiedSeats });
        else resolve({ available: true });
      })
      .catch((err) => reject(err));
  });
}

module.exports = {
  getAirplanes,
  getAirplaneReservations,
  getAirplaneInfo,
  addReservations,
  deleteReservations,
  getReservationsByUser,
  validateSeats,
  checkAvailable,
};
