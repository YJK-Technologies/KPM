import React, { useState } from 'react';
import './Login.css';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from './Images/Kp_bg.png'
import LoadingScreen from './BookLoader';
import ForgotPopup from './ForgotPopup';
import { ToastContainer } from 'react-toastify';
import secureLocalStorage from "react-secure-storage"; 

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [user_code, setuser_code] = useState('');
  const [user_password, setuser_password] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);

  const secretKey = 'yjk26012024';
  const navigate = useNavigate();
  const config = require("./ApiConfig");

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
  };

  const UserPermission = async (role_id) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getUserPermission`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_id }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("permissions", JSON.stringify(data));
        window.dispatchEvent(new Event("permissionsUpdated"));
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to fetch user permissions.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred in permission check.');
    }
  };

  const handleSave = (data) => {
    if (data) {
      sessionStorage.setItem('selectedCompanyCode', data.company_no);
      sessionStorage.setItem('selectedCompanyName', data.company_name);
      sessionStorage.setItem('selectedLocationCode', data.location_no);
      sessionStorage.setItem('selectedLocationName', data.location_name);
      sessionStorage.setItem('selectedShortName', data.short_name);
      sessionStorage.setItem('selectedUserName', data.user_name);
      sessionStorage.setItem('selectedUserCode', data.user_code);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getusercompany`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_code })
      });

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          handleSave(searchData[0]);
          navigate('/Dashboard');
        } else {
          setErrorMessage("User data not found.");
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to fetch user company.');
      }
    } catch (error) {
      setErrorMessage("Error fetching user data: " + error.message);
    }
  };

  const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const encryptedUserCode = CryptoJS.AES.encrypt(user_code, secretKey).toString();
      const encryptedPassword = CryptoJS.AES.encrypt(user_password, secretKey).toString();

      const response = await fetch(`${config.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_code: encryptedUserCode,
          user_password: encryptedPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const [{ user_code, role_id, user_images }] = data;

        if (user_images && user_images.data) {
          const userImageBase64 = arrayBufferToBase64(user_images.data);
          sessionStorage.setItem('user_image', userImageBase64);
        }

        sessionStorage.setItem('isLoggedIn', true);
        sessionStorage.setItem('user_code', user_code);
        sessionStorage.setItem('role_id', role_id);

        await UserPermission(role_id);
        await fetchUserData(user_code);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed.");
      }
    } catch (error) {
      setErrorMessage('Internal server error occurred!');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="d-flex container-fluid justify-content-center align-items-center"
      style={{
        minHeight: '80vh',
      }}>
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div
        className=" shadow-lg p-5"
        style={{
          height: '500px',
          width: '400px',
          // backgroundColor: '#1e1f26',
          backgroundColor: 'black',
          color: 'white',
        }}
      >
        <div className="text-center mb-4">
          <img
            src={Logo}
            alt="Logo"
            style={{ width: '100px', height: '100px' }}
          />
          <h4
            style={{
              fontFamily: 'Gluon Light',
              color: 'gold',
              marginTop: '10px',
            }}
          >
            KANAKKUPUTHAGAM
          </h4>
        </div>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              required
              title='Please enter the user code'
              className="form-control custom-input"
              placeholder="Usercode"
              value={user_code}
              onChange={(e) => setuser_code(e.target.value)}
            />
          </div>
          <div className="mb-3 position-relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              className="form-control custom-input"
              placeholder="Password"
              title='Please enter the password'
              value={user_password}
              onChange={(e) => setuser_password(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#888',
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="mb-3">
            <a
              className='justify-content-end'
              onClick={handleClick}
              style={{
                color: '#ff4d4d',
                textDecoration: 'underline',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: '#d4af37',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            LOGIN
          </button>
          <ForgotPopup open={open} handleClose={handleClose} />
        </form>
      </div>
    </div>
  );
};

export default App;
