import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import AttriHdrInputPopup from '../AddHdrScreens/AddCustomerHdr.js';
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
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
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
  const [customer_code, setcustomer_code] = useState("");
  const [customer_addr_1, setcustomer_addr_1] = useState("");
  const [customer_addr_2, setcustomer_addr_2] = useState("");
  const [customer_addr_3, setcustomer_addr_3] = useState("");
  const [customer_addr_4, setcustomer_addr_4] = useState("");
  const [customer_area, setcustomer_area] = useState("");
  const [customer_state, setcustomer_state] = useState("");
  const [customer_country, setcustomer_country] = useState("");
  const [customer_office_no, setcustomer_office_no] = useState("");
  const [customer_resi_no, setcustomer_resi_no] = useState("");
  const [customer_mobile_no, setcustomer_mobile_no] = useState("");
  const [customer_email_id, setcustomer_email_id] = useState("");
  const [customer_credit_limit, setcustomer_credit_limit] = useState("0");
  const [keyfield, setkeyfield] = useState("");
  const [customer_salesman_code, setcustomer_salesman_code] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [customercodedrop, setcustomercodedrop] = useState([]);
  const [SMcodedrop, setsmcodedrop] = useState([]);
  const [drop, setDrop] = useState([]);
  const [condrop, setCondrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setselectedState] = useState('');
  const [selectedCountry, setselectedCountry] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [error, setError] = useState("");
  const [selectedUserName, setSelectedUserName] = useState('')
  const [officedrop, setOfficedrop] = useState([]);
  const [customerdrop, setcustomerdrop] = useState([]);
  const [selectedOffice, setselectedOffice] = useState('');
  const [office_type, setOfficeType] = useState('');
  const [contact_person, setContact_person] = useState('');
  const [selectedCustomer, setselectedCust] = useState('');
  const [default_customer, setdefaultCust] = useState('');
  const Country = useRef(null);
  const OfficeNo = useRef(null);
  const Residential = useRef(null);
  const Mobile = useRef(null);
  const Email = useRef(null);
  const Credit = useRef(null);
  const Default = useRef(null);
  const Salesman = useRef(null);
  const Office = useRef(null);
  const City = useRef(null);
  const Address4 = useRef(null);
  const Address3 = useRef(null);
  const Address2 = useRef(null);
  const Address1 = useRef(null);
  const code = useRef(null);
  const Contact = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode');
  const [loading, setLoading] = useState(false);

  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [isUpdated, setIsUpdated] = useState(false);

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  console.log(selectedRow);

  const clearInputFields = () => {
    setcustomer_code("");
    setcustomer_addr_1("");
    setcustomer_addr_2("");
    setcustomer_addr_3("");
    setcustomer_addr_4('');
    setcustomer_office_no('');
    setcustomer_resi_no('');
    setcustomer_mobile_no('');
    setcustomer_email_id('');
    setcustomer_credit_limit('');
    setContact_person('');
    setcustomer_code('');
    setcustomer_area('');
    setcustomer_state('');
    setcustomer_country('');
    setcustomer_salesman_code('');
    setOfficeType('');
    setdefaultCust('');
    setSelectedCode('');
    setSelectedCity('');
    setselectedState('');
    setselectedCountry('');
    setSelectedSales('');
    setselectedOffice('');
    setselectedCust('');
  };
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/customercode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setcustomercodedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/smcode`)
      .then((data) => data.json())
      .then((val) => setsmcodedrop(val));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/city`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setDrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/country`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setCondrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);



  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getofftype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setOfficedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getdefCustomer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setcustomerdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setcustomer_addr_1(selectedRow.customer_addr_1 || "")
      setcustomer_addr_2(selectedRow.customer_addr_2 || "");
      setcustomer_addr_3(selectedRow.customer_addr_3 || "");
      setcustomer_addr_4(selectedRow.customer_addr_4 || "");
      setcustomer_office_no(selectedRow.customer_office_no || "");
      setcustomer_resi_no(selectedRow.customer_resi_no || "");
      setcustomer_mobile_no(selectedRow.customer_mobile_no || 0);
      setcustomer_email_id(selectedRow.customer_email_id || "");
      setcustomer_credit_limit(selectedRow.customer_credit_limit || 0);
      setContact_person(selectedRow.contact_person || "");
      setcustomer_code(selectedRow.customer_code || "");
      setcustomer_area(selectedRow.customer_area || "");
      setcustomer_state(selectedRow.customer_state || "");
      setcustomer_country(selectedRow.customer_country || "");
      setcustomer_salesman_code(selectedRow.customer_salesman_code || "");
      setOfficeType(selectedRow.office_type || "");
      setdefaultCust(selectedRow.default_customer || "");
      setkeyfield(selectedRow.keyfield || "");
      setSelectedCode({
        label: selectedRow.customer_code,
        value: selectedRow.customer_code,
      });
      setSelectedCity({
        label: selectedRow.customer_area,
        value: selectedRow.customer_area,
      });
      setselectedState({
        label: selectedRow.customer_state,
        value: selectedRow.customer_state,
      });
      setselectedCountry({
        label: selectedRow.customer_country,
        value: selectedRow.customer_country,
      });
      setSelectedSales({
        label: selectedRow.customer_salesman_code,
        value: selectedRow.customer_salesman_code,
      });
      setselectedOffice({
        label: selectedRow.office_type,
        value: selectedRow.office_type,
      });
      setselectedCust({
        label: selectedRow.default_customer,
        value: selectedRow.default_customer,
      });

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  const filteredOptionCode = Array.isArray(customercodedrop)
    ? customercodedrop.map((option) => ({
      value: option.customer_code,
      label: `${option.customer_code} - ${option.customer_name}`,
    }))
    : [];

  const filteredOptionSales = Array.isArray(SMcodedrop)
    ? SMcodedrop.map((option) => ({
      value: option.keyfield,
      label: option.keyfield,
    }))
    : [];

  const filteredOptionCity = Array.isArray(drop)
    ? drop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const filteredOptionState = Array.isArray(statedrop)
    ? statedrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const filteredOptionCountry = Array.isArray(condrop)
    ? condrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const filteredOptionOffice = Array.isArray(officedrop)
    ? officedrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const filteredOptioncustomer = Array.isArray(customerdrop)
    ? customerdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const handleChangeCode = (selectedOption) => {
    setSelectedCode(selectedOption);
    setcustomer_code(selectedOption ? selectedOption.value : '');
    setSelectedUserName(selectedOption ? selectedOption.label.split(' - ')[1] : '');
  };

  const handleChangeSales = (selectedSales) => {
    setSelectedSales(selectedSales);
    setcustomer_salesman_code(selectedSales ? selectedSales.value : '');
  };

  const handleChangeCity = (selectedCity) => {
    setSelectedCity(selectedCity);
    setcustomer_area(selectedCity ? selectedCity.value : '');
  };

  const handleChangeState = (selectedState) => {
    setselectedState(selectedState);
    setcustomer_state(selectedState ? selectedState.value : '');
  };

  const handleChangeCountry = (selectedCountry) => {
    setselectedCountry(selectedCountry);
    setcustomer_country(selectedCountry ? selectedCountry.value : '');
  };

  const handleChangeOffice = (selectedOffice) => {
    setselectedOffice(selectedOffice);
    setOfficeType(selectedOffice ? selectedOffice.value : '');  };

  const handleChangeCustomer = (selectedCustomer) => {
    setselectedCust(selectedCustomer);
    setdefaultCust(selectedCustomer ? selectedCustomer.value : '');
  };

  const handleClick = () => {
    navigate('/Customer', { selectedRows });
  };

  const handleInsert = async () => {
    if (
      !customer_code ||
      !customer_addr_1 ||
      !customer_addr_2 ||
      !customer_mobile_no ||
      !customer_email_id ||
      !customer_credit_limit ||
      !customer_country ||
      !customer_state ||
      !customer_area
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(customer_email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addCustomerDetData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          customer_code,
          customer_addr_1,
          customer_addr_2,
          customer_addr_3,
          customer_addr_4,
          customer_area,
          customer_state,
          customer_country,
          customer_office_no,
          customer_resi_no,
          customer_mobile_no,
          customer_email_id,
          customer_credit_limit,
          customer_salesman_code,
          contact_person,
          office_type,
          default_customer,
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
      !customer_code ||
      !customer_addr_1 ||
      !customer_addr_2 ||
      !customer_mobile_no ||
      !customer_email_id ||
      !customer_credit_limit ||
      !customer_country ||
      !customer_state
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(customer_email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/CustomerUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          customer_code,
          customer_addr_1,
          customer_addr_2,
          customer_addr_3,
          customer_addr_4,
          customer_area,
          customer_state,
          customer_country,
          customer_office_no,
          customer_resi_no,
          customer_mobile_no,
          customer_email_id,
          customer_credit_limit,
          customer_salesman_code,
          contact_person,
          office_type,
          default_customer,
          keyfield,
          modified_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setIsUpdated(true);
        clearInputFields();
        toast.success("Data Updated successfully!")
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

  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }

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

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Customer Details' : 'Add Customer Details '}</h4> </div>
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
            <label className={`fw-bold ${error && !customer_code ? 'text-danger' : ''}`}>Code<span className="text-danger">*</span></label>
            <div className="position-relative">
              <div title="Please select the code">
              <Select
                type="text"
                className="position-relative"
                classNamePrefix="react-select"
                value={selectedCode}
                onChange={handleChangeCode}
                options={filteredOptionCode}
                placeholder=""
                maxLength={18}
                ref={code}
                readOnly={mode === "update"}
                isDisabled={mode === "update"}
                onKeyDown={(e) => handleKeyDown(e, Address1, code)}
              />
                {mode !== 'update' && (
              <button
                title="Add Customer Header"
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
            <label className={`fw-bold ${error && !customer_addr_1 ? 'text-danger' : ''}`}>Address 1<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the address"
              value={customer_addr_1}
              onChange={(e) => setcustomer_addr_1(e.target.value)}
              maxLength={250}
              ref={Address1}
              onKeyDown={(e) => handleKeyDown(e, Address2, Address1)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_addr_2 ? 'text-danger' : ''}`}>Address 2<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the address"
              value={customer_addr_2}
              onChange={(e) => setcustomer_addr_2(e.target.value)}
              maxLength={250}
              ref={Address2}
              onKeyDown={(e) => handleKeyDown(e, Address3, Address2)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Address 3</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the address"
              value={customer_addr_3}
              onChange={(e) => setcustomer_addr_3(e.target.value)}
              maxLength={250}
              ref={Address3}
              onKeyDown={(e) => handleKeyDown(e, Address4, Address3)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Address 4</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the address"
              value={customer_addr_4}
              onChange={(e) => setcustomer_addr_4(e.target.value)}
              maxLength={250}
              ref={Address4}
              onKeyDown={(e) => handleKeyDown(e, City, Address4)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_area ? 'text-danger' : ''}`}>City<span className="text-danger">*</span></label>
            <div title="Please select the city">
            <Select
              type="text"
              classNamePrefix="react-select"
              value={selectedCity}
              onChange={handleChangeCity}
              options={filteredOptionCity}
              placeholder=""
              ref={City}
              onKeyDown={(e) => handleKeyDown(e, code, City)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_state ? 'text-danger' : ''}`}>State<span className="text-danger">*</span></label>
            <div title="Please select the state">
            <Select
              value={selectedState}
              onChange={handleChangeState}
              options={filteredOptionState}
              classNamePrefix="react-select"
              placeholder=""
              ref={code}
              onKeyDown={(e) => handleKeyDown(e, Country, code)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_country ? 'text-danger' : ''}`}>Country<span className="text-danger">*</span></label>
            <div title="Please select the country">
            <Select
              value={selectedCountry}
              onChange={handleChangeCountry}
              options={filteredOptionCountry}
              classNamePrefix="react-select"
              placeholder=""
              ref={Country}
              onKeyDown={(e) => handleKeyDown(e, OfficeNo, Country)}
            />
          </div>
          </div>
          {/* <div className="col-md-3 mb-2">
          <label className='fw-bold'>IMEX No</label>
            <input
              type="text"
              className="form-control"
            />
          </div> */}
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Office No</label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the office number"
              value={customer_office_no}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 20) {
                  setcustomer_office_no(onlyNums);
                }
              }}
              ref={OfficeNo}
              onKeyDown={(e) => handleKeyDown(e, Residential, OfficeNo)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Residential No</label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the residential number"
              value={customer_resi_no}
              // onChange={(e) => setcustomer_resi_no(e.target.value)}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 20) {
                  setcustomer_resi_no(onlyNums);
                }
              }}
              ref={Residential}
              onKeyDown={(e) => handleKeyDown(e, Mobile, Residential)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_mobile_no ? 'text-danger' : ''}`}>Mobile No<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the mobile number"
              value={customer_mobile_no}
              // onChange={(e) => setcustomer_mobile_no(e.target.value)}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 15) {
                  setcustomer_mobile_no(onlyNums);
                }
              }}
              ref={Mobile}
              onKeyDown={(e) => handleKeyDown(e, Email, Mobile)}
            />
          </div>
          {/* <div className="col-md-3 mb-2">
          <label className='fw-bold'>Fax No</label>
            <input
              type="text"
              className="form-control"
            />
          </div> */}
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_email_id ? 'text-danger' : ''}`}>Email<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="email"
              placeholder=""
              required title="Please enter the email ID"
              value={customer_email_id}
              onChange={(e) => setcustomer_email_id(e.target.value)}
              maxLength={250}
              ref={Email}
              onKeyDown={(e) => handleKeyDown(e, Credit, Email)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !customer_credit_limit ? 'text-danger' : ''}`}>Credit Limit<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the credit limit"
              value={customer_credit_limit}
              // onChange={(e) => setcustomer_credit_limit(e.target.value)}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 11) {
                  setcustomer_credit_limit(onlyNums);
                }
              }}
              maxLength={18}
              ref={Credit}
              onKeyDown={(e) => handleKeyDown(e, Salesman, Credit)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Salesman Code</label>
            <div title="Please select the salesman code">
            <Select
              value={selectedSales}
              onChange={handleChangeSales}
              options={filteredOptionSales}
              classNamePrefix="react-select"
              placeholder=""
              ref={Salesman}
              onKeyDown={(e) => handleKeyDown(e, Office, Salesman)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Office Type</label>
            <div title="Please select the office type">
            <Select
              value={selectedOffice}
              onChange={handleChangeOffice}
              options={filteredOptionOffice}
              classNamePrefix="react-select"
              placeholder=""
              ref={Office}
              onKeyDown={(e) => handleKeyDown(e, Default, Office)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Default Customer</label>
            <div title="Please select the default customer">
            <Select
              value={selectedCustomer}
              onChange={handleChangeCustomer}
              options={filteredOptioncustomer}
              classNamePrefix="react-select"
              placeholder=""
              ref={Default}
              onKeyDown={(e) => handleKeyDown(e, Contact, Default)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Contact Person</label>
            <input
              type="text"
              className='form-control '
              value={contact_person}
              onChange={(e) => setContact_person(e.target.value)}
              placeholder=""
              ref={Contact}
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
          {/* <div className="col-md-3 mb-2">
          {mode === "create" ? (
            <>
            <label className='fw-bold'>Created By</label>
            <input
              type="text"
              className='form-control '
              value={created_by}
            />
            </>
              ) : (
            <>
            <label className='fw-bold'>Modified By</label>
            <input
              type="text"
              className='form-control '
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
