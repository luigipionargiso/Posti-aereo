import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Modal,
  Alert,
} from "react-bootstrap";
import API from "./API";
import Sidebar from "./Sidebar";

function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState({});

  useEffect(() => {
    API.fetchUserReservations()
      .then((reservations) => {
        setReservations(reservations);
      })
      .catch((errs) => setErrors((e) => e.concat(errs)))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete() {
    setLoading(true);
    API.deleteReservations(toBeDeleted.airplaneId)
      .then(() => API.fetchUserReservations())
      .then((reservations) => setReservations(reservations))
      .catch((errs) => setErrors((e) => e.concat(errs)))
      .finally(() => {
        setLoading(false);
        setToBeDeleted({});
      });
  }

  function showContent() {
    if (loading) {
      return (
        <Spinner animation="border" role="status" className="mt-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
    } else if (errors.length !== 0) {
      return errors.map((err) => (
        <Alert key={err} variant="danger">
          {err}
        </Alert>
      ));
    } else {
      return (
        <>
          <h1 className="display-5">Your reservations</h1>
          {reservations.length == 0 ? (
            <h5 className="text-secondary">Nothing to see here...</h5>
          ) : (
            reservations.map((r) => (
              <ReservationEntry
                key={r.airplaneId}
                reservation={r}
                setShowModal={setShowModal}
                setToBeDeleted={setToBeDeleted}
              />
            ))
          )}
        </>
      );
    }
  }

  return (
    <>
      <ConfirmModal
        showModal={showModal}
        setShowModal={setShowModal}
        toBeDeleted={toBeDeleted}
        handleDelete={handleDelete}
      />
      <Container className="w-75 mt-4">
        <Row>
          <Col md={4}>
            <Sidebar />
          </Col>
          <Col md={8} className={loading && "d-flex justify-content-center"}>
            {showContent()}
          </Col>
        </Row>
      </Container>
    </>
  );
}

function ReservationEntry(props) {
  const r = props.reservation;

  return (
    <Row className="py-4 mt-4 mb-3 shadow-sm rounded-4 bg-white">
      <Row className="display-6 ms-3">
        {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
      </Row>
      <Row>
        <Container className="bg-body-secondary rounded-3 ms-2 me-1 mt-3 mb-1 p-3">
          {r.reservedSeats.map((s) => (
            <Button
              key={s.id}
              variant="info"
              size="sm"
              className="text-white fw-semibold me-1 mt-1"
            >
              {s.rowNumber}
              {String.fromCharCode("A".charCodeAt(0) + s.seatNumber - 1)}
            </Button>
          ))}
          <Button
            variant="outline-danger"
            className="float-end"
            onClick={() => {
              props.setToBeDeleted(r);
              props.setShowModal(true);
            }}
          >
            <i className="bi bi-trash3"></i>
          </Button>
        </Container>
      </Row>
    </Row>
  );
}

function ConfirmModal(props) {
  return (
    <Modal
      show={props.showModal}
      size="lg"
      onHide={() => props.setShowModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Are you sure you want to delete the following reservation?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="fw-semibold fs-5">
        {props.toBeDeleted.type &&
          props.toBeDeleted.type.charAt(0).toUpperCase() +
            props.toBeDeleted.type.slice(1)}
        <br />
        {props.toBeDeleted.reservedSeats &&
          props.toBeDeleted.reservedSeats.length}{" "}
        seats
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.setShowModal(false)}>
          No, go back
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            props.handleDelete();
            props.setShowModal(false);
          }}
        >
          Yes, delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ReservationsPage;
