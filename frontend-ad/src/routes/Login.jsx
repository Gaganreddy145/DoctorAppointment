import React from "react";
import "../styles.css";
import { Form, json, redirect, useActionData } from "react-router-dom";
import { getAuthToken } from "../util/auth";

function Login() {
  const data = useActionData();
  return (
    <div className="login">
      <div className="login-container">
        <h2>
          <span>Admin</span> Login
        </h2>
        {data && data.message && <p>{data.message}</p>}
        <Form method="post">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="admin@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            required
          />

          <button type="submit">Login</button>
        </Form>
        <p>
          Doctor Login? <a href="#">Click here</a>
        </p>
      </div>
    </div>
  );
}

export const checkLoginLoader = () => {
  const tk = getAuthToken();
  if (tk) return redirect("/admin");
  return null;
}

export const action = async ({ request }) => {
 
  const data = await request.formData();
  const loginData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  if (response.status === 401 || response.status === 500) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: "Unable to Login" }, { status: 401 });
  }

  const result = await response.json();
  const token = result.token;

  localStorage.setItem("token", token);
  return redirect("/admin");
};

export default Login;
