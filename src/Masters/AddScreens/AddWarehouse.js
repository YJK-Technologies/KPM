import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import {
  ModuleRegistry, ClientSideRowModelModule, PaginationModule, TextFilterModule, NumberFilterModule,
  DateFilterModule, CustomFilterModule, CellStyleModule, ValidationModule
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
const config = require("../../ApiConfig");


const VendorProductTable = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [locationnodrop, setLocationdrop] = useState([]);
  const [location_no, setlocation_no] = useState("");
  const [error, setError] = useState(false);
  const [status, setStatus] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [warehouse_code, setWarehouse_Code] = useState("");
  const [warehouse_name, setWarehouse_Name] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const created_by = sessionStorage.getItem('selectedUserCode')

  const [isUpdated, setIsUpdated] = useState(false);
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [loading, setLoading] = useState(false);

  const locatioN = useRef(null);
  const Status = useRef(null);
  const WarehouseCode = useRef(null);
  const WarehouseName = useRef(null);

  const location = useLocation();
  const locationState = location.state || {};
  const mode = locationState.mode || "create"; // ✅ default fallback
  const selectedRow = locationState.selectedRow || null;
  const warehouseCode = location.state?.warehouse_code;
  const company_code = sessionStorage.getItem('selectedCompanyCode');

  useEffect(() => {
    if (!location.state) {
      clearInputFields(); // ensure fresh create mode
    }
  }, []);

  useEffect(() => {
    if (mode === "update" && warehouseCode) {
      fetchWarehouseData();
    }
  }, [mode, warehouseCode]);

  const fetchWarehouseData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiBaseUrl}/getWarehouseData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          warehouse_code: warehouseCode,
          company_code
        }),
      });

      const data = await response.json();

      if (response.ok && data.length > 0) {
        const warehouse = data[0];

        setSelectedLocation({
          label: warehouse.location_no,
          value: warehouse.location_no,
        });
        setlocation_no(warehouse.location_no || "");
        setSelectedStatus({
          label: warehouse.status,
          value: warehouse.status,
        });
        setStatus(warehouse.status || "");
        setWarehouse_Code(warehouse.warehouse_code || "");
        setWarehouse_Name(warehouse.warehouse_name || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch warehouse details");
    } finally {
      setLoading(false);
    }
  };

  const clearInputFields = () => {
    setWarehouse_Code("");
    setWarehouse_Name("");
    setSelectedLocation("");
    setlocation_no("");
    setSelectedStatus("");
    setStatus("");
  };

  // useEffect(() => {
  //   if (mode === "update" && selectedRow && !isUpdated) {
  //     setSelectedLocation({
  //       label: selectedRow.location_no,
  //       value: selectedRow.location_no,
  //     });
  //     setlocation_no(selectedRow.location_no);
  //     setSelectedStatus({
  //       label: selectedRow.status,
  //       value: selectedRow.status,
  //     });
  //     setStatus(selectedRow.status);
  //     setWarehouse_Code(selectedRow.warehouse_code || "");
  //     setWarehouse_Name(selectedRow.warehouse_name || "");

  //   } else if (mode === "create") {
  //     clearInputFields();
  //   }
  // }, [mode, selectedRow, isUpdated]);

  const handleClick = () => {
    navigate("/warehouse", {
      state: {
        refreshGrid: true,
        // preservedRowData: location.state?.preservedRowData,
        preservedInputs: location.state?.preservedInputs
      }
    });
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/locationno`)
      .then((data) => data.json())
      .then((val) => setLocationdrop(val));
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

  const handleChangeLocation = (selectedLocation) => {
    setSelectedLocation(selectedLocation);
    setlocation_no(selectedLocation ? selectedLocation.value : '');
  };

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

  const filteredOptionLocation = locationnodrop.map((option) => ({
    value: option.location_no,
    label: `${option.location_no} - ${option.location_name}`,
  }));


  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleInsert = async () => {
    if (
      !warehouse_code ||
      !warehouse_name ||
      !status ||
      !location_no
    ) {
      setError(true);
      toast.warning("Error: Missing required fields");
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/AddWareHousedata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          warehouse_code,
          warehouse_name,
          status,
          location_no,
          created_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.ok) {
        console.log("Data inserted successfully");
        toast.success("Data inserted successfully!", {
          onClose: () => clearInputFields(), // Reloads the page after the toast closes
        });
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
      !warehouse_code ||
      !warehouse_name ||
      !status ||
      !location_no
    ) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/WarehouseUpdates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          warehouse_code,
          warehouse_name,
          status: status,
          location_no: location_no,
          created_by,
          modified_by,
        }),
      });
      if (response.ok) {
        toast.success("Data updated successfully", {
          // onClose: () => clearInputFields()
        });
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

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {
      if (hasValueChanged) {
        setHasValueChanged(false);
      }
      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };


  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <ToastContainer position="top-right" className="toast-design" theme="colored" />
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update  Warehouse ' : ' Add Warehouse'} </h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='col-md-12 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' onClick={handleClick} title='Close' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !warehouse_code ? 'text-danger' : ''}`}>Warehouse Code<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              required title="Please enter the warehouse code"
              value={warehouse_code}
              onChange={(e) => setWarehouse_Code(e.target.value)}
              maxLength={18}
              ref={WarehouseCode}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, WarehouseName, WarehouseCode)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !warehouse_name ? 'text-danger' : ''}`}>Warehouse Name<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              required title="Please enter the warehouse name"
              value={warehouse_name}
              maxLength={250}
              onChange={(e) => setWarehouse_Name(e.target.value)}
              ref={WarehouseName}
              onKeyDown={(e) => handleKeyDown(e, Status, WarehouseName)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
            <div title="Please select the status">
              <Select
                classNamePrefix="react-select"
                value={selectedStatus}
                onChange={handleChangeStatus}
                options={filteredOptionStatus}
                placeholder=""
                ref={Status}
                onKeyDown={(e) => handleKeyDown(e, locatioN, Status)}
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedLocation ? 'text-danger' : ''}`}>Location No<span className="text-danger">*</span></label>
            <div title="Please select the locatio no">
              <Select
                type="text"
                classNamePrefix="react-select"
                value={selectedLocation}
                onChange={handleChangeLocation}
                options={filteredOptionLocation}
                placeholder=""
                ref={locatioN}
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
