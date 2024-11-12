import React from "react";
import { Form, redirect, useActionData } from "react-router-dom";
function Register() {
  const data = useActionData();
  return (
    <div>
      {data && data.message && <p>{data.message}</p>}
      <Form method="post">
        <input type="text" name="fname" required />
        <input type="email" name="email" required />
        <input type="password" name="password" required />
        <input type="text" name="phone" required />
        <textarea name="address" required />
        <input type="radio" id="male" name="gender" value="male" />
        <label htmlFor="male">Male</label>
        <input type="radio" id="female" name="gender" value="female" />
        <label htmlFor="female">Female</label>
        <input type="date" name="birthday" required />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}

export const registerPatientLoader = async ({ request }) => {
  const data = await request.formData();
  const registerData = {
    fname: data.get("fname"),
    email: data.get("email"),
    password: data.get("password"),
    phone: data.get("phone"),
    address: data.get("address"),
    gender: data.get("gender"),
    birthday: data.get("birthday"),
  };

  const response = await fetch("http://localhost:3000/register-patient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });

  if (response.status === 401 || response.status === 500) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: "Unable to Register" }, { status: 401 });
  }

  return redirect("/login");
};
export default Register;
