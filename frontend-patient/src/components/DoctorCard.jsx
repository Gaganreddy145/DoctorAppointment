import react from "react";
import '../components/DoctorList.css';

const DoctorCard = ({ name, specialty,doctorImage }) => {
  return (
    <div className="doctor-card">
      <img src={`http://localhost:3000/${doctorImage}`} alt={name} className="doctor-image" />
      <div className="doctor-info">
        <span className="status">● Available</span>
        <h3>{name}</h3>
        <p>{specialty}</p>
      </div>
    </div>
  );
};

export default DoctorCard;