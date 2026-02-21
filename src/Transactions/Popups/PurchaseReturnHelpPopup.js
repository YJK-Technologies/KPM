import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import { AgGridReact } from 'ag-grid-react';
import { format } from 'date-fns';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const columnDefs = [
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    headerName: "Transaction No",
    field: "transaction_no",
    editable: false,
  },
  {
    headerName: "Transaction Date",
    field: "transaction_date",
    editable: false,
    valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
  },
  {
    headerName: "Entry Date",
    field: "Entry_date",
    editable: false,
    valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
  },
  {
    headerName: "Vendor Code",
    field: "vendor_code",
    editable: false,
  },
  {
    headerName: "vendor Name",
    field: "vendor_name",
    editable: false,
  },
  {
    headerName: "Purchase Type",
    field: "purchase_type",
    editable: false,
  },
  {
    headerName: "Pay Type",
    field: "pay_type",
    editable: false,
  },
  {
    headerName: " Amount",
    field: "purchase_amount",
    editable: false,
    valueFormatter: params => parseFloat(params.value).toFixed(2),
  },
  {
    headerName: "Round Off",
    field: "rounded_off",
    editable: false,
  },
  {
    headerName: " Tax Amount",
    field: "tax_amount",
    editable: false,
    valueFormatter: params => parseFloat(params.value).toFixed(2),
  },
  {
    headerName: "Key Field",
    field: "keyfield",
    editable: false,
    hide: true
  },
  {
    headerName: "Total Amount",
    field: "total_amount",
    editable: false,
    valueFormatter: params => parseFloat(params.value).toFixed(2),
  },
];


const defaultColDef = {
  resizable: true,
  wrapText: true,
  sortable: true,
  editable: true,
  filter: true,
};

export default function RetunrHelpPopup({ open, handleClose, ReturnHelp }) {
  const [rowData, setRowData] = useState([]);
  const [transaction_no, settransaction_no] = useState("");
  const [transaction_date, settransaction_date] = useState("");
  const [vendor_code, setvendor_code] = useState("");
  const [vendor_name, setvendor_name] = useState("");
  const [purchase_type, setpurchase_type] = useState("");
  const [pay_type, setpay_type] = useState("");
  const [paydrop, setPaydrop] = useState([]);
  const [purchasedrop, setPurchasedrop] = useState([]);
  const [selectedPay, setselectedPay] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState('');

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

  const handleChangePay = (selectedPay) => {
    setselectedPay(selectedPay);
    setpay_type(selectedPay ? selectedPay.value : '');
  };

  const handleChangePurchase = (selected) => {
    setSelected(selected);
    setpurchase_type(selected ? selected.value : '');
  };

  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionPurchase = purchasedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpursearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode"), transaction_no, transaction_date, vendor_code, vendor_name, purchase_type, pay_type }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log(searchData)
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found')
        setRowData([]);
        clearInputs([])
        console.log("Data not found");
      } else {
        console.log("Bad request");
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
    settransaction_no("");
    settransaction_date("");
    setvendor_code("");
    setvendor_name("");
    setpurchase_type("");
    setpay_type("");
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const handleConfirm = () => {
    const selectedData = selectedRows.map(row => ({
      TransactionNo: row.transaction_no,
      TransactionDate: row.transaction_date,
      PurchaseType: row.purchase_type,
      PayType: row.pay_type,
      TotalTax: row.tax_amount,
      TotalAmount: row.total_amount,
      VendorName: row.vendor_name,
      Amount: row.purchase_amount,
      Vendorcode: row.vendor_code,
      Entrydate: row.Entry_date
    }));
    console.log('Selected Data:', selectedData);
    ReturnHelp(selectedData);
    handleClose();
    clearInputs([]);
    setRowData([]);
    setSelectedRows([]);
  }

  return (
    <div>
      {loading && <LoadingScreen />}
      {open && (
        <div className="container-fluid mt-0  m-5">
          <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
              <div className="modal-content rounded-4 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold fs-3">Purchase Help</h5>
                  <button type="button" title="Close" className="btn-close" onClick={handleClose}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Transaction No</label>
                      <div className="">
                        <input
                          type="text"
                          className="form-control pe-5"
                          id='transaction_no'
                          value={transaction_no}
                          onChange={(e) => settransaction_no(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Transaction Date</label>
                      <input type="date"
                        className="form-control"
                        id='transaction_date'
                        value={transaction_date}
                        onChange={(e) => settransaction_date(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Vendor Code</label>
                      <input type="text"
                        className="form-control"
                        id='vendor_code'
                        value={vendor_code}
                        onChange={(e) => setvendor_code(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        autoComplete="off"
                        title='Please enter the vendor code'
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Vendor Name</label>
                      <input type="text"
                        className="form-control"
                        id='vendor_code'
                        value={vendor_name}
                        onChange={(e) => setvendor_name(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        autoComplete="off"
                        title='Please enter the vendor name'
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Purchase Type </label>
                      <div title="Please select the purchase type">
                      <Select
                        id="purchaseType"
                        value={selected}
                        onChange={handleChangePurchase}
                        options={filteredOptionPurchase}
                        classNamePrefix="react-select"
                        placeholder=""
                      />
                    </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Pay type </label>
                      <div title="Please select the pay type">
                      <Select
                        id="paytype"
                        value={selectedPay}
                        onChange={handleChangePay}
                        options={filteredOptionPay}
                        classNamePrefix="react-select"
                        placeholder=""
                        required
                        data-tip="Please select a payment type"
                      />
                    </div>
                    </div>
                    <div className="col-md-3 mb-2 mt-4 ">
                      <button onClick={handleSearch} title="Search" className="btn btn-primary pt-1"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
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
                      <button className='btn btn-primary pt-1 ms-2'>
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
                      pagination='true'
                      onSelectionChanged={handleRowSelected}
                      paginationPageSize={5}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

