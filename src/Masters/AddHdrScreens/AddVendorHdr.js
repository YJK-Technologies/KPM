import { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from '../../BookLoader';
import secureLocalStorage from "react-secure-storage"; 

const config = require("../../ApiConfig");
const VendorProductTable = ({ open, handleClose }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [vendor_code, setvendor_code] = useState("");
  const [vendor_name, setvendor_name] = useState("");
  const [status, setstatus] = useState("");
  const [panno, setpanno] = useState("");
  const [vendor_gst_no, setvendor_gst_no] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [loading, setLoading] = useState(false);

  const [hasValueChanged, setHasValueChanged] = useState(false);
  const vendorcode = useRef(null);
  const vendorname = useRef(null);
  const Status = useRef(null);
  const gstno = useRef(null);
  const Panno = useRef(null);
  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
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

  const handleInsert = async () => {
    if (!vendor_code || !vendor_name || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addVendorHdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          vendor_code,
          vendor_name,
          status,
          panno,
          vendor_gst_no,
          created_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.ok) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(), // Reloads the page after the toast closes
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

  return (
    <div className="container-fluid mt-0">
      {loading && <LoadingScreen />}
      <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add Vendor Header</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !vendor_code ? 'text-danger' : ''}`}>Vendor Code<span className="text-danger">*</span></label>
                  <div className="">
                    <input
                      type="text"
                      className="form-control pe-5"
                      id="vencode"
                      placeholder=""
                      required title="Please enter the vendor code"
                      value={vendor_code}
                      onChange={(e) => setvendor_code(e.target.value)}
                      maxLength={18}
                      ref={vendorcode}
                      onKeyDown={(e) => handleKeyDown(e, vendorname, vendorcode)}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !vendor_name ? 'text-danger' : ''}`}>Vendor Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="venname"
                    placeholder=""
                    required title="Please enter the vendor name"
                    value={vendor_name}
                    onChange={(e) => setvendor_name(e.target.value)}
                    maxLength={250}
                    ref={vendorname}
                    onKeyDown={(e) => handleKeyDown(e, Status, vendorname)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !status ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
                  <div title="Please select the status">
                  <Select
                    type="text"
                    id="status"
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    classNamePrefix="react-select"
                    placeholder=""
                    ref={Status}
                    onKeyDown={(e) => handleKeyDown(e, Panno, Status)}
                  />
                </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="fw-bold">PAN No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="panno"
                    placeholder=""
                    required title="Please enter the Pan number"
                    value={panno}
                    onChange={(e) => setpanno(e.target.value)}
                    maxLength={18}
                    ref={Panno}
                    onKeyDown={(e) => handleKeyDown(e, gstno, Panno)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="fw-bold">GST No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="vengstno"
                    placeholder=""
                    required title="Please enter the GST number"
                    value={vendor_gst_no}
                    onChange={(e) => setvendor_gst_no(e.target.value)}
                    maxLength={15}
                    ref={gstno}
                    // onKeyDown={(e) => handleKeyDown(e, gstno)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleInsert();
                      }
                    }}
                  />
                </div>
                <div className="col-md-2 mb-2 mt-4">
                  <button className="btn btn-primary" onClick={handleInsert} title='Submit'>Submit</button>
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
