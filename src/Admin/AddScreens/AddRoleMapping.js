import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
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
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import '../../App.css';
import LoadingScreen from '../../BookLoader';
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
  const [user_code, setuser_code] = useState("");
  const [role_id, setrole_id] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [usercodedrop, setusercodedrop] = useState([]);
  const [roleiddrop, setroleiddrop] = useState([]);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const usercode = useRef(null);
  const roleid = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const navigate = useNavigate();

  const [isUpdated, setIsUpdated] = useState(false);
  const [keyfield, setKeyfield] = useState('');
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  console.log(selectedRow);

  const clearInputFields = () => {
    setSelectedUser("");
    setSelectedRole("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setKeyfield(selectedRow.keyfield || "");
      setSelectedUser({
        label: selectedRow.user_code,
        value: selectedRow.user_code,
      });
      setSelectedRole({
        label: selectedRow.role_id,
        value: selectedRow.role_id,
      });

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/usercode`)
      .then((data) => data.json())
      .then((val) => setusercodedrop(val));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/roleid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setroleiddrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionUser = usercodedrop.map((option) => ({
    value: option.user_code,
    label: `${option.user_code} - ${option.user_name}`,
  }));

  const filteredOptionRole = roleiddrop.map((option) => ({
    value: option.role_id,
    label: `${option.role_id} - ${option.role_name}`,
  }));

  const handleChangeUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setuser_code(selectedUser ? selectedUser.value : '');
  };

  const handleChangeRole = (selectedRole) => {
    setSelectedRole(selectedRole);
    setrole_id(selectedRole ? selectedRole.value : '');
  };

  const handleInsert = async () => {
    if (
      !user_code ||
      !role_id
    ) {
      toast.warning("Error: Missing required fields");
      setError(" ");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addUserRoleMappingData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          user_code,
          role_id,
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
    navigate('/RoleMapping');
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
    if (!selectedUser || !selectedRole) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/RoleMappingUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          user_code: selectedUser.value,
          role_id: selectedRole.value,
          modified_by,
          keyfield
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
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Role Mapping' : 'Add Role Mapping'}</h4> </div>
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
            <label className={`fw-bold ${error && !selectedUser ? 'text-danger' : ''}`}>User Code<span className="text-danger">*</span></label>
            <div title="Please select the user code">
            <Select
              value={selectedUser}
              onChange={handleChangeUser}
              options={filteredOptionUser}
              className=""
              placeholder=""
              classNamePrefix="react-select"
              maxLength={18}
              ref={usercode}
              onKeyDown={(e) => handleKeyDown(e, roleid, usercode)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedRole ? 'text-danger' : ''}`}>Role ID<span className="text-danger">*</span></label>
            <div title="Please select the role id">
            <Select
              value={selectedRole}
              onChange={handleChangeRole}
              options={filteredOptionRole}
              className=""
              placeholder=""
              classNamePrefix="react-select"
              maxLength={18}
              ref={roleid}
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
          </div>
          {/* <div className="col-md-3 mb-2">
            {mode === "create" ? (
              <>
                <label className='fw-bold'>Created By</label>
                <input
                  type='text'
                  className='form-control'
                  value={created_by}
                />
              </>
            ) : (
              <>
                <label className='fw-bold'>Modified By</label>
                <input
                  type='text'
                  className='form-control'
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
