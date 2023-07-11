"use strict";

const express = require("express");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const dao = require("./dao");
const { initAuthentication, isLoggedIn } = require("./auth");
const passport = require("passport");

// initialize express
const app = express();

// setup the middlewares
app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

initAuthentication(app);

/*** APIs ***/

/**
 * GET /api/airplanes
 * returns an array of objects like: {id, type}
 */
app.get("/api/airplanes", (_, res) => {
  dao
    .getAirplanes()
    .then((airplanes) => res.json(airplanes))
    .catch(() =>
      res
        .status(500)
        .json({ errors: ["Database error: cannot retrieve airplanes"] })
    );
});

/**
 * GET /api/airplanes/<id>
 * returns an object like:
 * {id, type, nRows, seatsPerRow, [reservedSeats]}
 */
app.get("/api/airplanes/:id", (req, res) => {
  dao
    .getAirplaneInfo(req.params.id)
    .then((airplaneInfo) => {
      if (!airplaneInfo)
        res.status(404).json({ errors: ["Requested airplane doesn't exist"] });
      else res.json(airplaneInfo);
    })
    .catch(() =>
      res
        .status(500)
        .json({ errors: ["Database error: cannot retrieve flight info"] })
    );
});

/**
 * POST /api/airplanes/<id>/reservations
 * make new reservations for the user for the specified airplane
 */
app.post(
  "/api/airplanes/:id/reservations",
  isLoggedIn,
  body("seats", "No seats specified").isArray({ min: 1 }),
  body("seats.*.rowNumber", "rowNumber must be a positive integer").isInt({
    min: 1,
  }),
  body("seats.*.seatNumber", "seatNumber must be a positive integer").isInt({
    min: 1,
  }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      const errMsgs = [...err.errors.map((e) => e.msg)];
      return res.status(400).json({ errors: errMsgs });
    }

    // check if seats are duplicated
    const duplicateSeats = req.body.seats.filter(
      (e, i) => req.body.seats.indexOf(e) !== i
    );
    if (duplicateSeats.length !== 0) {
      return res.status(400).json({
        errors: ["Duplicate seat(s) selected"],
        duplicateSeats: duplicateSeats,
      });
    }

    Promise.all([
      dao.getReservationsByUser(req.user.id),
      dao.validateSeats(req.body.seats, req.params.id),
      dao.checkAvailable(req.body.seats, req.params.id),
    ])
      .then((results) => {
        const userReservations = results[0];
        const validationRes = results[1];
        const availabilityRes = results[2];


        // check if user already made a reservation for the airplane
        if (userReservations.some((r) => r.airplaneId == req.params.id)) {
          return res.status(422).json({
            errors: ["User already made a reservation for the airplane"],
          });
        }

        // check if the selected seats exist
        if (!validationRes) {
          return res
            .status(422)
            .json({ errors: ["Selected seats are not valid"] });
        }

        // if seats are not available return the occupied seats
        if (!availabilityRes.available) {
          return res.status(422).json({
            errors: ["Selected seats are not available"],
            occupiedSeats: availabilityRes.occupiedSeats,
          });
        }

        //make the reservations
        dao
          .addReservations(req.body.seats, req.params.id, req.user.id)
          .then(() => res.status(201).end())
          .catch(() => res.status(500).json({ errors: ["Database error"] }));
      })
      .catch(() => res.status(500).json({ errors: ["Database error"] }));
  }
);

/**
 * DELETE /api/airplanes/<id>/reservations
 * delete all the reserved seats for the user for the specified airplane
 */
app.delete("/api/airplanes/:id/reservations", isLoggedIn, (req, res) => {
  dao
    .deleteReservations(req.params.id, req.user.id)
    .then(() => res.status(204).end())
    .catch(() =>
      res.status(500).json({
        errors: ["Database error"],
      })
    );
});

/**
 * GET /api/reservations/
 * returns an array of objects like:
 * {airplaneId, type, [reservedSeats]}
 */
app.get("/api/reservations", isLoggedIn, (req, res) => {
  dao
    .getReservationsByUser(req.user.id)
    .then((reservations) => res.json(reservations))
    .catch(() => res.status(500).json({ errors: ["Database error"] }));
});

/*** Users APIs ***/

/**
 * POST /sessions
 * authenticate
 */
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ errors: ["Wrong password and/or email"] });
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) return next(err);

      return res.json(req.user);
    });
  })(req, res, next);
});

/**
 * DELETE /sessions/current
 * logout
 */
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/**
 * GET /sessions/current
 * check whether the user is logged in or not
 */
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ errors: ["Unauthenticated user"] });
});

// start the server
const port = 3001;
app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});
