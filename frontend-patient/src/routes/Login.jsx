import React from "react";
import { Form ,redirect,Link, useActionData} from "react-router-dom";
function Login() {
    const data = useActionData();
  return (
      <div>
      {data && data.message && <p>{data.message}</p>}
      <Form method="post">
        <input type="email" name="email" required />
        <input type="password" name="password" required />
        <button type="submit">Submit</button>
      </Form>
      <div>
        <Link to="/register">Create a account</Link>
      </div>
    </div>
  );
}

export const postLoginAction = async ({ request }) => {
  const data = await request.formData();
  const credentials = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const response = await fetch("http://localhost:3000/login-patient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (response.status === 401 || response.status === 500) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: "Unable to Login" }, { status: 401 });
  }

  const result = await response.json();
  const token = result.token;

  localStorage.setItem("token-patient", token);
  return redirect("/");
};

export default Login;
