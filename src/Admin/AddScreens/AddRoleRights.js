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
  const [screensdrop, setscreensdrop] = useState([]);
  const [permissionsdrop, setpermissionsdrop] = useState([]);
  const [screen_type, setscreen_type] = useState("");
  const [permission_type, setpermission_type] = useState("");
  const [selectedscreens, setselectedscreens] = useState('');
  const [selectedpermissions, setselectedpermissions] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState("");
  const permissiontype = useRef(null);
  const screentype = useRef(null);
  const roleId = useRef(null);
  const [role_id, setrole_id] = useState("");
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [roleiddrop, setroleiddrop] = useState([]);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);  
  const [isUpdated, setIsUpdated] = useState(false);
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const location = useLocation();
  const [keyfield, setKeyfield] = useState('');
  const { mode, selectedRow } = location.state || {};
  
  // console.log(selectedRow);
  const handleClick = () => {
    navigate('/RoleRights');
  };

  const clearInputFields = () => {
    setselectedpermissions("");
    setSelectedRole("");
    setselectedscreens("")
  };

  useEffect(() => {
      if (mode === "update" && selectedRow && !isUpdated) {
        setKeyfield(selectedRow.keyfield || "");
        setselectedpermissions({
          label: selectedRow.permission_type,
          value: selectedRow.permission_type,
        });
        setpermission_type(selectedRow.permission_type);
        setSelectedRole({
          label: selectedRow.role_id,
          value: selectedRow.role_id,
        });
        setrole_id(selectedRow.role_id);
        setselectedscreens({
          label: selectedRow.screen_type,
          value: selectedRow.screen_type,
        });
        setscreen_type(selectedRow.screen_type);
      } else if (mode === "create") {
        clearInputFields();
      }
    }, [mode, selectedRow, isUpdated]);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/Screens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setscreensdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionscreens = screensdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangescreens = (selectedscreens) => {
    setselectedscreens(selectedscreens);
    setscreen_type(selectedscreens ? selectedscreens.value : '');
  };

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/Permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setpermissionsdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionPermissions = permissionsdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangePermissions = (selectedpermissions) => {
    setselectedpermissions(selectedpermissions);
    setpermission_type(selectedpermissions ? selectedpermissions.value : '');
  };

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

  const filteredOptionRole = roleiddrop.map((option) => ({
    value: option.role_id,
    label: `${option.role_id} - ${option.role_name}`,
  }));

  const handleChangeRole = (selectedRole) => {
    setSelectedRole(selectedRole);
    setrole_id(selectedRole ? selectedRole.value : '');
  };

  const handleInsert = async () => {
    if (
      !role_id,
      !screen_type,
      !permission_type
    ) {
      setError(" ");
       toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/adduserscreenmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          role_id,
          screen_type,
          permission_type,
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

  const handleUpdate = async () => {
    if (
      !selectedRole ||
      !selectedscreens ||
      !selectedpermissions
    ) {
      setError(" ");
       toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/updateRoleRights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          role_id,
          screen_type,
          permission_type,
          modified_by: sessionStorage.getItem('selectedUserCode'),
          keyfield
        }),
      });
      if (response.status === 200) {
        console.log("Data updated successfully");
        setTimeout(() => {
          toast.success("Data updated successfully!", {
            onClose: () => clearInputFields(),
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

  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Add Role Rights</h4> </div>
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
            <label className={`fw-bold ${error && !selectedRole ? 'text-danger' : ''}`}>Role ID<span className="text-danger">*</span></label>
            <div title="Please select the role id">
            <Select
              value={selectedRole}
              onChange={handleChangeRole}
              options={filteredOptionRole}
              className=""
              classNamePrefix="react-select"
              placeholder=""
              maxLength={18}
              ref={roleId}
              onKeyDown={(e) => handleKeyDown(e, screentype, roleId)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedscreens ? 'text-danger' : ''}`}>Screen Type<span className="text-danger">*</span></label>
            <div title="Please select the screen type">
            <Select
              value={selectedscreens}
              onChange={handleChangescreens}
              options={filteredOptionscreens}
              className=""
              placeholder=""
              classNamePrefix="react-select"
              ref={screentype}
              onKeyDown={(e) => handleKeyDown(e, permissiontype, screentype)}
            />
          </div>
          </div>  
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedpermissions ? 'text-danger' : ''}`}>Permission Type<span className="text-danger">*</span></label>
            <div title="Please select the permission type">
            <Select
              value={selectedpermissions}
              onChange={handleChangePermissions}
              options={filteredOptionPermissions}
              className=""
              placeholder=""
              classNamePrefix="react-select"
              ref={permissiontype}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (mode === "create") {
                    handleInsert();
                  } else {
                    handleUpdate();
                  }
                }
              }}
              // onKeyDown={(e) => handleKeyDown(e, permissiontype)}
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
