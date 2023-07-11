import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, ButtonGroup, Form, Alert } from "react-bootstrap";
import validator from "validator";
import API from "./API";
import { UserContext } from "./UserContext.js";

function LoginPage() {
  const [email, setEmail] = useState("user1@test.com");
  const [password, setPassword] = useState("pwd");
  const [waiting, setWaiting] = useState(false);
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();

  const userContx = useContext(UserContext);

  function doLogin(event) {
    event.preventDefault();

    setErrors([]);

    // validate form input
    let isValid = true;

    const trimmedEmail = email.trim();
    if (validator.isEmpty(trimmedEmail)) {
      isValid = false;
      setErrors((e) => e.concat("Email must not be empty"));
    } else if (!validator.isEmail(trimmedEmail)) {
      isValid = false;
      setErrors((e) => e.concat("Enter a valid email address"));
    }
    if (validator.isEmpty(password)) {
      isValid = false;
      setErrors((e) => e.concat("Password must not be empty"));
    }

    // perform login

    if (isValid) {
      setWaiting(true);
      API.login(email, password)
        .then((user) => {
          userContx.setIsLoggedIn(true);
          userContx.setUserName(user.name);
          navigate("/");
        })
        .catch((errs) => {
          setErrors((e) => e.concat(errs));
        })
        .finally(() => setWaiting(false));
    }
  }

  return (
    <Container className="w-25 pt-5">
      <Button
        variant="light"
        type="button"
        className="mb-3"
        onClick={() => navigate("/")}
      >
        <i className="bi bi-chevron-left"></i>
      </Button>
      <Form onSubmit={doLogin} noValidate>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            isInvalid={errors.some((m) => m.toLowerCase().includes("email"))}
            disabled={waiting}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            isInvalid={errors.some((m) => m.toLowerCase().includes("password"))}
            disabled={waiting}
          />
        </Form.Group>
        <ButtonGroup className="d-flex">
          <Button
            variant="info"
            type="submit"
            disabled={waiting}
            className="text-center text-white shadow-sm fw-semibold"
          >
            Login
          </Button>
        </ButtonGroup>
      </Form>
      {errors.map((msg) => (
        <Alert
          key={msg}
          variant="danger"
          onClose={() => setErrors((e) => e.filter((m) => m != msg))}
          className="mt-3"
          dismissible
        >
          {msg}
        </Alert>
      ))}
    </Container>
  );
}

export default LoginPage;
