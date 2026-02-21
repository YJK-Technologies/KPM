import React, { useState, useEffect, useRef } from 'react';
import './Settings.css'
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage"; 

const config = require('../ApiConfig');

const PurchaseSetting = () => {
  // Example state for settings


  const [payType, setPayType] = useState("");
  const [paydrop, setPaydrop] = useState([]);
  const [PrintTemplate, setPrintTemplate] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [salesdrop, setSalesdrop] = useState([]);
  const [orderdrop, setOrderdrop] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouse, setwarehouse] = useState("");
  const [warehouseDrop, setWarehouseDrop] = useState([]);
  const [printdrop, setprintdrop] = useState([]);
  const [copiesdrop, setcopiesdrop] = useState([]);
  const [error, setError] = useState("");
  const [Type, setType] = useState("purchase");
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('')
  const [vendorCode, setVendorCode] = useState('');
  const [vendorname, setVendorname] = useState('');
  const [selectedPay, setSelectedPay] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState('');
  const [vendorcodedrop, setvendorcodedrop] = useState([]);
  const [purchaseType, setPurchaseType] = useState("");
  const [purchasedrop, setPurchasedrop] = useState([]);
  const [Shiping_to, setShiping_to] = useState("");
  const [Print, setPrint] = useState(null);
  const [Copies, setCopies] = useState(null);
  const [selectedPrint, setselectedPrint] = useState(null);
  const [selectedCopies, setselectedCopies] = useState(null);
  const navigate = useNavigate();

  const handleChange = (selectedOption) => {
    setSelectedCode(selectedOption);
    setVendorCode(selectedOption ? selectedOption.value : '');
    const VendorName = selectedOption ? selectedOption.label.split(' - ')[1] : '';
    setSelectedUserName(VendorName);
    setVendorname(VendorName);
  };

  const filteredOptionCode = vendorcodedrop.map((option) => ({
    value: option.vendor_code,
    label: `${option.vendor_code} - ${option.vendor_name}`,
  }));

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    const fetchVendor = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/vendorCodeDropdown`, {
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

  const handleChangePurchase = (selectedOption) => {
    setSelectedPurchase(selectedOption);
    setPurchaseType(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionPurchase = purchasedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    const companyCode = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/purchasetype`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => setPurchasedrop(data))
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const handleChangePay = (selectedOption) => {
    setSelectedPay(selectedOption);
    setPayType(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/PrintTemplates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Screen_Type: Type
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const templates = data.map((item) => {
            const byteArray = new Uint8Array(item.Templates.data);
            const blob = new Blob([byteArray], { type: "image/png" });
            const imageUrl = URL.createObjectURL(blob);
            return {
              keyfield: item.Key_field,
              image: imageUrl,
            };
          });
          setPrintTemplate(templates);
        }
      })
      .catch((error) =>
        console.error("Error fetching print templates:", error)
      );
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? PrintTemplate.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === PrintTemplate.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const companyCode = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/paytype`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => setPaydrop(data))
      .catch((error) => console.error("Error fetching payment types:", error));

    fetch(`${config.apiBaseUrl}/salestype`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => setSalesdrop(data))
      .catch((error) => console.error("Error fetching sales types:", error));

    fetch(`${config.apiBaseUrl}/ordertype`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => setOrderdrop(data))
      .catch((error) => console.error("Error fetching Order type:", error));
  }, []);

  const handleChangeWarehouse = (selectedOption) => {
    setSelectedWarehouse(selectedOption);
    setwarehouse(selectedOption ? selectedOption.value : '');
  };

  const handleChangePrint = (selectedOption) => {
    setselectedPrint(selectedOption);
    setPrint(selectedOption ? selectedOption.value : '');
  };

  const handleChangeCopeies = (selectedOption) => {
    setselectedCopies(selectedOption);
    setCopies(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionWarehouse = Array.isArray(warehouseDrop) ? warehouseDrop.map((option) => ({
    value: option.warehouse_code,
    label: option.warehouse_code,
  })) : [];

  const filteredOptionPrint = Array.isArray(printdrop) ? printdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  })) : [];

  const filteredOptionCopies = Array.isArray(copiesdrop) ? copiesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  })) : [];

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        const { pay_type, Party_code,Print_copies, Print_options,warehouse_code, Transaction_type, Party_name } = data[0];

         const setDefault = (type, setType, options, setSelected) => {
          if (type !== undefined && type !== null) {
            const typeStr = type.toString();
            setType(typeStr);
            setSelected(options.find((opt) => opt.value === typeStr) || null);
          }
        };

        setDefault(pay_type, setPayType, filteredOptionPay, setSelectedPay);
        setDefault(Party_code, setVendorCode, filteredOptionCode, setSelectedCode);
        setDefault(warehouse_code, setwarehouse, filteredOptionWarehouse, setSelectedWarehouse);
        setDefault(Transaction_type, setPurchaseType, filteredOptionPurchase, setSelectedPurchase);
        setDefault(Print_options, setPrint, filteredOptionPrint, setselectedPrint);
        setDefault(Print_copies, setCopies, filteredOptionCopies, setselectedCopies);
        if (Party_name) setVendorname(Party_name);  // Set vendor name if available
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [paydrop, orderdrop,copiesdrop,printdrop, warehouseDrop, purchasedrop, Type]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getwarehousedrop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setWarehouseDrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getPrint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setprintdrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getcopies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setcopiesdrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);

  const handleSaveButtonClick = async () => {
    if (!selectedCode || !selectedPrint|| !selectedCopies|| !vendorname || !selectedPay || !selectedPurchase || !selectedWarehouse) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    try {
      const selectedTemplate = PrintTemplate[currentIndex];
      const selectedKeyField = selectedTemplate ? selectedTemplate.keyfield : "";

      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        Party_code: vendorCode,
        Party_name: vendorname,
        pay_type: selectedPay?.value,
        Transaction_type: selectedPurchase?.value,
        warehouse_code: selectedWarehouse?.value,
        Screen_Type: Type,
        Shiping_to: Shiping_to,
        Print_options: Print,
        Print_copies: Copies,
        Print_templates: selectedKeyField,
        created_by: sessionStorage.getItem('selectedUserCode')
      };
      const response = await fetch(`${config.apiBaseUrl}/AddTransactionSettinngs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        toast.success("purchase Settings  Data inserted Successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert purchase data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    }
  };

  const handleNavigate = () => {
    navigate("/Purchase");
  };

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-3 bg-body-tertiary rounded  ">
        <div className=" mb-0 d-flex justify-content-between" >
          <div className='d-flex justify-content-start'> <h4 className="mb-5 ms-3  fw-semibold text-dark fs-2 fw-bold">Purchase Settings</h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='col-md-12 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' onClick={handleNavigate} title="Close" style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </a>
            </div>
          </div>
        </div>
        <div class="pt-2 mb-4">
          <div className="row  ms-3 me-3">
            <div className="col-md-3 mb-3">
              <label className={`fw-bold ${error && !selectedCode ? 'text-danger' : ''}`}>Vendor Code  <span className="text-danger">*</span></label>
              <Select
                className="exp-input-field"
                id='vendorCode'
                required
                value={selectedCode}
                options={filteredOptionCode}
                maxLength={18}
                onChange={handleChange}
                // onKeyPress={handleKeyPress}
                autoComplete="off"
              />
            </div>
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className={`fw-bold`}>Vendor Name </label>
                <input
                  className="exp-input-field form-control"
                  id="vendorname"
                  required
                  value={vendorname}
                  onChange={(e) => setVendorname(e.target.value)}
                />
                
              </div>
            </div>
            <div className="col-md-3 form-group mb-2 ">
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedPay ? 'text-danger' : ''}`}> Pay Type<span className="text-danger">*</span></label>
                <Select
                  id="payType"
                  value={selectedPay}
                  onChange={handleChangePay}
                  options={filteredOptionPay}
                  className="exp-input-field"
                  placeholder=""
                  required
                  data-tip="Please select a payment type"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <label className={`fw-bold ${error && !selectedPurchase ? 'text-danger' : ''}`}> Purchase Type<span className="text-danger">*</span></label>
                <Select
                  id="purchaseType"
                  value={selectedPurchase}
                  onChange={handleChangePurchase}
                  options={filteredOptionPurchase}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedWarehouse ? 'text-danger' : ''}`}> Default Warehouse<span className="text-danger">*</span></label>
                <Select
                  id="returnType"
                  className="exp-input-field"
                  placeholder=""
                  required
                  value={selectedWarehouse}
                  onChange={handleChangeWarehouse}
                  options={filteredOptionWarehouse}
                  data-tip="Please select a default warehouse"
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" >
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedPrint ? 'text-danger' : ''}`}> Print Options<span className="text-danger">*</span></label>
                <Select
                  className="exp-input-field "
                  id="customername"
                  placeholder=""
                  required
                  value={selectedPrint}
                  onChange={handleChangePrint}
                  options={filteredOptionPrint}
                  data-tip="Please select a default Options"
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" >
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedCopies ? 'text-danger' : ''}`}> Print Copies<span className="text-danger">*</span></label>
                <Select
                  className="exp-input-field "
                  id="customername"
                  placeholder=""
                  required
                  value={selectedCopies}
                  onChange={handleChangeCopeies}
                  options={filteredOptionCopies}
                  data-tip="Please select a default Copy"
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" style={{ display: "none" }}>
              <div className="exp-form-floating">
                <label id="customer">Screen Type</label>
                <input
                  className="exp-input-field form-control"
                  id="customername"
                  required
                  value={Type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>
              <div className="col-md-3 form-group mb-2" style={{ display: "none" }}>
                <div className="exp-form-floating">
                  <label id="customer">Shipping To</label>
                  <input
                    className="exp-input-field form-control"
                    id="customername"
                    required
                    value={Shiping_to}
                    onChange={(e) => setShiping_to(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
         <div className="col-md-3 d-flex flex-column justify-content-between align-items-center h-100">
  {/* Preview + Navigation */}
  <div className="position-relative d-flex justify-content-center my-4">
    {/* Left Arrow */}
    <button
      className="nav-arrow btn btn-light rounded-1 position-absolute start-0 top-50 translate-middle-y"
      onClick={handlePrev}
      disabled={PrintTemplate.length === 0}
    >
      ❮
    </button>

    {/* Preview Box */}
    <div className="template-preview-box border rounded shadow-sm py-2">
      {PrintTemplate.length > 0 ? (
        <img
          src={PrintTemplate[currentIndex].image}
          alt="Template"
          className="preview-image"
          style={{ maxWidth: "100%", maxHeight: "200px" }}
        />
      ) : (
        <div className="placeholder-text">No Preview Available</div>
      )}
    </div>

    {/* Right Arrow */}
    <button
      className="nav-arrow btn btn-light rounded-1  position-absolute end-0 top-50 translate-middle-y"
      onClick={handleNext}
      disabled={PrintTemplate.length === 0}
    >
      ❯
    </button>
  </div>

  {/* Template Info Text at Bottom */}
  <div className="mt-auto text-center small text-muted mb-2">
    Template {PrintTemplate.length > 0 ? currentIndex + 1 : 0} of {PrintTemplate.length}
  </div>
</div>

            <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
              <button className="btn btn-primary" onClick={handleSaveButtonClick} title="Save">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSetting;
