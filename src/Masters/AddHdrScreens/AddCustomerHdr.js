import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../BookLoader';
import secureLocalStorage from "react-secure-storage"; 
const config = require('../../ApiConfig');

const VendorProductTable = ({ open, handleClose }) => {
  const [customer_code, setcustomer_code] = useState("");
  const [customer_name, setcustomer_name] = useState("");
  const [status, setstatus] = useState("");
  const [panno, setpanno] = useState("");
  const [customer_gst_no, setcustomer_gst_no] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState("");
  const code = useRef(null);
  const Name = useRef(null);
  const Status = useRef(null);
  const Pan = useRef(null);
  const Gst = useRef(null);
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
    setstatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleInsert = async () => {
    if (!customer_code || !customer_name || !status) {
      toast.warning("Error: Missing required fields");
      setError(" ");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addcustomerhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          customer_code,
          customer_name,
          status,
          panno,
          customer_gst_no,
          created_by: sessionStorage.getItem('selectedUserCode')

        }),
      });
      if (response.ok) {
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
      setLoading(false)
    }
  };

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === "Enter") {
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
    <div className="container-fluid mt-0">
    {loading && <LoadingScreen />}
      {/* <ToastContainer position="top-right" className="toast-design" theme="colored" /> */}
      <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add Customer Header</h5>
              <button type="button" title="Close" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !customer_code ? 'text-danger' : ''}`}>Customer Code<span className="text-danger">*</span></label>
                  <div className="">
                    <input
                      type="text"
                      className="form-control pe-5"
                      placeholder=""
                      required title="Please enter the customer code"
                      value={customer_code}
                      onChange={(e) => setcustomer_code(e.target.value)}
                      maxLength={18}
                      ref={code}
                      onKeyDown={(e) => handleKeyDown(e, Name, code)}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !customer_name ? 'text-danger' : ''}`}>Customer Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the customer name"
                    value={customer_name}
                    onChange={(e) => setcustomer_name(e.target.value)}
                    maxLength={250}
                    ref={Name}
                    onKeyDown={(e) => handleKeyDown(e, Status, Name)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
                  <div title="Please select the status">
                  <Select
                    type="text"
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    classNamePrefix="react-select"
                    placeholder=""
                    ref={Status}
                    onKeyDown={(e) => handleKeyDown(e, Pan, Status)}
                  />
                </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="fw-bold">PAN No</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the Pan number"
                    value={panno}
                    onChange={(e) => setpanno(e.target.value)}
                    maxLength={10}
                    ref={Pan}
                    onKeyDown={(e) => handleKeyDown(e, Gst, Pan)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="fw-bold">GST No</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the GST number"
                    value={customer_gst_no}
                    onChange={(e) => setcustomer_gst_no(e.target.value)}
                    maxLength={15}
                    ref={Gst}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleInsert();
                      }
                    }}
                    // onKeyDown={(e) => handleKeyDown(e, Status, Name)}
                  />
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
