import React from 'react';
import { FaUserCog, FaPalette, FaBell, FaRegCalendarAlt, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SettingsScreen = () => {
  const navigate = useNavigate();

  const handleNavigateToDashboard = (e) => {
    navigate("/Dashboard");
    e.preventDefault();
  };
  return (
    <div className="container-fluid bg-white rounded-5 p-5 m-4  me-5 shadow-sm">
      <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'>
            <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Settings</h4> </div>
          <div className='d-flex justify-content-end row'>
           
            <div className='col-md-5 mt-1 me-5 text-danger'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" onClick={handleNavigateToDashboard}>
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </div>
          </div>
        </div>

      {/* General Settings */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card p-4 border-0 rounded-4">
            <h5 className="mb-3 d-flex align-items-center">
              <FaUserCog className="me-2" /> General Settings
            </h5>
            <div className="mb-3 col-md-3">
              <label className="form-label">Language</label>
              <select className="form-select">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card p-4  border-0 rounded-4">
            <h5 className="mb-3 d-flex align-items-center">
              <FaPalette className="me-2" /> Preferences
            </h5>
            <div className="mb-3 col-md-3">
              <label className="form-label">Theme</label>
              <select className="form-select">
                <option value="">Select Theme</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div className="mb-3 col-md-3">
              <label className="form-label">Layout</label>
              <select className="form-select">
                <option value="">Select Layout</option>
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div className="mb-3 col-md-3">
              <label className="form-label">Refresh Rate</label>
              <select className="form-select">
                <option value="">Select Frequency</option>
                <option value="1min">Every 1 minute</option>
                <option value="5min">Every 5 minutes</option>
                <option value="manual">Manual Refresh</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card p-4  border-0 rounded-4">
            <h5 className="mb-3 d-flex align-items-center">
              <FaUserCog className="me-2" /> Profile
            </h5>
            <div className="mb-3 col-md-7">
              <label className="form-label">Bio</label>
              <textarea className="form-control" rows="3" placeholder="Write your bio here..."></textarea>
            </div>
            <div className="mb-3 col-md-3">
              <label className="form-label">Profile Picture</label>
              <input type="file" className="form-control" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card p-4  border-0 rounded-4">
            <h5 className="mb-3 d-flex align-items-center">
              <FaBell className="me-2" /> Notifications Settings
            </h5>
            <div className="mb-3 col-md-3">
              <label className="form-label">Email Notifications</label>
              <select className="form-select">
                <option value="all">All Notifications</option>
                <option value="mentions">Mentions Only</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="mb-3 col-md-3">
              <label className="form-label">Push Notifications</label>
              <select className="form-select">
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card p-4  border-0 rounded-4">
            <h5 className="mb-3 d-flex align-items-center">
              <FaRegCalendarAlt className="me-2" /> Alert Settings
            </h5>
            <div className="mb-3 col-md-3">
              <label className="form-label">Alert Frequency</label>
              <select className="form-select">
                <option value="immediate">Immediate</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="mb-3 col-md-3">
              <label className="form-label">Alert Tone</label>
              <select className="form-select">
                <option value="default">Default</option>
                <option value="chime">Chime</option>
                <option value="beep">Beep</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cookies and Cache */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card p-4  border-0 rounded-4">
            <h5 className="mb-3 d-flex align-items-center">
              <FaTrashAlt className="me-2" /> Clear Data
            </h5>
            <div className="mb-3 col-md-3">
              <button className="btn btn-danger">Clear Cookies and Cache</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsScreen;
