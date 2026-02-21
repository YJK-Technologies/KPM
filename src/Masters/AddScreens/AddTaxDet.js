import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import AttriHdrInputPopup from '../AddHdrScreens/AddTaxHdr.js';
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
const config = require('../../ApiConfig');

const VendorProductTable = () => {
  const [tax_type_header, settax_type_header] = useState("");
  const [tax_name_details, settax_name_details] = useState("");
  const [tax_percentage, settax_percentage] = useState(0);
  const [tax_shortname, settax_shortname] = useState("");
  const [tax_accountcode, settax_accountcode] = useState("");
  const [transaction_type, settransaction_type] = useState("");
  const [status, setStatus] = useState("");
  const [taxtypedrop, settaxtypedrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [transactiondrop, setTransactiondrop] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState("");
  const [selectedTax, setSelectedTax] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const taxtypehdr = useRef(null);
  const taxnamedet = useRef(null);
  const taxper = useRef(null);
  const shortname = useRef(null);
  const taxaccounttype = useRef(null);
  const transactiontype = useRef(null);
  const StatuS = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode');
  const [loading, setLoading] = useState(false);

  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [isUpdated, setIsUpdated] = useState(false);

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  console.log(selectedRow);

  const clearInputFields = () => {
    setSelectedTax("");
    setSelectedTransaction("");
    setSelectedStatus("");
    settax_name_details("");
    settax_percentage("");
    settax_shortname("");
    settax_accountcode("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setSelectedTax({
        label: selectedRow.tax_type_header,
        value: selectedRow.tax_type_header,
      });
      settax_type_header(selectedRow.tax_type_header);
      setSelectedTransaction({
        label: selectedRow.transaction_type,
        value: selectedRow.transaction_type,
      });
      settransaction_type(selectedRow.transaction_type);
      setSelectedStatus({
        label: selectedRow.status,
        value: selectedRow.status,
      });
      setStatus(selectedRow.status);
      settax_name_details(selectedRow.tax_name_details || "");
      settax_percentage(selectedRow.tax_percentage || 0);
      settax_shortname(selectedRow.tax_shortname || "");
      settax_accountcode(selectedRow.tax_accountcode || "");

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/taxtype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(settaxtypedrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
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
      .then((val) => setStatusdrop(val));
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

  const filteredOptionTax = taxtypedrop.map((option) => ({
    value: option.tax_type,
    label: option.tax_type,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionTransaction = transactiondrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeTax = (selectedTax) => {
    setSelectedTax(selectedTax);
    settax_type_header(selectedTax ? selectedTax.value : '');
  };

  const handleChangeTransaction = (selectedTransaction) => {
    setSelectedTransaction(selectedTransaction);
    settransaction_type(selectedTransaction ? selectedTransaction.value : '');
  };

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    navigate('/Tax', { selectedRows });
  };

  const handleInsert = async () => {
    if (
      !tax_type_header ||
      !tax_name_details ||
      !tax_percentage ||
      !tax_shortname ||
      !status
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addTaxDetailsData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          tax_type_header,
          tax_name_details,
          tax_percentage,
          tax_shortname,
          tax_accountcode,
          transaction_type,
          status,
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

  const handleUpdate = async () => {
    if (
      !selectedTax ||
      !tax_name_details ||
      !tax_percentage ||
      !tax_shortname ||
      !status
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/TaxUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tax_type_header: selectedTax.value,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          tax_name_details,
          tax_percentage,
          tax_shortname,
          tax_accountcode,
          transaction_type: selectedTransaction.value,
          status: status,
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
      toast.error('Error inserting data: ' + error.message);
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
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Tax Details' : ' Add Tax Details'}</h4> </div>
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
            <label className={`fw-bold ${error && !selectedTax ? 'text-danger' : ''}`}>Tax Type Header<span className="text-danger">*</span></label>
            <div className="position-relative">
              <div title="Please select the tax type header">
              <Select
                type="text"
                className="position-relative"
                classNamePrefix="react-select"
                value={selectedTax}
                onChange={handleChangeTax}
                options={filteredOptionTax}
                placeholder=""
                maxLength={18}
                ref={taxtypehdr}
                readOnly={mode === "update"}
                isDisabled={mode === "update"}
                onKeyDown={(e) => handleKeyDown(e, taxnamedet, taxtypehdr)}
              />
              {mode !== 'update' && (
                <button
                  title="Add Tax Header"
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
            <label className={`fw-bold ${error && !tax_name_details ? 'text-danger' : ''}`}>Tax Name Details<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the tax name detail"
              value={tax_name_details}
              onChange={(e) => settax_name_details(e.target.value)}
              maxLength={250}
              ref={taxnamedet}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, taxper, taxnamedet)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !tax_percentage ? 'text-danger' : ''}`}>Tax Percentage<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="Number"
              placeholder=""
              value={tax_percentage}
              maxLength={5}
              onChange={(e) => settax_percentage(e.target.value)
                // const value = e.target.value;
                // if (/^\d*$/.test(value)) {
                //   settax_percentage(value);
                // }
              }
              ref={taxper}
              onKeyDown={(e) => handleKeyDown(e, shortname, taxper)}
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
              maxLength={250}
              ref={shortname}
              onKeyDown={(e) => handleKeyDown(e, taxaccounttype, shortname)}
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
              ref={taxaccounttype}
              readOnly={mode === "update"}
              onKeyDown={(e) => handleKeyDown(e, transactiontype, taxaccounttype)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Transaction Type</label>
            <div title="Please select the transaction type">
            <Select
              type="text"
              classNamePrefix="react-select"
              value={selectedTransaction}
              onChange={handleChangeTransaction}
              options={filteredOptionTransaction}
              placeholder=""
              maxLength={250}
              ref={transactiontype}
              onKeyDown={(e) => handleKeyDown(e, StatuS, transactiontype)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
            <div title="Please select the status">
            <Select
              value={selectedStatus}
              onChange={handleChangeStatus}
              options={filteredOptionStatus}
              classNamePrefix="react-select"
              placeholder=""
              maxLength={18}
              ref={StatuS}
              // onKeyDown={(e) => handleKeyDown}
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
      {showModal && (
        <AttriHdrInputPopup open={showModal} handleClose={handleCloseModal} />
      )}
    </div>
  );
};

export default VendorProductTable;
