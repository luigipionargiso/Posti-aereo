import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Stack, Modal, Alert, Navbar, Image } from "react-bootstrap";
import { UserContext } from "./UserContext";

function Header() {
  const navigate = useNavigate();
  return (
    <Navbar bg="light" className="shadow-sm">
      <Container>
        <Navbar.Brand onClick={() => navigate("/")} className="mx-auto">
          <Image src="/logo.png" className="w-50 mx-auto d-block" />
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

function NotFoundPage() {
  return (
    <Container className="w-50 mt-5 py-4 shadow-sm rounded-4 bg-white">
      <Stack className="text-center">
        <i className="bi bi-exclamation-triangle fs-1" />
        <h1 className="display-5">The page cannot be found</h1>
        <p className="fw-semibold">
          The requested page does not exist, please head back to the{" "}
          <Link to={"/"}>home page</Link>.
        </p>
      </Stack>
    </Container>
  );
}

function UserErrorsModal() {
  const user = useContext(UserContext);
  return (
    <Modal
      size="lg"
      centered
      show={user.errors.length !== 0}
      onHide={() => user.setErrors([])}
    >
      <Modal.Header closeButton>
        <Modal.Title>Errors during authentication</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user.errors.map((msg) => (
          <Alert
            key={msg}
            variant="danger"
            onClose={() => user.setErrors((e) => e.filter((m) => m != msg))}
            dismissible
            className="mt-3"
          >
            {msg}
          </Alert>
        ))}
      </Modal.Body>
    </Modal>
  );
}

export { NotFoundPage, UserErrorsModal, Header };
