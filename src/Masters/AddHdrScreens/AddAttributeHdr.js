import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../BookLoader';
import secureLocalStorage from "react-secure-storage"; 
const config = require("../../ApiConfig");

const VendorProductTable = ({ open, handleClose }) => {
  const [attributeheader_code, setAttributeheader_Code] = useState("");
  const [attributeheader_name, setAttributeheader_Name] = useState("");
  const [status, setStatus] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const code = useRef(null);
  const Name = useRef(null);
  const Status = useRef(null);
  const navigate = useNavigate();
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleInsert = async () => {
    if (!attributeheader_code || !attributeheader_name || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addattriData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          attributeheader_code,
          attributeheader_name,
          status,
          created_by: sessionStorage.getItem("selectedUserCode"),
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

  return (
    <div className="container-fluid mt-0">
      {loading && <LoadingScreen />}
      {/* <ToastContainer position="top-right" className="toast-design" theme="colored" /> */}
      <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add Attribute Header</h5>
              <button type="button" title="Close" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !attributeheader_code ? 'text-danger' : ''}`}>Code<span className="text-danger">*</span></label>
                  <div className="">
                    <input
                      type="text"
                      className="form-control pe-5"
                      placeholder=""
                      required
                      title="Please enter the attribute header code"
                      value={attributeheader_code}
                      onChange={(e) =>
                        setAttributeheader_Code(e.target.value)
                      }
                      maxLength={100}
                      ref={code}
                      onKeyDown={(e) => handleKeyDown(e, Name, code)}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !attributeheader_name ? 'text-danger' : ''}`}>Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required
                    title="Please enter the attribute header name"
                    value={attributeheader_name}
                    maxLength={250}
                    onChange={(e) =>
                      setAttributeheader_Name(e.target.value)
                    }
                    ref={Name}
                    onKeyDown={(e) => handleKeyDown(e, Status, Name)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !status ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
                  <div title="Please select the status">
                  <Select
                    type="text"
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    classNamePrefix="react-select"
                    placeholder=""
                    required
                    data-tip="Please select a payment type"
                    ref={Status}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleInsert();
                      }
                    }}
                  // onKeyDown={(e) => handleKeyDown(e, Status)}
                  />
                </div>
                </div>
                <div className="col-md-2 mb-2 mt-4">
                  <button className="btn btn-primary" onClick={handleInsert} title="Submit">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;
