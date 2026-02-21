import React, { useState, useEffect,useRef} from "react";
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import Select from 'react-select';
import LoadingScreen from '../../BookLoader';
import { ToastContainer, toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage"; 
const config = require('../../ApiConfig');

const VendorProductTable = ({ open, handleClose }) => {
  const [tax_type, settax_type] = useState("");
  const [tax_name, settax_name] = useState("");
  const [tax_percentage, settax_percentage] = useState(0);
  const [tax_shortname, settax_shortname] = useState("");
  const [tax_accountcode, settax_accountcode] = useState("");
  const [transaction_type, settransaction_type] = useState("");
  const [status, setStatus] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [transactiondrop, setTransactiondrop] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedtaxtype, setselectedtaxtype] = useState('');
  const [tax_type_Sales, settax_type_Sales] = useState('');
  const [taxtypedrop, settaxtypedrop] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [loading, setLoading] = useState(false);
  
    const [hasValueChanged, setHasValueChanged] = useState(false);
    const taxtype = useRef(null);
    const taxname = useRef(null);
    const shortname = useRef(null);
    const taxper = useRef(null);
    const taxaccount = useRef(null);
    const typetax = useRef(null);
    const Status = useRef(null);
    const transactiontype = useRef(null);

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
      .then((val) => setStatusdrop(val));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getOverallTAX`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => settaxtypedrop(val));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/Transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setTransactiondrop(val));
  }, []);

  const filteredOptionTransaction = transactiondrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionTaxtype = Array.isArray(taxtypedrop)
    ? taxtypedrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const handleChangeTransaction = (selectedTransaction) => {
    setSelectedTransaction(selectedTransaction);
    settransaction_type(selectedTransaction ? selectedTransaction.value : '');
  };

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleChangeTaxtype = (selectedStatus) => {
    setselectedtaxtype(selectedStatus);
    settax_type_Sales(selectedStatus ? selectedStatus.value : '');
  };

  const handleInsert = async () => {
    if (
      !tax_type ||
      !tax_name ||
      !tax_percentage ||
      !tax_type_Sales ||
      !status ||
      !tax_shortname
    ) {
      setError(" ");
      toast.warning("Missing Required Fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addTaxHdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          tax_type,
          tax_name,
          tax_percentage,
          tax_shortname,
          tax_accountcode,
          transaction_type,
          status,
          tax_type_Sales,
          created_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ tax_acc_code }] = searchData;
        settax_accountcode(tax_acc_code);
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.error('Error inserting data: ' + errorResponse.message);
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
    <div className="container-fluid mt-0">
      {loading && <LoadingScreen />}
      {/* <ToastContainer position="top-right" className="toast-design" theme="colored" /> */}
      <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add Tax Header</h5>
              <button type="button" className="btn-close" title="Close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !tax_type ? 'text-danger' : ''}`}>Tax Type<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the tax type"
                    value={tax_type}
                    onChange={(e) => settax_type(e.target.value)}
                    maxLength={18}
                    ref={taxtype}
                    onKeyDown={(e) => handleKeyDown(e, taxname, taxtype)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !tax_name ? 'text-danger' : ''}`}>Tax Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the tax name"
                    value={tax_name}
                    onChange={(e) => settax_name(e.target.value)}
                    maxLength={250}
                    ref={taxname}
                    onKeyDown={(e) => handleKeyDown(e, shortname, taxname)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !tax_shortname ? 'text-danger' : ''}`}>Short Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the short name"
                    value={tax_shortname}
                    onChange={(e) => settax_shortname(e.target.value)}
                    ref={shortname}
                    onKeyDown={(e) => handleKeyDown(e, taxper, shortname)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !tax_percentage ? 'text-danger' : ''}`}>Tax Percentage<span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the tax percentage"
                    value={tax_percentage}
                    onChange={(e) => settax_percentage(e.target.value)}
                    ref={taxper}
                    onKeyDown={(e) => handleKeyDown(e, taxaccount, taxper)}
                    maxLength={50}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className='fw-bold'>Tax Account Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    required title="Please enter the tax account code"
                    value={tax_accountcode}
                    onChange={(e) => settax_accountcode(e.target.value)}
                    maxLength={9}
                    ref={taxaccount}
                    onKeyDown={(e) => handleKeyDown(e, transactiontype, taxaccount)}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <label className= "fw-bold">Transaction Type</label>
                  <div title="Please select the transaction type">
                  <Select
                    value={selectedTransaction}
                    onChange={handleChangeTransaction}
                    options={filteredOptionTransaction}
                    classNamePrefix="react-select"
                    placeholder=""
                    maxLength={250}
                    ref={transactiontype}
                    onKeyDown={(e) => handleKeyDown(e, typetax, transactiontype)}
                  />
                </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !tax_type_Sales ? 'text-danger' : ''}`}>Types Of Tax<span className="text-danger">*</span></label>
                  <div title="Please select the types of tax">
                  <Select
                    value={selectedtaxtype}
                    onChange={handleChangeTaxtype}
                    options={filteredOptionTaxtype}
                    classNamePrefix="react-select"
                    placeholder=""
                    maxLength={18}
                    ref={typetax}
                    onKeyDown={(e) => handleKeyDown(e, Status, typetax)}
                  />
                </div>
                </div>
                <div className="col-md-3 mb-2">
                  <label className={`fw-bold ${error && !status ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
                  <div title="Please select the status">
                  <Select
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    classNamePrefix="react-select"
                    placeholder=""
                    maxLength={18}
                    ref={Status}
                    // onKeyDown={(e) => handleKeyDown(e, Status)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleInsert();
                      }
                    }}
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
