import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  CellStyleModule,
  ValidationModule
} from 'ag-grid-community';
import '../../App.css';
import LoadingScreen from '../../BookLoader';
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage"; 

// Register necessary modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  CellStyleModule,
  ValidationModule,
]);
const config = require('../../ApiConfig');

const VendorProductTable = () => {
  const [role_id, setRole_id] = useState("");
  const [role_name, setRole_name] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState("");
  const roleid = useRef(null);
  const rolename = useRef(null);
  const Description = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  const modified_by = sessionStorage.getItem("selectedUserCode");

  const clearInputFields = () => {
    setRole_id("");
    setRole_name("");
    setDescription("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setRole_id(selectedRow.role_id || "");
      setRole_name(selectedRow.role_name || "");
      setDescription(selectedRow.description || "");
    }
    else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  const handleInsert = async () => {
    if (
      !role_id ||
      !role_name
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addRoleInfoData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          role_id,
          role_name,
          description,
          created_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/Role');
  };

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {
      if (hasValueChanged) {
        await handleKeyDownStatus(e);
        setHasValueChanged(false);
      }

      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const handleUpdate = async () => {
    if (
      !role_id ||
      !role_name
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/RoleUpdates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          role_id,
          role_name,
          description,
          created_by,
          modified_by,
        }),
      });
      if (response.status === 200) {
        console.log("Data Updated successfully");
        setIsUpdated(true);
        clearInputFields();
        toast.success("Data Updated successfully!")
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error Update data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-fluid ">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3 rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Role' : 'Add Role'}</h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='col-md-12 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' onClick={handleClick} title="Close" style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !role_id ? 'text-danger' : ''}`}>Role ID<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required
              title="please enter the role ID"
              value={role_id}
              onChange={(e) => setRole_id(e.target.value)}
              maxLength={18}
              ref={roleid}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, rolename, roleid)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !role_name ? 'text-danger' : ''}`}>Role Name<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="please enter the role name"
              value={role_name}
              onChange={(e) => setRole_name(e.target.value)}
              maxLength={50}
              ref={rolename}
              onKeyDown={(e) => handleKeyDown(e, Description, rolename)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Description</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="please enter the description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
              ref={Description}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (mode === "create") {
                    handleInsert();
                  } else {
                    handleUpdate();
                  }
                }
              }}
            />
          </div>
          {/* <div className="col-md-3 mb-2">
            {mode === "create" ? (
              <>
                <label className='fw-bold'>Created By</label>
                <input
                  type="text"
                  className="form-control"
                  value={created_by}
                />
              </>
            ) : (
              <>
                <label className='fw-bold'>Modified By</label>
                <input
                  type="text"
                  className="form-control"
                  value={modified_by}
                />
              </>
            )}
          </div> */}
          <div className="col-md-2 mb-2 mt-4">
            {mode === "create" ? (
              <button className="btn btn-primary" onClick={handleInsert} title="Submit">
                Submit
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleUpdate} title="Update">
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;
