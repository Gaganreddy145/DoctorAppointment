import React, { useEffect, useState } from "react";
import "../AppointmentsList.css";
import { getAuthToken } from "../util/auth";
import { redirect, useLoaderData } from "react-router-dom";

const AppointmentsList = () => {
  const data = useLoaderData();
  const [appointments, setAppointments] = useState([]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setAppointments(data.appointments || []);
  }, [data]);

  const handleCancel = async (id) => {
    const updatedAppointments = appointments.filter((app) => app.app_id !== id);
    setAppointments((prev) => {
      return updatedAppointments;
    });

    const token = getAuthToken();
    setIsError(false);
    try {
      const response = await fetch("http://localhost:3000/cancel/" + id, {
        method: "PUT",
        headers: {
          Authorization: token,
        },
      });
    } catch (error) {
      setIsError(true);
      setAppointments(appointments);
    }
  };

  return (
    <div className="appointments-container">
      <h2>My appointments</h2>
      {isError && <p>An error occured!!!</p>}
      {data && data.appointments && data.appointments.length === 0 && <p>No appointments</p>}
      {data && data.appointments && data.appointments.length > 0 &&(
        <ul className="appointments-list">
          {appointments.map((appointment) => {
            const {
              app_date,
              app_time,
              dname,
              image,
              speciality,
              address,
              action,
              app_id,
            } = appointment;

            const now = new Date();
            const appointmentDateTime = new Date(`${app_date}T${app_time}`);
            const timeDifference = appointmentDateTime - now;

            return (
              <li key={app_id} className="appointment-card">
                <img
                  src={`http://localhost:3000/${image}`}
                  alt={dname}
                  className="doctor-image"
                />
                <div className="appointment-details">
                  <h3>{dname}</h3>
                  <p className="specialization">{speciality}</p>
                  <p className="address">
                    Address: <br />
                    {address}
                  </p>
                  <p className="date-time">
                    Date & Time: <span>{`${app_date} | ${app_time}`}</span>
                  </p>
                </div>
                {action === "request" && timeDifference > 7200000 && (
                  <div className="appointment-actions">
                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(app_id)}
                    >
                      Cancel appointment
                    </button>
                  </div>
                )}
                {action === "cancelled" && (
                  <div className="appointment-actions">
                    <p style={{ color: "red" }}>Cancelled</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const myAppointmentsLoader = async () => {
  const token = getAuthToken();
  if (!token) return redirect("/login");

  const response = await fetch("http://localhost:3000/my-appointments", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok)
    throw json({ message: "Unable to book an appointment" }, { status: 500 });

  if (
    response.status === 401 ||
    response.status === 403 ||
    response.status === 500
  )
    return response;

  return response;
};

export default AppointmentsList;
