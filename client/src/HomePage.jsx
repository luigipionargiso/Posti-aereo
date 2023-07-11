import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import API from "./API";
import Sidebar from "./Sidebar";

function HomePage() {
  const [airplanes, setAirplanes] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.fetchAirplanes()
      .then((airplanes) => {
        setAirplanes(airplanes);
      })
      .catch((errs) => {
        setErrors((e) => e.concat(errs));
      })
      .finally(() => setLoading(false));
  }, []);

  function showContent() {
    if (loading) {
      return (
        <Spinner animation="border" role="status" className="mt-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
    } else if (errors.length != 0) {
      return errors.map((err) => (
        <Alert key={err} variant="danger">
          {err}
        </Alert>
      ));
    } else {
      return airplanes.map((airplane) => (
        <AirplaneEntry key={airplane.id} airplane={airplane} />
      ));
    }
  }

  return (
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
  );
}

function AirplaneEntry(props) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Row
      className="py-4 my-3 shadow-sm rounded-4 bg-white"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <Col md={11}>
        <Row className="display-6 ms-3">
          {props.airplane.type.charAt(0).toUpperCase() +
            props.airplane.type.slice(1)}
        </Row>
      </Col>
      <Col md={1}>
        <Button
          type="button"
          className={"h-100 p-0 border-0 " + (hovered ? "bg-info" : "bg-white")}
          onClick={() => navigate(`/airplane/${props.airplane.id}`)}
        >
          <i
            className={
              "bi bi-chevron-compact-right fs-1 " +
              (hovered ? "text-white" : "text-muted")
            }
          ></i>
        </Button>
      </Col>
    </Row>
  );
}

export default HomePage;
