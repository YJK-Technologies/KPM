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
  const [Screen_Type, setScreen_Type] = useState("");
  const [screentypedrop, setscreentypedrop] = useState([]);
  const [Start_Year, setStart_Year] = useState("");
  const [End_Year, setEnd_Year] = useState("");
  const [Start_No, setStart_No] = useState(1);
  const [Running_No, setRunning_No] = useState(0);
  const [End_No, setEnd_No] = useState(10000);
  const [comtext, secomtext] = useState("");
  const [selectedscreentype, setselectedscreentype] = useState('');
  const [statusdrop, setStatusdrop] = useState([]);
  const [booleandrop, setBooleandrop] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setselectedStatus] = useState('');
  const [selectedBoolean, setselectedBoolean] = useState('');
  const [status, setStatus] = useState("");
  const [number_prefix, setNumber_prefix] = useState("");
  const [error, setError] = useState("");
  const startyear = useRef(null);
  const screentype = useRef(null);
  const endyear = useRef(null);
  const strtno = useRef(null);
  const runno = useRef(null);
  const endno = useRef(null);
  const text = useRef(null);
  const Status = useRef(null);
  const numpre = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const [isUpdated, setIsUpdated] = useState(false);
  const navigate = useNavigate();

  const modified_by = sessionStorage.getItem("selectedUserCode");

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  const clearInputFields = () => {
    setStart_Year("");
    setEnd_Year("");
    setStart_No("");
    setRunning_No("");
    setEnd_No("");
    setselectedStatus("");
    setselectedBoolean("");
    secomtext("");
    setScreen_Type("");
    setselectedscreentype("");
  }

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setStart_Year(selectedRow.Start_Year || "");
      setEnd_Year(selectedRow.End_Year || "");
      setStart_No(selectedRow.Start_No || 1);
      setRunning_No(selectedRow.Running_No || 0);
      setEnd_No(selectedRow.End_No || 10000);
      secomtext(selectedRow.comtext || "");

      setselectedscreentype({
        label: selectedRow.Screen_Type,
        value: selectedRow.Screen_Type,
      });
      setScreen_Type(selectedRow.Screen_Type);

      setselectedStatus({
        label: selectedRow.Status,
        value: selectedRow.status,
      });
      setStatus(selectedRow.Status || '')

      setselectedBoolean({
        label: selectedRow.number_prefix,
        value: selectedRow.number_prefix,
      });
      setNumber_prefix(selectedRow.number_prefix || '')

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  const handleUpdate = async () => {
    if (
      !Screen_Type ||
      !Start_Year ||
      !End_Year ||
      !Start_No ||
      !Running_No ||
      !End_No ||
      !comtext ||
      !number_prefix ||
      !status
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/NumberSeriesUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          company_code: sessionStorage.getItem('selectedCompanyCode'),
          Screen_Type: Screen_Type,
          Start_Year: Start_Year,
          End_Year: End_Year,
          Running_No: Running_No,
          Start_No: Start_No,
          End_No: End_No,
          text: comtext,
          number_prefix: number_prefix,
          Status: status,
          modified_by,
        }),
      });
      if (response.status === 200) {
        console.log("Data Updated successfully");
        setIsUpdated(true);
        clearInputFields();
        toast.success("Data Updated successfully!")
      }
      else {
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

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/screentype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setscreentypedrop(val));
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

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getboolean`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setBooleandrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionscreentype = screentypedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionBoolean = booleandrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let financialYearStartDate, financialYearEndDate;

    if (currentMonth < 3) {
      financialYearStartDate = `${currentYear - 1}-04-01`;
      financialYearEndDate = `${currentYear}-03-31`;
    } else {
      financialYearStartDate = `${currentYear}-04-01`;
      financialYearEndDate = `${currentYear + 1}-03-31`;
    }
    setStart_Year(financialYearStartDate);
    setEnd_Year(financialYearEndDate);

  }, []);

  const handleChangescreentype = (selectedscreentype) => {
    setselectedscreentype(selectedscreentype);
    setScreen_Type(selectedscreentype ? selectedscreentype.value : '');
  };

  const handleChangeStatus = (selectedStatus) => {
    setselectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleChangeBoolean = (selectedBoolean) => {
    setselectedBoolean(selectedBoolean);
    setNumber_prefix(selectedBoolean ? selectedBoolean.value : '');
  };

  const handleInsert = async () => {
    if (
      !Screen_Type ||
      !Start_Year ||
      !End_Year ||
      !Start_No ||
      !Running_No ||
      !End_No ||
      !comtext ||
      !number_prefix ||
      !status
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addNumberseries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          Screen_Type,
          Start_Year,
          End_Year,
          Start_No,
          Running_No,
          End_No,
          comtext,
          number_prefix,
          status,
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
    navigate('/NumberSeries');
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
      <div className="card shadow-lg border-0 p-3 rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Number Series ' : 'Add Number Series'}</h4> </div>
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
            <label className={`fw-bold ${error && !selectedscreentype ? 'text-danger' : ''}`}>Screen Type<span className="text-danger">*</span></label>
            <div title="Please select the screen type">
              <Select
                value={selectedscreentype}
                onChange={handleChangescreentype}
                options={filteredOptionscreentype}
                classNamePrefix="react-select"
                placeholder=""
                required title="Please select a screen type"
                ref={screentype}
                isDisabled={mode === "update"}
                onKeyDown={(e) => handleKeyDown(e, startyear, screentype)}
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !Start_Year ? 'text-danger' : ''}`}>Start Year<span className="text-danger">*</span></label>
            <input
              type="date"
              placeholder=""
              className="form-control"
              required title="Please enter the start year"
              value={Start_Year}
              onChange={(e) => setStart_Year(e.target.value)}
              maxLength={9}
              ref={startyear}
              disabled={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, endyear, startyear)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !End_Year ? 'text-danger' : ''}`}>End Year<span className="text-danger">*</span></label>
            <input
              type="date"
              className="form-control"
              placeholder=""
              required title="Please enter the end year"
              value={End_Year}
              onChange={(e) => setEnd_Year(e.target.value)}
              maxLength={9}
              ref={endyear}
              disabled={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, strtno, endyear)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !Start_No ? 'text-danger' : ''}`}>Start No<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the start number"
              value={Start_No}
              onChange={(e) => setStart_No(e.target.value)}
              maxLength={9}
              ref={strtno}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, runno, strtno)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !Running_No ? 'text-danger' : ''}`}>Running No<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the running number"
              value={Running_No}
              onChange={(e) => setRunning_No(e.target.value)}
              maxLength={9}
              ref={runno}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, endno, runno)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !End_No ? 'text-danger' : ''}`}>End No<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the end number"
              value={End_No}
              onChange={(e) => setEnd_No(e.target.value)}
              maxLength={9}
              ref={endno}
              onKeyDown={(e) => handleKeyDown(e, text, endno)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !comtext ? 'text-danger' : ''}`}>Text<span className="text-danger">*</span></label>
            <input
              className="form-control"
              value={comtext}
              onChange={(e) => secomtext(e.target.value)}
              autoComplete="off"
              type="text"
              ref={text}
              title="Please enter the text"
              onKeyDown={(e) => handleKeyDown(e, Status, text)}
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
              required title="Please select a status"
              onKeyDown={(e) => handleKeyDown(e, numpre, Status)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedBoolean ? 'text-danger' : ''}`}>Number Prefix<span className="text-danger">*</span></label>
            <div title="Please select the number prefix">
            <Select
              classNamePrefix="react-select"
              value={selectedBoolean}
              onChange={handleChangeBoolean}
              options={filteredOptionBoolean}
              placeholder=""
              required title="Please select a Number Prefix status"
              ref={numpre}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (mode === "create") {
                    handleInsert();
                  } else {
                    handleUpdate();
                  }
                }
              }}
              // onKeyDown={(e) => handleKeyDown(e, numpre)}
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
