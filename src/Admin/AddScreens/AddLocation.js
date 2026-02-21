import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import React,{useState,useRef,useEffect} from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '../../BookLoader';
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
import secureLocalStorage from "react-secure-storage"; 

// Use a single modern theme

import '../../App.css';
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


const VendorProductTable = () => {
  const navigate = useNavigate();

  const handleClick = () => { navigate('/Location'); };
  const [location_no, setlocation_no] = useState(""); 
  const [location_name, setlocation_name] = useState(""); 
  const [short_name, setshort_name] = useState("");
  const [address1, setaddress1] = useState("");
  const [address2, setaddress2] = useState("");  
  const [address3, setaddress3] = useState(""); 
  const [selectedCity, setSelectedCity] = useState(""); 
  const [city, setcity] = useState(""); 
  const [selectedState, setselectedState] = useState(""); 
  const [state, setstate] = useState("");
  const [pincode, setpincode] = useState("");
  const [selectedCountry, setselectedCountry] = useState("");
  const [country, setcountry] = useState("");
  const [statedrop, setstatedrop] = useState([]);
  const [drop, setdrop] = useState([]);
  const [condrop, setcondrop] = useState([]);
  const [email_id, setemail_id] = useState("");
  const [selectedStatus, setselectedStatus] = useState("");
  const [status, setstatus] = useState("");
  const [statusdrop, setstatusdrop] = useState([]);
  const [contact_no, setcontact_no] = useState("");
  const [isUpdated, setIsUpdated] = useState(false); 
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  
  const [error, setError] = useState("");
  const locationno = useRef(null);
  const locationname = useRef(null);
  const shortname = useRef(null);
  const address = useRef(null);
  const AddresS2 = useRef(null);
  const Address3 = useRef(null);
  const City = useRef(null);
  const State = useRef(null);
  const Pincode = useRef(null);
  const Country = useRef(null);
  const email = useRef(null);
  const Status = useRef(null);
  const Contactno = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const config = require("../../ApiConfig");
  const created_by = sessionStorage.getItem("selectedUserCode");
  const modified_by = sessionStorage.getItem("selectedUserCode");
  
  const handleKeyDown = async (
    e,
    nextFieldRef,
    value,
    hasValueChanged,
    setHasValueChanged
  ) => {
    if (e.key === "Enter") {
      // Check if the value has changed and handle the search logic
      if (hasValueChanged) {
        await handleKeyDownStatus(e); // Trigger the search function
        setHasValueChanged(false); // Reset the flag after the search
      }

      // Move to the next field if the current field has a valid value
      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault(); // Prevent moving to the next field if the value is empty
      }
    }
  };

  const clearInputFields = () => {
    setlocation_no("");
    setlocation_name("");
    setshort_name("");
    setaddress1("");
    setaddress2("");
    setaddress3("");
    setSelectedCity(null);
    setselectedState(null);
    setselectedCountry(null);
    setselectedStatus(null);
    setpincode("");
    setemail_id("");
    setcontact_no("");
  };


    useEffect(() => {
      if (mode === "update" && selectedRow && !isUpdated) {
        setlocation_no(selectedRow.location_no || "");
        setlocation_name(selectedRow.location_name || "");
        setshort_name(selectedRow.short_name || "");
        setaddress1(selectedRow.address1 || "");
        setaddress2(selectedRow.address2 || "");
        setaddress3(selectedRow.address3 || "");
        setSelectedCity({
          label: selectedRow.city,
          value: selectedRow.city,
        });
        setselectedState({
          label: selectedRow.state,
          value: selectedRow.state,
        });
        setselectedCountry({
          label: selectedRow.country,
          value: selectedRow.country,
        });
        setselectedStatus({
          label: selectedRow.status,
          value: selectedRow.status,
        });
        setpincode(selectedRow.pincode || "");
        setemail_id(selectedRow.email_id || "");
        setcontact_no(selectedRow.contact_no || "");
      } else if (mode === "create") {
        clearInputFields();
      }
    }, [mode, selectedRow, isUpdated]);

  const handleKeyDownStatus = async (e) => {
    if (e.key === "Enter" && hasValueChanged) {
      // Only trigger search if the value has changed
      // Trigger the search function
      setHasValueChanged(false); // Reset the flag after search
    }
  };

  const handleChangeCity = (selectedCity) => {
    setSelectedCity(selectedCity);
    setcity(selectedCity ? selectedCity.value : "");
  };

  const handleChangeState = (selectedState) => {
    setselectedState(selectedState);
    setstate(selectedState ? selectedState.value : "");
  };

  const filteredOptionState = statedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeCountry = (selectedCountry) => {
    setselectedCountry(selectedCountry);
    setcountry(selectedCountry ? selectedCountry.value : "");
  };

  const filteredOptionCity = drop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));
  
  const filteredOptionCountry = condrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

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
      .then((val) => setcondrop(val))
      .catch((error) => console.error('Error fetching data:', error));
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
      .then((val) => setdrop(val))
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
      .then((val) => setstatedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  const handleChangeStatus = (selectedStatus) => {
    setselectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : "");
  };

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


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
      .then((val) => setstatusdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  
  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }

  const handleInsert = async () => {
    //   if (validateInputs()) {
    if (
      !location_no ||
      !location_name ||
      !address1 ||
      !address2 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !email_id ||
      !status ||
      !contact_no ||
      !short_name
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    // Email validation
    if (!validateEmail(email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addlocationinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location_no,
          location_name,
          short_name,
          address1,
          address2,
          address3,
          city,
          state,
          pincode,
          country,
          email_id,
          status,
          contact_no,
          created_by: sessionStorage.getItem("selectedUserCode"),
        }),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(), // Reloads the page after the toast closes
          });
        }, 1000);
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        //setError(errorResponse.error);
        toast.warning(errorResponse.message, {

        });
      } else {
        console.error("Failed to insert data");
        toast.error('Failed to insert data', {

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

  const handleUpdate = async () => {
    if (
      !location_no ||
      !location_name ||
      !address1 ||
      !selectedCity ||
      !selectedState ||
      !pincode ||
      !selectedCountry ||
      !email_id ||
      !selectedStatus ||
      !contact_no ||
      !short_name
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
      const response = await fetch(`${config.apiBaseUrl}/LocationUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location_no,
          location_name,
          short_name,
          address1,
          address2,
          address3,
          city: selectedCity.value,
          state: selectedState.value,
          pincode,
          country: selectedCountry.value,
          email_id,
          status: selectedStatus.value,
          contact_no,
          created_by,
          modified_by,
        }),
      });
      if (response.status === 200) {
        console.log("Data Updated successfully");
        setIsUpdated(true);
        clearInputFields();
        toast.success("Data Updated successfully!")
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      } else {
        console.error("Failed to insert data");
        toast.error("Failed to Update data");
      }
    } catch (error) {
      console.error("Error Update data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{mode === "update" ? 'Update Location' : 'Add Location'}</h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='col-md-12 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' title=" Close" onClick={handleClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !location_no ? 'text-danger' : ''}`}>Location No<span className="text-danger">*</span></label>
            <input
              id="locno"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the location number"
              value={location_no}
              readOnly={mode === "update"}
              onChange={(e) => setlocation_no(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, locationname, locationno)
              }
              ref={locationno}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !location_name ? 'text-danger' : ''}`}>Location Name<span className="text-danger">*</span></label>
            <input
              id="locname"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the location name"
              value={location_name}
              onChange={(e) => setlocation_name(e.target.value)}
              maxLength={250}
              onKeyDown={(e) =>
                handleKeyDown(e, shortname, locationname)
              }
              ref={locationname}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !short_name ? 'text-danger' : ''}`}>Short Name<span className="text-danger">*</span></label>
            <input
              id="srtname"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the short name"
              value={short_name}
              onChange={(e) => setshort_name(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, address, shortname)
              }
              maxLength={250}
              ref={shortname}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !address1 ? 'text-danger' : ''}`}>Address 1<span className="text-danger">*</span></label>
            <input
              id="address1"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the address"
              value={address1}
              onChange={(e) => setaddress1(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, AddresS2, address)}
              ref={address}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !address2 ? 'text-danger' : ''}`}>Address 2<span className="text-danger">*</span></label>
            <input
              id="address2"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the address"
              value={address2}
              ref={AddresS2}
              onKeyDown={(e) =>
                handleKeyDown(e, Address3, AddresS2)
              }
              onChange={(e) => setaddress2(e.target.value)}
              maxLength={250}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className= "fw-bold">Address 3</label>
            <input
              id="address3"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the address"
              value={address3}
              ref={Address3}
              onChange={(e) => setaddress3(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, City, Address3)}
              maxLength={250}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedCity ? 'text-danger' : ''}`}>City<span className="text-danger">*</span></label>
            <div title="Please select the city">
            <Select
              id="city"
              value={selectedCity}
              onChange={handleChangeCity}
              options={filteredOptionCity}
              className="exp-input-field"
              classNamePrefix="react-select"
              placeholder=""
              maxLength={100}
              ref={City}
              onKeyDown={(e) =>
                handleKeyDown(e,State,City,hasValueChanged,setHasValueChanged)
              }
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
              className="exp-input-field"
              placeholder=""
              classNamePrefix="react-select"
              maxLength={100}
              ref={State}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  Pincode,
                  State,
                  hasValueChanged,
                  setHasValueChanged
                )
              }
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !pincode ? 'text-danger' : ''}`}>Pin Code<span className="text-danger">*</span></label>
            <input
              id="pincode"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the Pin code"
              value={pincode}
              onKeyDown={(e) => handleKeyDown(e, Country, Pincode)}
              ref={Pincode}
              onChange={(e) =>
                setpincode(
                  e.target.value.replace(/\D/g, "").slice(0, 13)
                )
              }
              maxLength={8}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedCountry ? 'text-danger' : ''}`}>Country<span className="text-danger">*</span></label>
            <div title="Please select the country">
            <Select
              id="country"
              value={selectedCountry}
              onChange={handleChangeCountry}
              options={filteredOptionCountry}
              className="exp-input-field"
              placeholder=""
              classNamePrefix="react-select"
              maxLength={100}
              ref={Country}
              onKeyDown={(e) => handleKeyDown(e, email, Status)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !email_id ? 'text-danger' : ''}`}>Email<span className="text-danger">*</span></label>
            <input
              id="emailid"
              class="exp-input-field form-control"
              type="text"
              placeholder=""
              required
              title="Please enter the email ID"
              value={email_id}
              onChange={(e) => setemail_id(e.target.value)}
              maxLength={150}
              ref={email}
              onKeyDown={(e) => handleKeyDown(e, Status, email)}
            />{" "}
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
            <div title="Please select the status">
            <Select
              id="status"
              value={selectedStatus}
              onChange={handleChangeStatus}
              options={filteredOptionStatus}
              className="exp-input-field"
              placeholder=""
              classNamePrefix="react-select"
              ref={Status}
              onKeyDown={(e) => handleKeyDown(e, Contactno, Status)}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !contact_no ? 'text-danger' : ''}`}>Contact No<span className="text-danger">*</span></label>
            <input
              id="conno"
              class="exp-input-field form-control"
              type="number"
              placeholder=""
              required
              title="Please enter the contact number"
              value={contact_no}
              ref={Contactno}
              maxLength={15}
              onChange={(e) =>
                setcontact_no(
                  e.target.value.replace(/\D/g, "").slice(0, 15)
                )
              }
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
                <label className='fw-bold'>Created By </label>
                <input
                  id="emailid"
                  class="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={created_by}
                />
              </>
            ) : (
              <>
                <label className='fw-bold'> Modified By </label>
                <input
                  id="emailid"
                  class="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={modified_by}
                />
              </>
            )}
          </div> */}
          <div class="col-md-2 mb-2 mt-4">
            {mode === "create" ? (
              <button
                className="btn btn-primary"
                onClick={handleInsert}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="submit"
              >
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
    </div>
  );
};

export default VendorProductTable;
