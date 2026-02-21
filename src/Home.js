import React from 'react';
import './Home.css';
import LogoFront from './Images/Logo.jpg';
import LogoBack from './Images/LogoBack.jpg';
import KpBg from './Images/Kp_bg.png';
import { useNavigate } from 'react-router-dom';

const BookCard = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/Login');
  };

  return (
    <div className="d-flex container-fluid justify-content-center align-items-center"
      style={{
        minHeight: '80vh',
      }}>
      <div className="homecard">
        <div className="homecover">
          <img src={LogoFront} alt="Logo Front" />
          <img src={LogoBack} alt="Logo Back" />
        </div>
        <div className="homecontent">
          <img src={KpBg} alt="KP Background" style={{ width: '100px', height: '100px' }} />
          <h2 className="title">KANAKKUPUTHAGAM</h2>
          <p>
          Kanakaputhakam is a lightweight ERP solution for managing inventory, sales, and purchases, offering a clean interface, real-time insights, and simplified workflows for small to mid-sized businesses.
          </p>
          <button
            type="button"
            className="btn w-100"
            onClick={handleLoginClick}
            style={{
              backgroundColor: '#d4af37',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
