import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import AttriHdrInputPopup from '../AddHdrScreens/AddAttributeHdr.js';
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
import { useLocation } from "react-router-dom";
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
  const [attributeheader_code, setAttributeheader_Code] = useState("");
  const [attributedetails_code, setAttributedetails_code] = useState("");
  const [attributedetails_name, setAttributedetails_name] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [statusdrop, setCodedrop] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState('Cash');
  const [error, setError] = useState("");
  const code = useRef(null);
  const subcode = useRef(null);
  const detailname = useRef(null);
  const description = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(selectedRows);
  const modified_by = sessionStorage.getItem("selectedUserCode");

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  const [isUpdated, setIsUpdated] = useState(false);

  const clearInputFields = () => {
    setSelectedHeader("");
    setAttributedetails_code("");
    setAttributedetails_name("");
    setDescriptions("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setSelectedHeader({
        label: selectedRow.attributeheader_code,
        value: selectedRow.attributeheader_code,
      });
      setAttributedetails_code(selectedRow.attributedetails_code || "");
      setAttributedetails_name(selectedRow.attributedetails_name || "");
      setDescriptions(selectedRow.descriptions || "");

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/hdrcode`)
      .then((data) => data.json())
      .then((val) => setCodedrop(val));
  }, []);

  const filteredOptionHeader = statusdrop.map((option) => ({
    value: option.attributeheader_code,
    label: option.attributeheader_code,
  }));

  const handleChangeHeader = (selectedHeader) => {
    setSelectedHeader(selectedHeader);
    setAttributeheader_Code(selectedHeader ? selectedHeader.value : '');
  };

  const handleInsert = async () => {
    if (!attributeheader_code || !attributedetails_code || !attributedetails_name) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addattridetData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          attributeheader_code,
          attributedetails_code,
          attributedetails_name,
          descriptions,
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
    navigate('/Attribute');
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
      !selectedHeader ||
      !attributedetails_code ||
      !attributedetails_name 
    ) {
      toast.warning("Error: Missing required fields");
      setError(" ");
      return;
    }
    setLoading(true);
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/AttributeUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          attributeheader_code: selectedHeader.value,
          attributedetails_code,
          attributedetails_name,
          descriptions,
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
      toast.error('Error Update data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
       <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Attribute Details' : 'Add Attribute Details'}</h4></div>
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
            <label className={`fw-bold ${error && !selectedHeader ? 'text-danger' : ''}`}>Code<span className="text-danger">*</span></label>
            <div className="position-relative">
              <div title="Please select the code">
              <Select
                type="text"
                className="position-relative"
                classNamePrefix="react-select"
                value={selectedHeader}
                onChange={handleChangeHeader}
                options={filteredOptionHeader}
                placeholder=""
                ref={code}
                readOnly={mode === "update"}
                isDisabled={mode === "update"}
                onKeyDown={(e) => handleKeyDown(e, subcode, code)}
              />
              {mode !== 'update' && (
              <button
                title="Add Attribute Header"
                type="button"
                className="btn btn-sm btn-primary position-absolute p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                style={{ zIndex: 2 }}
                onClick={handleShowModal}
              >
                +
              </button>
              )}
            </div>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !attributedetails_code ? 'text-danger' : ''}`}>Sub Code<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the attribute sub code"
              value={attributedetails_code}
              onChange={(e) => setAttributedetails_code(e.target.value)}
              maxLength={18}
              ref={subcode}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, detailname, subcode)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !attributedetails_name ? 'text-danger' : ''}`}>Detail Name<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the attribute detail name"
              value={attributedetails_name}
              onChange={(e) => setAttributedetails_name(e.target.value)}
              maxLength={250}
              ref={detailname}
              onKeyDown={(e) => handleKeyDown(e, description, detailname)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Description</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the description"
              value={descriptions}
              onChange={(e) => setDescriptions(e.target.value)}
              maxLength={250}
              ref={description}
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
      {showModal && (
        <AttriHdrInputPopup open={showModal} handleClose={handleCloseModal} />
      )}
    </div>
  );
};

export default VendorProductTable;
