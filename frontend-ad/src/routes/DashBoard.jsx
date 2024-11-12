import React from "react";
import { getAuthToken } from "../util/auth";
import { json, useLoaderData, useNavigate } from "react-router-dom";
// import '../Dashboard.css';

const Dashboard = () => {
  const data = useLoaderData();

  const navigate = useNavigate();
  const handleCancel = async (id) => {
    const token = getAuthToken();
    try {
      const response = await fetch(
        "http://localhost:3000/cancel-byadmin/" + id,
        {
          method: "PUT",
          headers: {
            Authorization: token,
          },
        }
      );

      const resData = await response.json();
      if (!response.ok) {
        //
      }

      navigate("/admin");
    } catch (error) {
      console.log(error);
    }
  };
  
  return (
    <div className="dashboard">
      <main className="main-content">
        <div className="stats">
          <div className="stat-item">
            {data && data.doctors_count && data.doctors_count} Doctors
          </div>
          <div className="stat-item">
            {data && data.app_count && data.app_count} Appointments
          </div>
          <div className="stat-item">
            {data && data.patient_count && data.patient_count} Patients
          </div>
        </div>

        <section className="latest-bookings">
          <h2>Latest Bookings</h2>
          {data && data.latestAppointments && (
            <ul>
              {data.latestAppointments.map((appointment) => {
                const { app_id, dname, app_date, action } = appointment;
                return (
                  <li className="booking-item" key={app_id}>
                    <span className="doctor-name">{dname}</span>
                    <span className="booking-date">Booking on {app_date}</span>
                    {action === "cancelled" && (
                      <span className="status cancelled">{action}</span>
                    )}
                    {action === "request" && (
                      <button onClick={() => handleCancel(app_id)}>
                        Cancel?
                      </button>
                    )}
                  </li>
                );
              })}

              {/* <li className="booking-item">
                <span className="doctor-name">Dr. Christopher Davis</span>
                <span className="booking-date">Booking on 23 Sep 2024</span>
                <span className="status pending">Pending</span>
              </li>
              <li className="booking-item">
                <span className="doctor-name">Dr. Richard James</span>
                <span className="booking-date">Booking on 25 Sep 2024</span>
                <span className="status completed">Completed</span>
              </li>
              <li className="booking-item">
                <span className="doctor-name">Dr. Emily Larson</span>
                <span className="booking-date">Booking on 22 Sep 2024</span>
                <span className="status completed">Completed</span>
              </li> */}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export const fetchLoader = async () => {
  const token = getAuthToken();

  const response = await fetch("http://localhost:3000/count", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw json({ message: "Unable to fetch" }, { status: 500 });
  }

  return response;
};

export default Dashboard;
