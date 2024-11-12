import React from "react";
import "../banner.css";
import { NavLink, Form, useRouteLoaderData } from "react-router-dom";
function MainNavigation() {
  const token = useRouteLoaderData("root");
  return (
    // <header className="banner-header">
    //   <div className="logo">Prescripto</div>
    //   <nav className="banner-nav">
    //     <NavLink to="">Home</NavLink>
    //     <NavLink to="doctors-list">All Doctors</NavLink>
    //     <NavLink>About</NavLink>
    //     <NavLink>Contact</NavLink>
    //     <button className="create-account-btn">Create account</button>
    //   </nav>
    // </header>
    <>
      <NavLink to="">Home</NavLink>
      <NavLink to="doctors-list">All Doctors</NavLink>
      <NavLink>About</NavLink>
      <NavLink>Contact</NavLink>
      {!token && <NavLink to="login">Login</NavLink>}

      {token && (
        <>
          <Form method="post" action="/logout">
            <button type="submit">Logout</button>
          </Form>
          <NavLink to="/appointments">MyAppointments</NavLink>
        </>
      )}
    </>
  );
}

export default MainNavigation;
