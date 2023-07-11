import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import API from "./API";
import Sidebar from "./Sidebar";
import { UserContext } from "./UserContext";

function AirplanePage() {
  const { airplaneId } = useParams();

  /* the airplane info */
  const [airplane, setAirplane] = useState(undefined);

  /* array of seats selected by the user */
  const [selected, setSelected] = useState([]);

  /* array of seats no longer available at the moment of submit */
  const [occupied, setOccupied] = useState([]);

  const [errors, setErrors] = useState([]);
  const [irreversibleErrors, setIrreversibleErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* switch between manual and automatic selection */
  const [manual, setManual] = useState(false);

  /* number of seats requested automatically */
  const [nRequested, setNRequested] = useState(0);

  /* check if the user already made a reservation for the airplane */
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const user = useContext(UserContext);

  useEffect(() => {
    loadData();
  }, []);

  /* submit the selected seats and reload data */
  function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    API.makeReservations(airplaneId, selected)
      .then(() => {
        loadData();
      })
      .catch((res) => {
        if (res.occupiedSeats) setOccupied(res.occupiedSeats);
        setErrors((e) => e.concat(res.errors));
      })
      .finally(() => {
        setLoading(false);
        setSelected([]);
        setTimeout(() => setOccupied([]), 5000);
        setNRequested(0);
      });
  }

  /* fetch airplane info
   * and if the user is logged in check they already made a reservation
   */
  function loadData() {
    API.fetchAirplaneInfo(airplaneId)
      .then((airplaneInfo) => {
        setAirplane(airplaneInfo);
        if (user.isLoggedIn) {
          API.fetchUserReservations()
            .then((userReservations) => {
              if (userReservations.some((r) => r.airplaneId == airplaneId))
                setReservationSuccess(true);
            })
            .catch((errs) => setIrreversibleErrors((e) => e.concat(errs)));
        }
      })
      .catch((errs) => setIrreversibleErrors((e) => e.concat(errs)))
      .finally(() => setLoading(false));
  }

  /* callback attached to the cancel button */
  function handleReset() {
    setSelected([]);
    setNRequested(0);
  }

  function deselectSeat(rowNumber, seatNumber) {
    setSelected((sel) =>
      sel.filter((e) => e.rowNumber != rowNumber || e.seatNumber != seatNumber)
    );
  }

  function selectSeat(rowNumber, seatNumber) {
    setSelected((sel) => sel.concat({ rowNumber, seatNumber }));
  }

  /* switch between manual and automatic selection */
  function switchManual() {
    setManual((m) => !m);
    setNRequested(0);
    setSelected([]);
  }

  /* callback attached to the number form input */
  function handleRequested(value) {
    const msg = "Not enough seats available";
    setSelected([]);

    if (value == "") {
      setNRequested(value);
      return;
    }

    let n = parseInt(value);
    if (Number.isInteger(n)) {
      if (n < 0) n = 0;
      setNRequested(n);
      if (!autoSelect(n))
        setErrors((errs) => errs.filter((e) => e != msg).concat(msg));
    }
  }

  /* automatically selectSeat the first n seats available */
  function autoSelect(n) {
    let result = [];
    for (let r = 1; r <= airplane.nRows; r++) {
      for (let s = 1; s <= airplane.seatsPerRow; s++) {
        if (
          !airplane.reservedSeats.some(
            (res) => res.rowNumber == r && res.seatNumber == s
          )
        ) {
          if (result.length < n) result.push({ rowNumber: r, seatNumber: s });
          else break;
        }
      }
    }
    if (result.length < n) return false;

    setSelected(result);
    return true;
  }

  function showContent() {
    if (loading) {
      return (
        <Spinner animation="border" role="status" className="mt-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
    } else if (irreversibleErrors.length != 0) {
      return irreversibleErrors.map((err) => (
        <Alert key={err} variant="danger">
          {err}
        </Alert>
      ));
    } else {
      return (
        <>
          {
            /* notify the user they successfully made a reservation for the plane */
            reservationSuccess && (
              <Alert variant="success" className="my-1">
                You successfully made a reservation for this airplane
              </Alert>
            )
          }
          {
            /* show reversible errors */
            errors.length !== 0 && (
              <Row className="py-4 px-4 mt-3 shadow-sm rounded-4 bg-white">
                {errors.map((err) => (
                  <Alert
                    key={err}
                    variant="danger"
                    className="my-1"
                    onClose={() =>
                      setErrors((errs) => errs.filter((m) => m != err))
                    }
                    dismissible
                  >
                    {err}
                  </Alert>
                ))}
              </Row>
            )
          }
          <Form onSubmit={handleSubmit} noValidate>
            <Row className="py-4 mt-3 mb-3 shadow-sm rounded-4 bg-white">
              <Row className="display-6 ms-3 mb-3">
                {airplane.type.charAt(0).toUpperCase() + airplane.type.slice(1)}
              </Row>
              {
                /* form controls only authenticated users can see */
                user.isLoggedIn && (
                  <>
                    <Row className="fs-5 ms-2 my-3">
                      <Col>
                        <Form.Group>
                          <Form.Label>Automatic seats selection</Form.Label>
                          <Form.Control
                            type="number"
                            value={nRequested}
                            disabled={manual}
                            onChange={(ev) => handleRequested(ev.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Row className="mt-2 d-flex justify-content-center">
                          <Button
                            variant="info"
                            type="submit"
                            disabled={selected.length === 0}
                            className="w-50 fw-semibold text-white"
                          >
                            Submit
                          </Button>
                        </Row>
                        <Row className="mt-2 d-flex justify-content-center">
                          <Button
                            variant="secondary"
                            type="button"
                            disabled={selected.length === 0}
                            className="w-50 fw-semibold"
                            onClick={handleReset}
                          >
                            Cancel
                          </Button>
                        </Row>
                      </Col>
                    </Row>
                    <Row className="fs-5 ms-3 my-3">
                      <Form.Check
                        checked={manual}
                        type="switch"
                        label="Manual seats selection"
                        onChange={switchManual}
                      />
                    </Row>
                  </>
                )
              }
              <SeatsLayout
                disabled={!manual}
                airplane={airplane}
                selected={selected}
                occupied={occupied}
                deselectSeat={deselectSeat}
                selectSeat={selectSeat}
                handleSubmit={handleSubmit}
              />
            </Row>
          </Form>
        </>
      );
    }
  }

  return (
    <Container className="w-75 mt-4">
      <Row>
        <Col md={4}>
          <Sidebar
            total={airplane && airplane.nRows * airplane.seatsPerRow}
            nSelected={selected.length}
            nUnavailable={airplane && airplane.reservedSeats.length}
            nOccupied={occupied.length}
          />
        </Col>
        <Col md={8} className={loading && "d-flex justify-content-center"}>
          {showContent()}
        </Col>
      </Row>
    </Container>
  );
}

function SeatsLayout(props) {
  const airplane = props.airplane;

  return (
    <Row>
      {[Math.floor(airplane.nRows / 2), Math.ceil(airplane.nRows / 2)].map(
        (n, c) => {
          return (
            <Col md={6} key={c}>
              {[...Array(n)].map((_, i) => {
                return (
                  <Row key={i} className="justify-content-md-center">
                    {[...Array(airplane.seatsPerRow)].map((_, s) => (
                      <Col key={s} md={2}>
                        <SeatButton
                          disabled={props.disabled}
                          rowNumber={
                            i +
                            1 +
                            (c == 1 ? Math.floor(airplane.nRows / 2) : 0)
                          }
                          seatNumber={s + 1}
                          unavailable={airplane.reservedSeats}
                          selected={props.selected}
                          occupied={props.occupied}
                          deselectSeat={props.deselectSeat}
                          selectSeat={props.selectSeat}
                        />
                      </Col>
                    ))}
                  </Row>
                );
              })}
            </Col>
          );
        }
      )}
    </Row>
  );
}

function SeatButton(props) {
  const rowNumber = props.rowNumber;
  const seatNumber = props.seatNumber;

  const buttonClass = "my-2 w-100 p-2 fw-semibold";
  const isIncluded = (r) =>
    r.rowNumber == rowNumber && r.seatNumber == seatNumber;

  function selectButton() {
    if (props.unavailable.some(isIncluded)) {
      return { variant: "secondary", onClick: () => {} };
    } else if (props.selected.some(isIncluded)) {
      return {
        variant: "warning",
        onClick: () => props.deselectSeat(rowNumber, seatNumber),
      };
    } else if (props.occupied.some(isIncluded)) {
      return { variant: "danger", onClick: () => {} };
    } else {
      return {
        variant: "success",
        onClick: () => props.selectSeat(rowNumber, seatNumber),
      };
    }
  }
  return (
    <Button
      type="button"
      variant={selectButton().variant}
      size="sm"
      disabled={props.disabled}
      className={buttonClass}
      onClick={selectButton().onClick}
    >
      {rowNumber}
      {String.fromCharCode("A".charCodeAt(0) + seatNumber - 1)}
    </Button>
  );
}

export default AirplanePage;