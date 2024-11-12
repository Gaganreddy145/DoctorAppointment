// DoctorBooking.jsx
import React, { useEffect, useState } from "react";
import "../DoctorBooking.css";
// import doctorImage from "./book_doctor.jpg";
import {
  json,
  redirect,
  useLoaderData,
  Form,
  useActionData,
} from "react-router-dom";
import { getAuthToken } from "../util/auth";
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DoctorBooking = () => {
  const data = useLoaderData();
  // const [selectedDay, setSelectedDay] = useState("WED");
  // const [selectedSlot, setSelectedSlot] = useState("");
  const [appointDates, setAppointDates] = useState({});
  const [onlyDates, setOnlyDates] = useState([]);
  const [active, setActive] = useState({ day: 0, time: 0 });
  const error = useActionData();
  // const days = [
  //   { day: "WED", date: 4 },
  //   { day: "THU", date: 5 },
  //   { day: "FRI", date: 6 },
  //   { day: "SAT", date: 7 },
  //   { day: "SUN", date: 8 },
  //   { day: "MON", date: 9 },
  //   { day: "TUE", date: 10 },
  // ];

  // const timeSlots = [
  //   "05:00 pm",
  //   "06:00 pm",
  //   "06:30 pm",
  //   "07:00 pm",
  //   "07:30 pm",
  //   "08:00 pm",
  //   "08:30 pm",
  // ];

  // const handleDayClick = (day) => setSelectedDay(day);
  // const handleSlotClick = (slot) => setSelectedSlot(slot);

  useEffect(() => {
    if (data && data.formattedSlots) {
      const { formattedSlots: appointments } = data;
      const appointmentsByDate = appointments.reduce((acc, appointment) => {
        const date = appointment.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment.time);
        return acc;
      }, {});
      setAppointDates(appointmentsByDate);
      const dates = Object.keys(appointmentsByDate);
      setOnlyDates(dates);
    }
  }, [data]);

  // const handleBookAppointment = () => {
  //   const selectedDate = onlyDates[active.day];
  //   const selectedTime = appointDates[selectedDate][active.time];

  //   // Call your action function with the selected date and time
  //   selectSlotAction({ date: selectedDate, time: selectedTime + ":00" });
  // };
  return (
    <div className="doctor-booking">
      {data && data.doctor && (
        <div className="doctor-profile">
          <img
            src={`http://localhost:3000/${data.doctor.image}`}
            alt={data.doctor.dname}
            className="doctor-image"
          />
          <div className="doctor-info">
            <h2>
              {data.doctor.dname} <span className="verified-badge">✔</span>
            </h2>
            <p>
              {data.doctor.degree} - {data.doctor.speciality}{" "}
              <span className="experience">{data.doctor.experience} Years</span>
            </p>
            <h3>About</h3>
            <p className="about-text">{data.doctor.about}</p>
            <p>
              <strong>Appointment fee:</strong> {data.doctor.fees}
            </p>
          </div>
        </div>
      )}
      <div className="booking-section">
        <h3>Booking slots</h3>
        {error && error.message && <p>{error.message}</p>}
        <div className="days">
          {onlyDates.map((date, index) => {
            const d = new Date(date);
            const day = DAYS[d.getDay()];
            const dt = d.getDate();
            return (
              <button
                key={day}
                className={`day ${index === active.day ? "active" : ""}`}
                onClick={() =>
                  setActive((prev) => {
                    return { ...prev, day: index };
                  })
                }
              >
                {day}
                <br />
                {dt}
              </button>
            );
          })}

          {/* {days.map(({ day, date }) => (
            <button
              key={day}
              className={`day ${selectedDay === day ? "active" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day} <br /> {date}
            </button>
          ))} */}
        </div>
        <div className="time-slots">
          {appointDates[onlyDates[active.day]]?.map((timeSlot, index) => (
            <button
              key={timeSlot}
              className={`slot ${index === active.time ? "selected" : ""}`}
              onClick={() =>
                setActive((prev) => {
                  return { ...prev, time: index };
                })
              }
            >
              {timeSlot}
            </button>
          )) || <p>No available slots</p>}

          {/* {timeSlots.map((slot) => (
            <button
              key={slot}
              className={`slot ${selectedSlot === slot ? "selected" : ""}`}
              onClick={() => handleSlotClick(slot)}
            >
              {slot}
            </button>
          ))} */}
        </div>
        <Form method="POST">
          <input
            type="hidden"
            name="date"
            value={onlyDates[active.day] || ""}
          />
          <input
            type="hidden"
            name="time"
            value={
              appointDates[onlyDates[active.day]] &&
              appointDates[onlyDates[active.day]][active.time]
                ? appointDates[onlyDates[active.day]][active.time]
                : ""
            }
          />
          <button className="book-appointment-btn">Book an appointment</button>
        </Form>
      </div>
    </div>
  );
};

export const doctorLoader = async ({ request, params }) => {
  const did = params.did;
  const token = getAuthToken();
  if (!token) return redirect("/login");
  const response = await fetch("http://localhost:3000/all-doctors/" + did, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) throw json({ message: "Unable to fetch" }, { status: 404 });

  if (response.status === 401 || response.status === 403) return response;

  return response;
};

export const selectSlotAction = async ({ request, params }) => {
  const token = getAuthToken();

  if(!token)
    return redirect("/login");

  const data = await request.formData();
  const dataToSend = {
    date: data.get("date"),
    time: data.get("time") + ":00",
    doctorId: params.did,
  };
  const response = await fetch("http://localhost:3000/book-appointment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(dataToSend),
  });

  if (!response.ok)
    throw json({ message: "Unable to book an appointment" }, { status: 500 });

  if (
    response.status === 401 ||
    response.status === 403 ||
    response.status === 500
  )
    return response;

  return redirect("/");
};

export default DoctorBooking;
