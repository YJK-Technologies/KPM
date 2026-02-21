import React, { useState, useEffect } from 'react';
import '../../App.css';
import { AgGridReact } from 'ag-grid-react';
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
import { toast } from 'react-toastify';
import Select from 'react-select';
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

const SalesHelpPopup = ({ open, handleClose, handleData, apiPath }) => {
  const [rowData, setRowData] = useState([]);
  const [bill_date, setbill_date] = useState("");
  const [bill_no, setbill_no] = useState("");
  const [sales_type, setsales_type] = useState("");
  const [customer_code, setcustomer_code] = useState("");
  const [customer_name, setcustomer_name] = useState("");
  const [pay_type, setpay_type] = useState("");
  const [order_type, setorder_type] = useState("");
  const [paydrop, setPaydrop] = useState([]);
  const [orderdrop, setOrderdrop] = useState([]);
  const [salesdrop, setSalesdrop] = useState([]);
  const [selectedPay, setSelectedPay] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [Type, setType] = useState("sales");
  const [loading, setLoading] = useState('');

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/paytype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

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
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setOrderdrop(data))
      .catch((error) => console.error("Error fetching Order type:", error));
  }, []);

  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionSales = salesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

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

  const handleChangePay = (selectedOption) => {
    setSelectedPay(selectedOption);
    setpay_type(selectedOption ? selectedOption.value : '');
  };

  const handleChangeSales = (selectedOption) => {
    setSelectedSales(selectedOption);
    setsales_type(selectedOption ? selectedOption.value : '');
  };

  const handleChangeOrder = (selectedOption) => {
    setSelectedOrder(selectedOption);
    setorder_type(selectedOption ? selectedOption.value : '');
  };


  const handleSearchItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/${apiPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode"), bill_date, bill_no, sales_type, customer_code, customer_name, pay_type, order_type })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning("Data not found")
        setRowData([]);
        clearInputs([])
        console.log("Data not found");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.error);
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    clearInputs([])
    setRowData([])
  };

  const clearInputs = () => {
    setbill_date("");
    setbill_no("");
    setSelectedOrder("");
    setSelectedPay("");
    setSelectedSales("");
    setsales_type("");
    setcustomer_code("");
    setcustomer_name("");
    setpay_type("");
    setorder_type("");
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

 const handleConfirm = () => {
  if (selectedRows.length === 0) {
    toast.warning("Please select a row");
    return;
  }

  const header = {
    BillNo: selectedRows[0].bill_no,
    BillDate: selectedRows[0].bill_date,
    SalesType: selectedRows[0].sales_type,
    PayType: selectedRows[0].pay_type,
    CustomerCode: selectedRows[0].customer_code,
    CustomerName: selectedRows[0].customer_name,
    OrderType: selectedRows[0].order_type,
    PaidAmount: selectedRows[0].paid_amount,
    ReturnAmount: selectedRows[0].return_amount,
    SaleAmount: selectedRows[0].sale_amt,
    TotalAmount: selectedRows[0].bill_amt,
    TotalTax: selectedRows[0].tax_amount,
    RoundOff: selectedRows[0].roff_amt,
    SalesMode: selectedRows[0].sales_mode,
  };

 

  handleData({ header });
  handleClose();
};


  const columnDefs = [
    {
      checkboxSelection: true,
      headerName: " Bill Date",
      field: "bill_date",
      editable: false,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
    },
    {
      headerName: "Bill No",
      field: "bill_no",
      editable: false,
    },
    {
      headerName: "Customer Code",
      field: "customer_code",
      editable: false,
    },
    {
      headerName: "Customer Name",
      field: "customer_name",
      editable: false,
    },
    {
      headerName: "Sales Type",
      field: "sales_type",
      editable: false,
    },
    {
      headerName: "Sales Amount",
      field: "sale_amt",
      editable: false,
    },
    {
      headerName: "Bill Amount",
      field: "bill_amt",
      editable: false,
    },
    {
      headerName: "Pay Type",
      field: "pay_type",
      editable: false,
    },
    {
      headerName: "Order Type",
      field: "order_type",
      editable: false,
    },
    {
      headerName: "Paid Amount",
      field: "paid_amount",
      editable: false,
    },
    {
      headerName: "Return Amount",
      field: "return_amount",
      editable: false,
    },
    {
      headerName: "Sales Mode",
      field: "sales_mode",
      editable: false,
    },
    {
      headerName: "Key Field",
      field: "key_field",
      editable: false,
      hide: true,
    },
    {
      headerName: "Round Off",
      field: "roff_amt",
      editable: false,
    },
    {
      headerName: "Tax Amount",
      field: "tax_amount",
      editable: false,
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    sortable: true,
    editable: true,
  };

  return (
    <div className="container-fluid mt-0  m-5">
      {loading && <LoadingScreen />}
      {open && (
        <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold fs-3"> {apiPath === "salesOrderSearchData" ? "Sales Order Help" : "Sales Help"}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Bill Date</label>
                    <div className="">
                      <input
                        type="date"
                        className="form-control pe-5"
                        id="billdate"
                        title="Please enter the bill date"
                        value={bill_date}
                        onChange={(e) => setbill_date(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Bill No</label>
                    <input
                      type="text"
                      className="form-control"
                      id="billno"
                      title="Please enter the bill no"
                      value={bill_no}
                      onChange={(e) => setbill_no(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Customer Code</label>
                    <input
                      type="text"
                      className="form-control"
                      title="Please enter the customer code"
                      value={customer_code}
                      onChange={(e) => setcustomer_code(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Customer Name </label>
                    <input
                      type="text"
                      className="form-control"
                      title="Please enter the customer name"
                      value={customer_name}
                      onChange={(e) => setcustomer_name(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Sales Type </label>
                    <div title="Please select the sales type">
                    <Select
                      id="salesType"
                      value={selectedSales}
                      onChange={handleChangeSales}
                      options={filteredOptionSales}
                      classNamePrefix="react-select" 
                      placeholder=""
                      title="Please select the sales type"
                      data-tip="Please select a payment type"
                      autoComplete="off"
                    />
                  </div>
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Pay Type </label>
                    <div title="Please select the pay type">
                    <Select
                      id="payType"
                      value={selectedPay}
                      onChange={handleChangePay}
                      options={filteredOptionPay}
                      classNamePrefix="react-select" 
                      placeholder=""
                      title="Please select the pay type"
                      data-tip="Please select a payment type"
                      autoComplete="off"
                    />
                  </div>
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Order Type </label>
                    <div title="Please select the order type">
                    <Select
                      id="ordertype"
                      value={selectedOrder}
                      onChange={handleChangeOrder}
                      options={filteredOptionOrder}
                      classNamePrefix="react-select" 
                      placeholder=""
                      title="Please select the order type"
                      autoComplete="off"
                    />
                  </div>
                  </div>
                  <div className="col-md-3 mb-2 mt-4">
                    <button className="btn btn-primary pt-1" onClick={handleSearchItem} title="Search">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                      </svg>
                    </button>
                    <button className="btn btn-primary pt-1 ms-2" onClick={handleReload} title="Reload">
                      {/* Reload Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z" />
                        <path d="M8 1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V1.5A.5.5 0 0 1 8 1z" />
                      </svg>
                    </button>

                    <button className="btn btn-primary pt-1 ms-2" onClick={handleConfirm} title="Confirm">
                      {/* Check Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5l-3.5-3.5a.5.5 0 0 1 .708-.708L6.707 10.293l6.439-6.439a.5.5 0 0 1 .708 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="ag-theme-alpine mt-4" style={{ height: 330, width: '100%' }}>
                  <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowSelection="single"
                    pagination
                    onSelectionChanged={handleRowSelected}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHelpPopup;
