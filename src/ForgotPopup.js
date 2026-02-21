import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const config = require('./ApiConfig')

const ForgotPasswordModal = ({ open, handleClose }) => {
  const [email_id, setemail_id] = useState('');
  const [user_code, setuser_code] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [new_password, setNew_Password] = useState('');
  const [loginError, setLoginError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${config.apiBaseUrl}/forgetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_id, user_code }),
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        setLoginError("User doesn't exist. Register as a new user");
      }
    } catch (error) {
      console.error('Error:', error.message);
      setLoginError("Internal server error occurred!");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${config.apiBaseUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_id, enteredOtp }),
      });

      if (response.ok) {
        console.log('OTP verified successfully');
        setPassword(true);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        setOtpError("Invalid OTP");
      }
    } catch (error) {
      console.error('Error:', error.message);
      setOtpError("Internal server error occurred!");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword === new_password) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/passwords`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email_id, user_password: new_password, user_code }),
        });
        if (response.ok) {
          handleClose();
          toast.success("Password updated successfully")
          console.log('Password updated successfully');
        } else {

          toast.error("Error updating password")
          console.log('Error updating password');
        }
      } catch (error) {

        toast.error("Error updating password")
        console.log('Error updating password');
      }
    } else {
      setOtpError('Wrong Otp');
      toast.error("Wrong Otp")
    }
  };

  return (
    <div className={`modal fade show ${open ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content shadow rounded-4">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold text-primary">🔐 Verification</h5>
            <button type="button" className="btn-close" onClick={handleClose} title='Close'/>
          </div>
          <div className="modal-body p-4">
            <div className="d-flex flex-column align-items-center">
              {password ? (
                <>
                  <div className="form-group w-100 mb-3 position-relative">
                    <label className='fw-bold text-dark'>Enter New Password</label>
                    <input
                      id="newPassword"
                      className="form-control pe-5"
                      title='Please enter the new password'
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        top: '65%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#888',
                      }}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <div className="form-group w-100 mb-3 position-relative">
                    <label className='fw-bold text-dark'>Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      className="form-control pe-5"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={new_password}
                      title='Please enter the confirm new password'
                      onChange={(e) => setNew_Password(e.target.value)}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        top: '65%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#888',
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <button className="btn btn-success w-100" onClick={handlePasswordSubmit} title='Submit'>
                    Submit <i className="bi bi-arrow-right-circle ms-2" />
                  </button>
                </>
              ) : otpSent ? (
                <>
                  <div className="form-group w-100 mb-3">
                    <label className='fw-bold text-dark'>Enter OTP</label>
                    <input
                      id="otp"
                      className="form-control"
                      value={enteredOtp}
                      title='Please enter the otp'
                      onChange={(e) => setEnteredOtp(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-success w-100" onClick={handleOtpSubmit} title='Submit'>
                    Submit <i className="bi bi-arrow-right-circle ms-2" />
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group w-100 mb-3">
                    <label className='fw-bold text-dark'>User Code</label>
                    <input
                      className="form-control"
                      type="text"
                      value={user_code}
                      title='Please enter the user code'
                      onChange={(e) => setuser_code(e.target.value)}
                    />
                  </div>
                  <div className="form-group w-100 mb-3">
                    <label className='fw-bold text-dark'>Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={email_id}
                      title='Please enter the email'
                      onChange={(e) => setemail_id(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary w-100" onClick={handleEmailSubmit} title='Verify'>
                    Verify <i className="bi bi-check-circle-fill ms-2" />
                  </button>
                </>
              )}
            </div>
            {otpError && <div className="text-danger mt-2">{otpError}</div>}
            {loginError && <div className="text-danger mt-2">{loginError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
