import React from "react";
import "../styles.css";
import { json, useLoaderData } from "react-router-dom";
import { getAuthToken } from "../util/auth";

function DoctorsList() {
  const data = useLoaderData();
  return (
    <div className="doctor">
      <h1>All Doctors</h1>
      <div className="doctor-container">
        {data && data.message && <p>{data.message}</p>}
        {data && data.doctors && (
          <ul>
            {data.doctors.map((item) => {
              const { did, image, dname, speciality, isavail } = item;
              return (
                <li key={did}>
                  <div className="doctor-card">
                    <img
                      src={`http://localhost:3000/${image}`}
                      alt={`${dname} image`}
                      className="doctor-image"
                    />
                    <p className="doctor-name">{dname}</p>
                    <p className="doctor-specialty">{speciality}</p>
                    <div className="availability">
                      <input type="checkbox" checked disabled /> Available
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export const loader = async () => {
  const token = getAuthToken();
  const response = await fetch("http://localhost:3000/all-doctors", {
    method: "GET",
    headers: {
      'Authorization': token,
    },
  });

  if (!response.ok) {
    throw json({ message: "Unable to load" }, { status: 401 });
  }

  if (
    response.status === 500 ||
    response.status === 403 ||
    response.status === 401
  ) {
    return response;
  }

  return response;
};

export default DoctorsList;
