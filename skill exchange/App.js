import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Login from "./components/Login";
import { useNavigate } from 'react-router-dom';

import SignUp from "./components/SignUp";
import RoleSelection from "./components/RoleSelection";
import Dashboard from "./components/Dashboard";
import OrganiserPage from "./components/OraganiserPage";
import AddVenue from "./components/AddVenue";
import VenuePage from "./components/VenuePage";
import DeleteVenue from "./components/DeleteVenue";
import ServiceDetailsPage from "./components/ServiceDetailsPage";
import AboutUsPage from "./components/AboutUsPage";
import Service from "./components/service";
import "./App.css";



const App = () => {
  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="logo">EMS</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/Service">Services</Link></li>
            <li><Link to="#contact">Contact</Link></li>
          </ul>
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/organiser" element={<OrganiserPage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/venue/add" element={<AddVenue />} />
          <Route path="/venue/view" element={<VenuePage />} />
          <Route path="/venue/delete" element={<DeleteVenue />} />
          <Route path="/dashboard/:role" element={<Dashboard />} />
          <Route path="/services/:venueId" element={<ServiceDetailsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/service" element={<Service />} />
          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const images = [
    "/images/im1.jpg",
    "/images/im11.jpg",
    "/images/im12.jpg",
    "/images/im4.jpg",
    "/images/im5.jpg",
    "/images/im6.jpg",
   
    "/images/im8.jpg",
    "/images/im9.jpg",
    
    

  ]; // Add the paths to your images here

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change background every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div id="home" style={{ backgroundImage: `url(${images[currentImageIndex]})` }}>
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to the Event Management System</h1>
          <p>Plan, organize, and manage your events seamlessly.</p>
          <Link to="/role-selection" className="primary-btn">Get Started</Link>
        </div>
      </section>
      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          At EMS (Event Management System), we are a team of passionate professionals
          dedicated to delivering outstanding events that leave a lasting impression.
          With years of experience, we specialize in planning, organizing, and executing
          events of all sizes, from intimate gatherings to large-scale corporate conferences.
        </p>
        <p>
          Our mission is to turn your vision into reality. Whether it's a product launch,
          award ceremony, wedding, or virtual event, we bring creativity, innovation,
          and meticulous planning to every project. With a wide network of vendors and
          a commitment to excellence, we ensure every detail is taken care of.
        </p>
        <p>
          We pride ourselves on our ability to offer personalized services tailored to
          your specific needs and budget. Our experienced team is here to provide
          support every step of the way, ensuring a stress-free and enjoyable experience.
        </p>
        <button className="btn-know-more" onClick={() => navigate("/about")}>
          Know More
        </button>
      </section>

      <section id="services" className="services">
        <h2>Our Services</h2>
        <ul>
          <li>Event Planning</li>
          <li>Budget Management</li>
          <li>Vendor Coordination</li>
          <li>Real-Time Analytics</li>
          <button className="btn-know-more" onClick={() => navigate("/service")}>
            See More
          </button>
        </ul>
      </section>
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Email: support@ems.com</p>
        <p>Phone: +123-456-7890</p>

        {/* Address Section */}
        <h3>Our Location:</h3>
        <p>RV College of Engineering, Mysore Road, Bangalore, Karnataka, 560059, India</p>
        {/* Google Map Embed */}
        
      </section>

    </div>
  );
};

export default App;
