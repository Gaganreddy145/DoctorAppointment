// Banner.jsx
import React from 'react';
import '../Banner.css'
// import bannerImage from './banner.jpg';


const Banner = () => {
    return (
        <div className="banner">
          
            <div className="banner-content">
                <div className="banner-text">
                    <h1>Book Appointment With Trusted Doctors</h1>
                    <p>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
                    <button className="book-appointment-btn">Book appointment</button>
                </div>
                <img src="" alt="Doctors" className="banner-image" />
            </div>
        </div>
    );
};

export default Banner;
