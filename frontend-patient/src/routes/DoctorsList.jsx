// DoctorList.jsx
import React from "react";
import "../components/DoctorList.css";
import DoctorCard from "../components/DoctorCard";
import { json, useLoaderData, Link } from "react-router-dom";

const DoctorList = () => {
  const data = useLoaderData();

  return (
    <div className="doctor-list">
     
      <div className="doctor-list-content">
        <aside className="specialty-filters">
          <button>General physician</button>
          <button>Gynecologist</button>
          <button>Dermatologist</button>
          <button>Pediatricians</button>
          <button>Neurologist</button>
          <button>Gastroenterologist</button>
        </aside>
        {data && data.message && <p>{data.message}</p>}
        <section className="doctors">
          {data &&
            data.map((item) => {
              const { did, dname, speciality, image } = item;
              return (
                <Link to={`/doctors-list/${did}`} key={did}>
                  <DoctorCard
                    name={dname}
                    specialty={speciality}
                    doctorImage={image}
                  />
                </Link>
              );
            })}
        </section>
      </div>
    </div>
  );
};

export const loader = async () => {
  const response = await fetch("http://localhost:3000/available-doctors");
  if (!response.ok) {
    throw json({ message: "Unable to fetch the doctors" }, { status: 404 });
  }

  if (response.status === 500) return response;

  return response;
};

export default DoctorList;
