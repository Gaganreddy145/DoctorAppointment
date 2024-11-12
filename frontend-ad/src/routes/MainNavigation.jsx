import React from "react";
import { NavLink, Form, useRouteLoaderData } from "react-router-dom";
import "../styles.css";

function MainNavigation() {
  const token = useRouteLoaderData("admin");
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <img src="logo.png" alt="Prescripto Logo" />
          <h1>Prescripto</h1>
          <span>Dashboard Panel</span>
        </div>
        <ul className="menu">
          <li className="menu-item active">
            <NavLink to="">Dashboard</NavLink>
          </li>
          <li className="menu-item">
            <NavLink to="appointments">Appointments</NavLink>
          </li>
          <li className="menu-item">
            <NavLink to="add-doctor">Add Doctor</NavLink>
          </li>
          <li className="menu-item">
            <NavLink to="all-doctors">Doctors List</NavLink>
          </li>
        </ul>
        {token && (
          <Form action="/logout" method="post">
            <button>Logout</button>
          </Form>
        )}
      </aside>
    </div>
  );
}

export default MainNavigation;
