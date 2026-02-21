import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import AttriHdrInputPopup from '../AddHdrScreens/AddVendorHdr.js';
import { useLocation } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer,toast } from 'react-toastify';
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
import LoadingScreen from '../../BookLoader';
import '../../App.css';
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

  const handleClick = () => { navigate('/Vendor'); };
  
  const [open2, setOpen2] = React.useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [vendor_addr_1, setvendor_addr_1] = useState("");
  const [vendor_addr_2, setvendor_addr_2] = useState("");
  const [vendor_addr_3, setvendor_addr_3] = useState("");
  const [vendor_addr_4, setvendor_addr_4] = useState("");
  const [vendor_area_code, setvendor_area_code] = useState("");
  const [vendor_state_code, setvendor_state_code] = useState("");
  const [vendor_country_code, setvendor_country_code] = useState("");
  const [vendor_office_no, setvendor_office_no] = useState("");
  const [vendor_resi_no, setvendor_resi_no] = useState("");
  const [vendor_mobile_no, setvendor_mobile_no] = useState("");
  const [vendor_email_id, setvendor_email_id] = useState("");


  const [vendor_transport_code, setvendor_transport_code] = useState("");
  const [vendor_salesman_code, setvendor_salesman_code] = useState("");
  const [vendor_broker_code, setvendor_broker_code] = useState("");
  const [vendor_code, setvendor_code] = useState("");
  const [error, setError] = useState("");
  const [selectedTransport, setSelectedTransport] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [selectedBroker, setSelectedBroker] = useState('');
  const [officedrop, setOfficedrop] = useState([]);
  const [selectedOffice, setselectedOffice] = useState('');
  const [office_type, setOfficeType] = useState('');
  const [contact_person, setContact_person] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setselectedState] = useState('');
  const [selectedCountry, setselectedCountry] = useState('');
  const [vendorcodedrop, setvendorcodedrop] = useState([]);
  const [SMcodedrop, setsmcodedrop] = useState([]);
  const [drop, setDrop] = useState([]);
  const [condrop, setCondrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyfield, setkeyfield] = useState("");
  const created_by = sessionStorage.getItem('selectedUserCode')
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const code = useRef(null);
  const Address1 = useRef(null);
  const Address2 = useRef(null);
  const Address3 = useRef(null);
  const Address4 = useRef(null);
  const City = useRef(null);
  const State = useRef(null);
  const Country = useRef(null);
  const Imex = useRef(null);
  const Office = useRef(null);
  const Residential = useRef(null);
  const Mobile = useRef(null);
  const FaxNo = useRef(null);
  const Credit = useRef(null);
  const TRansport = useRef(null);
  const Sales = useRef(null);
  const Broker = useRef(null);
  const Week = useRef(null);
  const OfficeT = useRef(null);
  const Email = useRef(null);
  const Contact = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [isUpdated, setIsUpdated] = useState(false);

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  console.log(selectedRow);

  const clearInputFields = () => {
    setvendor_code("");
    setvendor_addr_1("");
    setvendor_addr_2("");
    setvendor_addr_3("");
    setvendor_addr_4("");
    setvendor_area_code("");
    setvendor_state_code("");
    setvendor_country_code("");
    setvendor_office_no('');
    setvendor_resi_no('');
    setvendor_mobile_no("");
    setvendor_transport_code('');
    setvendor_salesman_code('');
    setvendor_broker_code('');
    setOfficeType('');
    setContact_person('');
    setSelectedCity('');
    setselectedState('');
    setselectedCountry('');
    setSelectedCode('');
    setSelectedSales('');
    setselectedOffice('');
    setvendor_email_id('');
  };
  
  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setvendor_code(selectedRow.vendor_code||"")
      setvendor_addr_1(selectedRow.vendor_addr_1 || "");
      setvendor_addr_2(selectedRow.vendor_addr_2 || "");
      setvendor_addr_3(selectedRow.vendor_addr_3 || "");
      setvendor_addr_4(selectedRow.vendor_addr_4 || "");
      setvendor_area_code(selectedRow.vendor_area_code || "");
      setvendor_state_code(selectedRow.vendor_state_code || "");
      setvendor_country_code(selectedRow.vendor_country_code || "");
      setvendor_office_no(selectedRow.vendor_office_no || "");
      setvendor_resi_no(selectedRow.vendor_resi_no || "");
      setvendor_mobile_no(selectedRow.vendor_mobile_no || "");
      setvendor_email_id(selectedRow.vendor_email_id ||"");
      setvendor_transport_code(selectedRow.vendor_transport_code || "");
      setvendor_salesman_code(selectedRow.vendor_salesman_code || "");
      setOfficeType(selectedRow.office_type || "");
      setContact_person(selectedRow.contact_person || "");
      setkeyfield(selectedRow.keyfield || "");
      setSelectedCity({
        label: selectedRow.vendor_area_code,
        value: selectedRow.vendor_area_code,
      });
      setselectedState({
        label: selectedRow.vendor_state_code,
        value: selectedRow.vendor_state_code,
      });
      setselectedCountry({
        label: selectedRow.vendor_country_code,
        value: selectedRow.vendor_country_code,
      });
      setSelectedCode({
        label: selectedRow.vendor_code,
        value: selectedRow.vendor_code,
      });
      setSelectedTransport({
        label: selectedRow.vendor_transport_code,
        value: selectedRow.vendor_transport_code,
      });
      setSelectedSales({
        label: selectedRow.vendor_salesman_code,
        value: selectedRow.vendor_salesman_code,
      });
      setSelectedBroker({
        label: selectedRow.vendor_broker_code,
        value: selectedRow.vendor_broker_code,
      });
      setselectedOffice({
        label: selectedRow.office_type,
        value: selectedRow.office_type,
      });
 
    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

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
    const fetchVendor = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/vendorcode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const val = await response.json();
        setvendorcodedrop(val);
      } catch (error) {
        console.error('Error fetching Vendors:', error);
      }
    };

    if (company_code) {
      fetchVendor();
    }
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

  const handleChangeCode = (selectedCode) => {
    setSelectedCode(selectedCode);
    setvendor_code(selectedCode ? selectedCode.value : '');
  };

  const handleChangeSales = (selectedSales) => {
    setSelectedSales(selectedSales);
    setvendor_salesman_code(selectedSales ? selectedSales.value : '');
  };

  const handleChangeCity = (selectedCity) => {
    setSelectedCity(selectedCity);
    setvendor_area_code(selectedCity ? selectedCity.value : '');
  };

  const handleChangeState = (selectedState) => {
    setselectedState(selectedState);
    setvendor_state_code(selectedState ? selectedState.value : '');
  };

  const handleChangeCountry = (selectedCountry) => {
    setselectedCountry(selectedCountry);
    setvendor_country_code(selectedCountry ? selectedCountry.value : '');
  };

  const handleChangeOffice = (selectedOffice) => {
    setselectedOffice(selectedOffice);
    setOfficeType(selectedOffice ? selectedOffice.value : '');
  };

  const filteredOptionCode = Array.isArray(vendorcodedrop)
  ? vendorcodedrop.map((option) => ({
    value: option.vendor_code,
    label: `${option.vendor_code} - ${option.vendor_name}`,
  }))
  : [];
  
  const filteredOptionSales = Array.isArray(SMcodedrop)
  ? SMcodedrop.map((option) => ({
    value: option.keyfield,
    label: option.keyfield,
  }))
  : [];

  const filteredOptionCity = drop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionState = statedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionCountry = condrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionOffice = officedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }

  const handleInsert = async () => {
    if (
      !vendor_code ||
      !vendor_addr_1 ||
      !vendor_addr_2 ||
      !vendor_mobile_no ||
      !vendor_email_id ||
      !vendor_country_code ||
      !vendor_state_code
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(vendor_email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addVendorDetData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor_code,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          vendor_addr_1,
          vendor_addr_2,
          vendor_addr_3,
          vendor_addr_4,
          vendor_area_code,
          vendor_state_code,
          vendor_country_code,
          vendor_office_no,
          vendor_resi_no,
          vendor_mobile_no,
          vendor_email_id,
          vendor_transport_code,
          vendor_salesman_code,
          vendor_broker_code,
          contact_person,
          office_type,
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
      !vendor_code ||
      !vendor_addr_1 ||
      !vendor_addr_2 ||
      !vendor_mobile_no ||
      !vendor_email_id ||
      !vendor_country_code ||
      !vendor_state_code
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(vendor_email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/VendorUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor_code,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          vendor_addr_1,
          vendor_addr_2,
          vendor_addr_3,
          vendor_addr_4,
          vendor_area_code,
          vendor_state_code,
          vendor_country_code,
          vendor_office_no,
          vendor_resi_no,
          vendor_mobile_no,
          vendor_email_id,
          vendor_transport_code,
          vendor_salesman_code,
          vendor_broker_code,
          contact_person,
          office_type,
          keyfield,
          modified_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        toast.success("Data Updated successfully!")
        setIsUpdated(true);
        clearInputFields();
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

  const capitalizeFirstLetter = (value) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h1 align="left" class="purbut">{mode === "update"?'Update Vendor Details':'Add Vendor Details'}</h1> </div>
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
          <label className={`fw-bold ${error && !selectedCode ? 'text-danger' : ''}`}>Code<span className="text-danger">*</span></label>
            <div className="position-relative">
              <div title="Please select the code">
              <Select
                className="position-relative" 
                classNamePrefix="react-select"               
                onClick={handleShowModal}
                id="venco"
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
                type="button"
                title='Add Vendor Header'
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
          <label className={`fw-bold ${error && !vendor_addr_1 ? 'text-danger' : ''}`}>Address 1<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="venad1"
              placeholder=""
              required title="Please enter the address"
              value={vendor_addr_1}
              onChange={(e) => setvendor_addr_1(e.target.value)}
              maxLength={250}
              ref={Address1}
              onKeyDown={(e) => handleKeyDown(e, Address2, Address1)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold ${error && !vendor_addr_2 ? 'text-danger' : ''}`}>Address 2<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="venad2"
              placeholder=""
              required title="Please enter the address"
              value={vendor_addr_2}
              onChange={(e) => setvendor_addr_2(e.target.value)}
              maxLength={250}
              ref={Address2}
              onKeyDown={(e) => handleKeyDown(e, Address3, Address2)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold`}>Address 3</label>
            <input
              type="text"
              className="form-control"
              id="venad3"
              placeholder=""
              required title="Please enter the address"
              value={vendor_addr_3}
              onChange={(e) => setvendor_addr_3(e.target.value)}
              maxLength={250}
              ref={Address3}
              onKeyDown={(e) => handleKeyDown(e, Address4, Address3)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold`}>Address 4</label>
            <input
              type="text"
              className="form-control"
              id="venad4"
              placeholder=""
              required title="Please enter the address"
              value={vendor_addr_4}
              onChange={(e) => setvendor_addr_4(e.target.value)}
              maxLength={250}
              ref={Address4}
              onKeyDown={(e) => handleKeyDown(e, City, Address4)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold ${error && !selectedCity ? 'text-danger' : ''}`}>City<span className="text-danger">*</span></label>
            <div title="Please select the city">
            <Select
              type="text"
              classNamePrefix="react-select"
              id="city"
              value={selectedCity}
              onChange={handleChangeCity}
              options={filteredOptionCity}
              placeholder=""
              ref={City}
              onKeyDown={(e) => handleKeyDown(e, State, City)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold ${error && !selectedState ? 'text-danger' : ''}`}>State<span className="text-danger">*</span></label>
            <div title="Please select the state">
            <Select
              id="state"
              value={selectedState}
              onChange={handleChangeState}
              options={filteredOptionState}
              classNamePrefix="react-select"
              placeholder=""
              ref={State}
              onKeyDown={(e) => handleKeyDown(e, Country, State)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold ${error && !selectedCountry ? 'text-danger' : ''}`}>Country<span className="text-danger">*</span></label>
            <div title="Please select the country">
            <Select
              id="country"
              value={selectedCountry}
              onChange={handleChangeCountry}
              options={filteredOptionCountry}
              classNamePrefix="react-select"
              placeholder=""
              ref={Country}
              onKeyDown={(e) => handleKeyDown(e, Office, Country)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold`}>Office No</label>
            <input
              type="text"
              className="form-control"
              id="venoff"
              placeholder=""
              required title="Please enter the office number"
              value={vendor_office_no}
              onChange={(e) => setvendor_office_no(e.target.value)}
              maxLength={20}
              ref={Office}
              onKeyDown={(e) => handleKeyDown(e, Residential, Office)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold`}>Residential No</label>
            <input
              type="text"
              className="form-control"
              id="venresi"
              placeholder=""
              required title="Please enter the residential number"
              value={vendor_resi_no}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 20) {
                  setvendor_resi_no(onlyNums);
                }
              }}              
              maxLength={20}
              ref={Residential}
              onKeyDown={(e) => handleKeyDown(e, Mobile, Residential)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold ${error && !vendor_mobile_no ? 'text-danger' : ''}`}>Mobile No<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="mobno"
              placeholder=""
              required title="Please enter the mobile number"
              value={vendor_mobile_no}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 20) {
                  setvendor_mobile_no(onlyNums);
                }
              }}              
              maxLength={20}
              ref={Mobile}
              onKeyDown={(e) => handleKeyDown(e, Email, Mobile)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold ${error && !vendor_email_id ? 'text-danger' : ''}`}>Email<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="emailid"
              placeholder=""
              required title="Please enter the email ID"
              value={vendor_email_id}
              onChange={(e) => setvendor_email_id(e.target.value)}
              maxLength={250}
              ref={Email}
              onKeyDown={(e) => handleKeyDown(e, Sales, Email)}
            />
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold`}>Salesman Code</label>
            <div title="Please select the salesman code">
            <Select
              id="vensales"
              value={selectedSales}
              onChange={handleChangeSales}
              options={filteredOptionSales}
              classNamePrefix="react-select"
              placeholder=""
              ref={Sales}
              onKeyDown={(e) => handleKeyDown(e, OfficeT, Sales)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
          <label className={`fw-bold`}>Office Type</label>
            <div title="Please select the office type">
            <Select
              id="officeType"
              value={selectedOffice}
              onChange={handleChangeOffice}
              options={filteredOptionOffice}
              classNamePrefix="react-select"
              placeholder=""
              ref={OfficeT}
              onKeyDown={(e) => handleKeyDown(e, Contact, OfficeT)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
  <label className="fw-bold">Contact person</label>

  <input
    type="text"
    className="form-control"
    id="officeType"
    value={contact_person}
    placeholder=""
    ref={Contact}
    title="Please enter Contact person"

    onChange={(e) => {
      const value = e.target.value;
      setContact_person(
        value.charAt(0).toUpperCase() + value.slice(1)
      );
    }}

    onKeyDown={(e) => {
      if (e.key === "Enter") {
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
                  className='form-control'
                  id="emailid"
                  placeholder=""
                  required
                  value={created_by}
                />
              </>
            ) : (
              <>
                <label className='fw-bold'>Modified By</label>
                <input
                  type="text"
                  className='form-control'
                  id="emailid"
                  placeholder=""
                  required
                  value={modified_by}
                />
              </>
            )}
          </div> */}
          <div class="col-md-2 mb-2 mt-4">
                {mode === "create" ? (
                  <button onClick={handleInsert} className="btn btn-primary" title="Submit">
                      Submit
                  </button>
                ) : (
                  <button onClick={handleUpdate} className="btn btn-primary" title="Update">
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
