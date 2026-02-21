import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
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
import { ToastContainer, toast } from 'react-toastify';
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
const config = require("../../ApiConfig");

const VendorProductTable = () => {
  const [user_code, setuser_code] = useState("");
  const [company_no, setcompany_no] = useState("");
  const [location_no, setlocation_no] = useState("");
  const [status, setstatus] = useState("");
  const [order_no, setorder_no] = useState();
  const [selectedRows, setSelectedRows] = useState([]);
  const [usercodedrop, setusercodedrop] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [companynodrop, setcompanynodrop] = useState([]);
  const [locationnodrop, setlocationnodrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [error, setError] = useState("");
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem("selectedUserCode");
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [isUpdated, setIsUpdated] = useState(false);
  const [keyfiels, setKeyfiels] = useState('');
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  const usercode = useRef(null);
  const companycode = useRef(null);
  const locno = useRef(null);
  const Status = useRef(null);
  const Orderno = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  console.log(selectedRow);

  const clearInputFields = () => {
    setSelectedUser("");
    setSelectedCompany("");
    setSelectedLocation("");
    setSelectedStatus("");
    setorder_no("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setorder_no(selectedRow.order_no || "");
      setKeyfiels(selectedRow.keyfiels || "");
      setSelectedUser({
        label: selectedRow.user_code,
        value: selectedRow.user_code,
      });
      setSelectedCompany({
        label: selectedRow.company_no,
        value: selectedRow.company_no,
      });
      setSelectedLocation({
        label: selectedRow.location_no,
        value: selectedRow.location_no,
      });
      setSelectedStatus({
        label: selectedRow.status,
        value: selectedRow.status,
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
    fetch(`${config.apiBaseUrl}/Companyno`)
      .then((data) => data.json())
      .then((val) => setcompanynodrop(val));
  }, []);
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/locationno`)
      .then((data) => data.json())
      .then((val) => setlocationnodrop(val));
  }, []);
  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionUser = usercodedrop.map((option) => ({
    value: option.user_code,
    label: `${option.user_code} - ${option.user_name}`,
  }));

  const filteredOptionCompany = companynodrop.map((option) => ({
    value: option.company_no,
    label: `${option.company_no} - ${option.company_name}`,
  }));

  const filteredOptionLocation = locationnodrop.map((option) => ({
    value: option.location_no,
    label: `${option.location_no} - ${option.location_name}`,
  }));

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleChangeUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setuser_code(selectedUser ? selectedUser.value : "");
  };

  const handleChangeCompany = (selectedCompany) => {
    setSelectedCompany(selectedCompany);
    setcompany_no(selectedCompany ? selectedCompany.value : "");
  };

  const handleChangeLocation = (selectedLocation) => {
    setSelectedLocation(selectedLocation);
    setlocation_no(selectedLocation ? selectedLocation.value : "");
  };

  const handleInsert = async () => {
    if (!user_code || !company_no || !location_no || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addCompanyMappingData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            user_code,
            company_no,
            location_no,
            status,
            order_no,
            created_by: sessionStorage.getItem("selectedUserCode"),
          }),
        }
      );
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(), // Reloads the page after the toast closes
          });
        }, 1000);
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      } else {
        console.error("Failed to insert data");
        toast.error('Failed to insert data');
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/CompanyMapping');
  };

  const handleKeyDown = async (
    e,
    nextFieldRef,
    value,
    hasValueChanged,
    setHasValueChanged
  ) => {
    if (e.key === "Enter") {
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
    if (e.key === "Enter" && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser || !selectedCompany || !selectedStatus || !selectedLocation) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/CompanyMappingUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          user_code: selectedUser.value,
          company_no: selectedCompany.value,
          location_no: selectedLocation.value,
          status: selectedStatus.value,
          order_no: order_no,
          modified_by,
          keyfiels
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
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Company Mapping' : 'Add Company Mapping'}</h4> </div>
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
              type="text"
              className=""
              classNamePrefix="react-select"
              value={selectedUser}
              onChange={handleChangeUser}
              options={filteredOptionUser}
              placeholder=""
              ref={usercode}
              onKeyDown={(e) =>
                handleKeyDown(e, companycode, usercode)
              }
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedCompany ? 'text-danger' : ''}`}>Company Code<span className="text-danger">*</span></label>
            <div title="Please select the company code">
            <Select
              type="text"
              className=""
              value={selectedCompany}
              onChange={handleChangeCompany}
              options={filteredOptionCompany}
              placeholder=""
              classNamePrefix="react-select"
              ref={companycode}
              onKeyDown={(e) =>
                handleKeyDown(e, locno, companycode)
              }
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedLocation ? 'text-danger' : ''}`}>Location No<span className="text-danger">*</span></label>
            <div title="Please select the location no">
            <Select
              className=""
              value={selectedLocation}
              onChange={handleChangeLocation}
              options={filteredOptionLocation}
              placeholder=""
              classNamePrefix="react-select"
              ref={locno}
              onKeyDown={(e) => handleKeyDown(e, Status, locno)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
            <div title="Please select the status">
            <Select
              type="text"
              className=""
              value={selectedStatus}
              onChange={handleChangeStatus}
              options={filteredOptionStatus}
              placeholder=""
              classNamePrefix="react-select"
              ref={Status}
              onKeyDown={(e) => handleKeyDown(e, Orderno, Status)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Order No</label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required
              title="Please enter the order number"
              value={order_no}
              onChange={(e) =>
                setorder_no(
                  e.target.value.replace(/\D/g, "").slice(0, 50)
                )
              }
              maxLength={50}
              ref={Orderno}
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
              <button onClick={handleInsert} className="btn btn-primary" title="Submit" >
                Submit
              </button>
            ) : (
              <button onClick={handleUpdate} className="btn btn-primary" title="Update" >
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
