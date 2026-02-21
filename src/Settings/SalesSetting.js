import { useState, useEffect } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import './Settings.css';
import secureLocalStorage from "react-secure-storage"; 
const config = require('../ApiConfig');

const SalesSettings = () => {
  const [PrintTemplate, setPrintTemplate] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPay, setSelectedPay] = useState(null);
  const [payType, setPayType] = useState("");
  const [paydrop, setPaydrop] = useState([]);
  const [selectedSales, setSelectedSales] = useState(null);
  const [salesdrop, setSalesdrop] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [salesType, setSalesType] = useState("");
  const [orderdrop, setOrderdrop] = useState([]);
  const [orderType, setOrderType] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedStock, setselectedStock] = useState(null);
  const [Stock, setStock] = useState(null);
  const [Print, setPrint] = useState(null);
  const [Copies, setCopies] = useState(null);
  const [selectedPrint, setselectedPrint] = useState(null);
  const [selectedCopies, setselectedCopies] = useState(null);
  const [warehouse, setwarehouse] = useState("");
  const [warehouseDrop, setWarehouseDrop] = useState([]);
  const [stockDrop, setstockDrop] = useState([]);
  const [printdrop, setprintdrop] = useState([]);
  const [copiesdrop, setcopiesdrop] = useState([]);
  const [error, setError] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [Type, setType] = useState("sales");
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('')
  const [customercodedrop, setcustomercodedrop] = useState([]);
  const [selectedSalesMode, setSelectedSalesMode] = useState(null);
  const [salesModeDrop, setSalesModeDrop] = useState([]);
  const [salesMode, setSalesMode] = useState('');
  const navigate = useNavigate();

  const handleChangeSalesMode = (selectedSalesMode) => {
    setSelectedSalesMode(selectedSalesMode);
    setSalesMode(selectedSalesMode ? selectedSalesMode.value : '');
    setError(false);
  };

  const filteredOptionSalesMode = Array.isArray(salesModeDrop)
    ? salesModeDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getSalesMode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSalesModeDrop(data);
        if (data.length > 0) {
          const firstOption = {
            value: data[0].attributedetails_name,
            label: data[0].attributedetails_name,
          };
          setSelectedSalesMode(firstOption);
          setSalesMode(firstOption.value);
        }
      })
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const handleChange = (selectedOption) => {
    setSelectedCode(selectedOption);
    setCustomerCode(selectedOption ? selectedOption.value : '');
    const customerName = selectedOption ? selectedOption.label.split(' - ')[1] : '';
    setSelectedUserName(customerName);
    setCustomerName(customerName);
  };

  const filteredOptionCode = customercodedrop.map((option) => ({
    value: option.customer_code,
    label: `${option.customer_code} - ${option.customer_name}`,
  }));

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    const fetchcustomercode = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/customerCodeDropdown`, {
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
        setcustomercodedrop(val);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    if (company_code) {
      fetchcustomercode();
    }
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
    fetch(`${config.apiBaseUrl}/paytype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
    })
      .then((response) => response.json())
      .then((data) => setPaydrop(data))
      .catch((error) => console.error("Error fetching payment types:", error));

    fetch(`${config.apiBaseUrl}/salestype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setSalesdrop(data))
      .catch((error) => console.error("Error fetching sales types:", error));

    fetch(`${config.apiBaseUrl}/ordertype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
    })
      .then((response) => response.json())
      .then((data) => setOrderdrop(data))
      .catch((error) => console.error("Error fetching Order type:", error));

  }, []);

  const handleChangeSales = (selectedOption) => {
    setSelectedSales(selectedOption);
    setSalesType(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionSales = salesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  const handleChangeOrder = (selectedOption) => {
    setSelectedOrder(selectedOption);
    setOrderType(selectedOption ? selectedOption.value : '');

  };

  const filteredOptionOrder = orderdrop.map((option) => {
    const words = option.attributedetails_name.trim().split(/\s+/);

    const formattedName = words.map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word.toLowerCase();
      }
    }).join(' ');

    return {
      value: formattedName,
      label: formattedName,
    };
  });

  const handleChangeWarehouse = (selectedOption) => {
    setSelectedWarehouse(selectedOption);
    setwarehouse(selectedOption ? selectedOption.value : '');

  };

  const handleChangeStock = (selectedOption) => {
    setselectedStock(selectedOption);
    setStock(selectedOption ? selectedOption.value : '');

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

  const filteredOptionStock = Array.isArray(stockDrop) ? stockDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
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

        const {
          Sales_mode,
          pay_type,
          sales_type,
          order_type,
          Print_copies,
          Party_code,
          warehouse_code,
          Print_options,
          Transaction_type,
          Party_name,
          Negative_stock,
        } = data[0];

        const setDefault = (type, setType, options, setSelected) => {
          if (type !== undefined && type !== null) {
            const typeStr = type.toString();
            setType(typeStr);
            setSelected(options.find((opt) => opt.value === typeStr) || null);
          }
        };

        setDefault(pay_type, setPayType, filteredOptionPay, setSelectedPay);
        setDefault(Party_code, setCustomerCode, filteredOptionCode, setSelectedCode);
        setDefault(Sales_mode, setSalesMode, filteredOptionSalesMode, setSelectedSalesMode);
        setDefault(sales_type, setSalesType, filteredOptionSales, setSelectedSales);
        setDefault(order_type, setOrderType, filteredOptionOrder, setSelectedOrder);
        setDefault(warehouse_code, setwarehouse, filteredOptionWarehouse, setSelectedWarehouse);
        setDefault(Transaction_type, setSalesType, filteredOptionSales, setSelectedSales);
        setDefault(Negative_stock, setStock, filteredOptionStock, setselectedStock);
        setDefault(Print_options, setPrint, filteredOptionPrint, setselectedPrint);
        setDefault(Print_copies, setCopies, filteredOptionCopies, setselectedCopies);

        if (Party_name) setCustomerName(Party_name);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [
    salesModeDrop,
    paydrop,
    customercodedrop,
    orderdrop,
    warehouseDrop,
    salesdrop,
    printdrop,
    copiesdrop,
    stockDrop
  ]);

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
    fetch(`${config.apiBaseUrl}/getnegstock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setstockDrop)
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
    if (!payType || !salesType ||!Stock || !orderType || !customerCode || !salesMode || !warehouse) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    try {
      const selectedTemplate = PrintTemplate[currentIndex];
      const selectedKeyField = selectedTemplate ? selectedTemplate.keyfield : "";

      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        pay_type: payType,
        Party_code: customerCode,
        Party_name: customerName,
        Transaction_type: salesType,
        order_type: orderType,
        Screen_Type: Type,
        warehouse_code: warehouse,
        Negative_stock: Stock,
        Print_options: Print,
        Print_copies: Copies,
        Sales_mode: salesMode,
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
        toast.success("Sales Settings Data inserted Successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    }
  };

  const handleNavigate = () => {
    navigate("/Sales");
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? PrintTemplate.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === PrintTemplate.length - 1 ? 0 : prev + 1));
  };

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

  // useEffect(() => {
  //   fetch(`${config.apiBaseUrl}/PrintTemplates`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (Array.isArray(data)) {
  //         const images = data.map((item) => {
  //           const byteArray = new Uint8Array(item.Templates.data);
  //           const blob = new Blob([byteArray], { type: "image/png" });
  //           return URL.createObjectURL(blob);
  //         });
  //         setPrintTemplate(images);
  //       }
  //     })
  //     .catch((err) => console.error("Error fetching templates", err));
  // }, []);

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-3 bg-body-tertiary rounded  ">
        <div className=" mb-0 d-flex justify-content-between" >
          <div className='d-flex justify-content-start'> <h4 className="mb-5 ms-3  fw-semibold text-dark fs-2 fw-bold">Sales Settings</h4> </div>
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
              <label className={`fw-bold ${error && !selectedCode ? 'text-danger' : ''}`}>Customer Code<span className="text-danger">*</span> </label>
              <Select
                className="exp-input-field"
                id='customercode'
                required
                value={selectedCode}
                options={filteredOptionCode}
                maxLength={18}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className={`fw-bold`}>Customer Name </label>
                <input
                  className="exp-input-field form-control"
                  id="customername"
                  required
                  value={customerName}
                  readOnly
                  onChange={(e) => setCustomerName(e.target.value)}
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
                <label className={`fw-bold ${error && !selectedSales ? 'text-danger' : ''}`}> Sales Type<span className="text-danger">*</span> </label>
                <Select
                  id="salesType"
                  value={selectedSales}
                  onChange={handleChangeSales}
                  options={filteredOptionSales}
                  className="exp-input-field"
                  placeholder=""
                  required
                  data-tip="Please select a payment type"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedOrder ? 'text-danger' : ''}`}>  Order type<span className="text-danger">*</span></label>
                <Select
                  id="ordertype"
                  value={selectedOrder}
                  onChange={handleChangeOrder}
                  options={filteredOptionOrder}
                  className="exp-input-field"
                  placeholder=""
                  required
                  data-tip="Please select a payment type"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" >
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedSalesMode ? 'text-danger' : ''}`}> Sales Mode<span className="text-danger">*</span></label>
                <Select
                  id="salesMode"
                  className="exp-input-field"
                  placeholder=""
                  required
                  value={selectedSalesMode}
                  onChange={handleChangeSalesMode}
                  options={filteredOptionSalesMode}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" >
              <div className="exp-form-floating">
                <label className={`fw-bold ${error && !selectedWarehouse ? 'text-danger' : ''}`}> Default Warehouse<span className="text-danger">*</span></label>
                <Select
                  className="exp-input-field "
                  id="customername"
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
                <label className={`fw-bold ${error && !selectedStock ? 'text-danger' : ''}`}> Negative Stock<span className="text-danger">*</span></label>
                <Select
                  className="exp-input-field "
                  id="customername"
                  placeholder=""
                  required
                  value={selectedStock}
                  onChange={handleChangeStock}
                  options={filteredOptionStock}
                  data-tip="Please select a default Stock"
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
                <label className={`fw-bold ${error && !selectedOrder ? 'text-danger' : ''}`}> Print Copies<span className="text-danger">*</span></label>
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
            </div>
            {/* <div className="col-md-3 d-flex justify-content-center align-items-center">
              <div className="template-preview-box position-relative border rounded shadow-sm">
                <button
                  className="nav-arrow left-arrow btn btn-light shadow-sm"
                  onClick={handlePrev}
                  disabled={PrintTemplate.length === 0}
                >
                  ?
                </button>
                {PrintTemplate.length > 0 ? (
                  <img
                    src={PrintTemplate[currentIndex].image}
                    alt="Template"
                    className="preview-image"
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  />
                ) : (
                  <div className="placeholder-text">No Preview Available</div>
                )}
                <button
                  className="nav-arrow right-arrow btn btn-light shadow-sm"
                  onClick={handleNext}
                  disabled={PrintTemplate.length === 0}
                >
                  ?
                </button>
              </div>
              <div className="mt-2 text-center small text-muted">
                Template {PrintTemplate.length > 0 ? currentIndex + 1 : 0} of {PrintTemplate.length}
              </div>
            </div> */}
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
            <div class="col-md-3 form-group  mt-4 mb-4">
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

export default SalesSettings;
