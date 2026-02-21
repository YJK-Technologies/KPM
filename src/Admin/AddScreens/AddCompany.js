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
import '../../App.css';
import LoadingScreen from '../../BookLoader';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
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
  const [company_no, setCompany_no] = useState("");
  const [company_name, setCompany_name] = useState("");
  const [short_name, setShort_name] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  const [email_id, setEmail_id] = useState("");
  const [status, setStatus] = useState("");
  const [foundedDate, setFoundedDate] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [contact_no, setContact_no] = useState("");
  const [location_no, setlocation_no] = useState("");
  const [annualreportURL, setAnnualReportURL] = useState("");
  const [company_gst_no, setcompany_gst_no] = useState("");
  const [error, setError] = useState("");
  const [drop, setDrop] = useState([]);
  const [condrop, setCondrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [locationnodrop, setLocationdrop] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setselectedState] = useState('');
  const [selectedCountry, setselectedCountry] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');
  const [selectedLocation, setselectedLocation] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSignatureImage, setselectedSignatureImage] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const companycode = useRef(null);
  const companyname = useRef(null);
  const shortname = useRef(null);
  const Address1 = useRef(null);
  const Address2 = useRef(null);
  const Address3 = useRef(null);
  const City = useRef(null);
  const State = useRef(null);
  const Pincode = useRef(null);
  const Country = useRef(null);
  const Email = useRef(null);
  const Status = useRef(null);
  const WebsiteUrl = useRef(null);
  const ContactNo = useRef(null);
  const companyGST = useRef(null);
  const annaual = useRef(null);
  const locatioN = useRef(null);
  const logo = useRef(null);
  const sign = useRef(null);
  const found = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [companyImage, setCompanyImage] = useState("");
  const [SignatureImage, setSignatureImage] = useState("");
  const created_by = sessionStorage.getItem('selectedUserCode')

  const [isUpdated, setIsUpdated] = useState(false);
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  const modified_by = sessionStorage.getItem("selectedUserCode");

  const clearInputFields = () => {
    setCompany_no("");
    setCompany_name("");
    setShort_name("");
    setAddress1("");
    setAddress2("");
    setAddress3("");
    setSelectedCity(null);
    setselectedState(null);
    setselectedCountry(null);
    setselectedStatus(null);
    setselectedLocation(null);
    setPincode("");
    setEmail_id("");
    setFoundedDate("");
    setWebsiteURL("");
    setContact_no("");
    setAnnualReportURL("");
    setSelectedImage("");
    setcompany_gst_no("")
    setselectedSignatureImage("")
    if (logo.current) {
      logo.current.value = null;
    }
    if (sign.current) {
      sign.current.value = null;
    }
  };

  console.log(selectedRow)

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setCompany_no(selectedRow.company_no || "");
      setCompany_name(selectedRow.company_name || "");
      setShort_name(selectedRow.short_name || "");
      setAddress1(selectedRow.address1 || "");
      setAddress2(selectedRow.address2 || "");
      setAddress3(selectedRow.address3 || "");
      setcompany_gst_no(selectedRow.company_gst_no || "");
      setSelectedCity({
        label: selectedRow.city,
        value: selectedRow.city,
      });
      setCity(selectedRow.city || "")
      setselectedState({
        label: selectedRow.state,
        value: selectedRow.state,
      });
      setState(selectedRow.state || "")
      setselectedCountry({
        label: selectedRow.country,
        value: selectedRow.country,
      });
      setCountry(selectedRow.country || "")
      setselectedStatus({
        label: selectedRow.status,
        value: selectedRow.status,
      });
      setStatus(selectedRow.status || '')
      setselectedLocation({
        label: selectedRow.location_no,
        value: selectedRow.location_no,
      });
      setlocation_no(selectedRow.location_no || "")
      setPincode(selectedRow.pincode || "");
      setEmail_id(selectedRow.email_id || "");
      setWebsiteURL(selectedRow.websiteURL || "");
      setContact_no(selectedRow.contact_no || "");
      setAnnualReportURL(selectedRow.annualReportURL || "");

      if (selectedRow.foundedDate) {
        const formattedDate = new Date(selectedRow.foundedDate).toISOString().split("T")[0];
        setFoundedDate(formattedDate);
      } else {
        setFoundedDate("");
      }

      if (selectedRow.company_logo && selectedRow.company_logo.data) {
        const base64Image = arrayBufferToBase64(selectedRow.company_logo.data);
        const file = base64ToFile(`data:image/jpeg;base64,${base64Image}`, 'company_logo.jpg');
        setSelectedImage(`data:image/jpeg;base64,${base64Image}`);
        setCompanyImage(file)
      } else {
        setSelectedImage(null);
      }

      if (selectedRow.authorisedSignatur && selectedRow.authorisedSignatur.data) {
        const base64Image = arrayBufferToBase64(selectedRow.authorisedSignatur.data);
        const file = base64ToFile(`data:image/jpeg;base64,${base64Image}`, 'authorisedSignatur.jpg');
        setselectedSignatureImage(`data:image/jpeg;base64,${base64Image}`);
        setSignatureImage(file)
      } else {
        setselectedSignatureImage(null);
      }

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  const base64ToFile = (base64Data, fileName) => {
    if (!base64Data || !base64Data.startsWith("data:")) {
      throw new Error("Invalid base64 string");
    }

    const parts = base64Data.split(',');
    if (parts.length !== 2) {
      throw new Error("Base64 string is not properly formatted");
    }

    const mimePart = parts[0];
    const dataPart = parts[1];

    const mime = mimePart.match(/:(.*?);/);
    if (!mime || !mime[1]) {
      throw new Error("Could not extract MIME type");
    }

    const binaryString = atob(dataPart);
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const fileBlob = new Blob([uint8Array], { type: mime[1] });
    return new File([fileBlob], fileName, { type: mime[1] });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.warning('File size exceeds 1MB. Please upload a smaller file.');
        event.target.value = null;
        return;
      }
      setSelectedImage(URL.createObjectURL(file));
      setCompanyImage(file);
    }
  };

  const handleFileSignature = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.warning('File size exceeds 1MB. Please upload a smaller file.');
        event.target.value = null;
        return;
      }
      setselectedSignatureImage(URL.createObjectURL(file));
      setSignatureImage(file);
    }
  };

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
    fetch(`${config.apiBaseUrl}/locationno`)
      .then((data) => data.json())
      .then((val) => setLocationdrop(val));
  }, []);

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

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionLocation = locationnodrop.map((option) => ({
    value: option.location_no,
    label: `${option.location_no} - ${option.location_name}`,
  }));

  const handleChangeCity = (selectedCity) => {
    setSelectedCity(selectedCity);
    setCity(selectedCity ? selectedCity.value : '');
  };

  const handleChangeState = (selectedState) => {
    setselectedState(selectedState);
    setState(selectedState ? selectedState.value : '');
  };

  const handleChangeCountry = (selectedCountry) => {
    setselectedCountry(selectedCountry);
    setCountry(selectedCountry ? selectedCountry.value : '');
  };

  const handleChangeStatus = (selectedStatus) => {
    setselectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleChangeLocation = (selectedLocation) => {
    setselectedLocation(selectedLocation);
    setlocation_no(selectedLocation ? selectedLocation.value : '');
  };

  const handleInsert = async () => {
    if (
      !company_no ||
      !company_name ||
      !address1 ||
      !address2 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !email_id ||
      !status ||
      !contact_no ||
      !location_no
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("company_no", company_no);
      formData.append("company_name", company_name);
      formData.append("short_name", short_name);
      formData.append("address1", address1);
      formData.append("address2", address2);
      formData.append("address3", address3);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("country", country);
      formData.append("email_id", email_id);
      formData.append("status", status);
      formData.append("foundedDate", foundedDate);
      formData.append("contact_no", contact_no);
      formData.append("annualReportURL", annualreportURL);
      formData.append("websiteURL", websiteURL);
      formData.append("location_no", location_no);
      formData.append("company_gst_no", company_gst_no);
      formData.append("created_by", sessionStorage.getItem('selectedUserCode'));

      if (companyImage) {
        formData.append("company_logo", companyImage);
      }

      if (SignatureImage) {
        formData.append("authorisedSignatur", SignatureImage);
      }

      const response = await fetch(`${config.apiBaseUrl}/add`, {
        method: "POST",
        body: formData,
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
        toast.warning(errorResponse.message, {
        });
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message, {
      });
    } finally {
      setLoading(false);
    }
  };

  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }

  const handleClick = () => {
    navigate('/Company');
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
      !company_no ||
      !company_name ||
      !address1 ||
      !address2 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !email_id ||
      !status ||
      !contact_no ||
      !location_no
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("company_no", company_no);
      formData.append("company_name", company_name);
      formData.append("short_name", short_name);
      formData.append("address1", address1);
      formData.append("address2", address2);
      formData.append("address3", address3);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("country", country);
      formData.append("email_id", email_id);
      formData.append("status", status);
      formData.append("foundedDate", foundedDate);
      formData.append("contact_no", contact_no);
      formData.append("annualReportURL", annualreportURL);
      formData.append("websiteURL", websiteURL);
      formData.append("location_no", location_no);
      formData.append("company_gst_no", company_gst_no);
      formData.append("modified_by", sessionStorage.getItem('selectedUserCode'));

      if (companyImage) {
        formData.append("company_logo", companyImage);
      }

      if (SignatureImage) {
        formData.append("authorisedSignatur", SignatureImage);
      }

      const response = await fetch(`${config.apiBaseUrl}/CompanyUpdate`, {
        method: "POST",
        body: formData,
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


  return (
    <div className="container-fluid h-100">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      {loading && <LoadingScreen />}
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Company' : 'Add Company'}</h4> </div>
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
            <label className={`fw-bold ${error && !company_no ? 'text-danger' : ''}`}>Company No<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the company code"
              value={company_no}
              onChange={(e) => setCompany_no(e.target.value)}
              maxLength={18}
              ref={companycode}
              onKeyDown={(e) => handleKeyDown(e, companyname, companycode)}
              readOnly={mode === "update"}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !company_name ? 'text-danger' : ''}`}>Company Name<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the company name"
              value={company_name}
              onChange={(e) => setCompany_name(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, shortname, companyname)}
              maxLength={250}
              ref={companyname}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Short Name</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the short name"
              value={short_name}
              onChange={(e) => setShort_name(e.target.value)}
              maxLength={250}
              ref={shortname}
              onKeyDown={(e) => handleKeyDown(e, Address1, shortname)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !address1 ? 'text-danger' : ''}`}>Address 1<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the address"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              maxLength={250}
              ref={Address1}
              onKeyDown={(e) => handleKeyDown(e, Address2, Address1)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !address2 ? 'text-danger' : ''}`}>Address 2<span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the address"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
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
              value={address3}
              onChange={(e) => setAddress3(e.target.value)}
              maxLength={250}
              ref={Address3}
              onKeyDown={(e) => handleKeyDown(e, City, Address3)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedCity ? 'text-danger' : ''}`}>
  City<span className="text-danger">*</span>
</label>
            <div title="Please select the city">
            <Select
              type="text"
              value={selectedCity}
              onChange={handleChangeCity}
              options={filteredOptionCity}
              className=""
              placeholder=""
              classNamePrefix="react-select"
              ref={City}
              onKeyDown={(e) => handleKeyDown(e, State, City)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedState ? 'text-danger' : ''}`}>State<span className="text-danger">*</span></label>
            <div title="Please select the state">
            <Select
              type="text"
              value={selectedState}
              onChange={handleChangeState}
              options={filteredOptionState}
              className=""
              placeholder=""
              classNamePrefix="react-select"
              ref={State}
              onKeyDown={(e) => handleKeyDown(e, Pincode, State)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !pincode ? 'text-danger' : ''}`}>Pin Code<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the pin code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              maxLength={8}
              ref={Pincode}
              onKeyDown={(e) => handleKeyDown(e, Country, Pincode)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedCountry ? 'text-danger' : ''}`}>Country<span className="text-danger">*</span></label>
            <div title="Please select the country">
            <Select
              type="text"
              className=""
              value={selectedCountry}
              onChange={handleChangeCountry}
              options={filteredOptionCountry}
              placeholder=""
              classNamePrefix="react-select"
              ref={Country}
              onKeyDown={(e) => handleKeyDown(e, Email, Country)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !email_id ? 'text-danger' : ''}`}>Email<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="email"
              placeholder=""
              required title="Please enter the email ID"
              value={email_id}
              onChange={(e) => setEmail_id(e.target.value)}
              maxLength={150}
              ref={Email}
              onKeyDown={(e) => handleKeyDown(e, Status, Email)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
            <div title="Please select the status">
            <Select
              className=""
              value={selectedStatus}
              onChange={handleChangeStatus}
              options={filteredOptionStatus}
              placeholder=""
              classNamePrefix="react-select"
              ref={Status}
              onKeyDown={(e) => handleKeyDown(e, found, Status)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Founded Date</label>
            <input
              className="form-control"
              type="date"
              placeholder=""
              required title="Please enter the founded date"
              value={foundedDate}
              ref={found}
              onChange={(e) => setFoundedDate(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Website URL</label>
            <input
              className="form-control"
              type="url"
              placeholder=""
              required title="Please enter the website URL"
              value={websiteURL}
              onChange={(e) => setWebsiteURL(e.target.value)}
              maxLength={150}
              ref={WebsiteUrl}
              onKeyDown={(e) => handleKeyDown(e, ContactNo, WebsiteUrl)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !contact_no ? 'text-danger' : ''}`}>Contact No<span className="text-danger">*</span></label>
            <input
              className="form-control"
              type="number"
              placeholder=""
              required title="Please enter the contact number"
              value={contact_no}
              onChange={(e) => setContact_no(e.target.value.replace(/\D/g, '').slice(0, 15))}
              ref={ContactNo}
              maxLength={15}
              onKeyDown={(e) => handleKeyDown(e, annaual, ContactNo)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Annual Report URL</label>
            <input
              className="form-control"
              type="textarea"
              placeholder=""
              required title="Please enter the annual report URL"
              value={annualreportURL}
              onChange={(e) => setAnnualReportURL(e.target.value)}
              maxLength={150}
              ref={annaual}
              onKeyDown={(e) => handleKeyDown(e, companyGST, annaual)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>GST No</label>
            <input
              type="text"
              className="form-control"
              placeholder=""
              required title="Please enter the GST number"
              value={company_gst_no}
              onChange={(e) => setcompany_gst_no(e.target.value)}
              maxLength={15}
              ref={companyGST}
              onKeyDown={(e) => handleKeyDown(e, locatioN, companyGST)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedLocation ? 'text-danger' : ''}`}>Location No<span className="text-danger">*</span></label>
            <div title="Please select the location no">
            <Select
              type="text"
              className=""
              value={selectedLocation}
              onChange={handleChangeLocation}
              options={filteredOptionLocation}
              placeholder=""
              classNamePrefix="react-select"
              ref={locatioN}
              onKeyDown={(e) => handleKeyDown(e, logo, locatioN)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Logo</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileSelect}
              ref={logo}
              onKeyDown={(e) => handleKeyDown(e, sign, logo)}
            />
          </div>
          {selectedImage && (
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <img
                  src={selectedImage}
                  alt="Selected Preview"
                  className="avatar rounded sm mt-4"
                  style={{ height: '220px', width: '220px' }}
                />
              </div>
            </div>
          )}
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Signature</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileSignature}
              ref={sign}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); 
                  if (mode === "update") {
                    handleUpdate();  
                  } else {
                    handleInsert();  
                  }
                }
              }}
            />
          </div>
          {selectedSignatureImage && (
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <img
                  src={selectedSignatureImage}
                  alt="Selected Preview"
                  className="avatar rounded sm mt-4"
                  style={{ height: '220px', width: '220px' }}
                />
              </div>
            </div>
          )}
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
