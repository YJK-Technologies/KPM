import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import React, { useState, useEffect, useRef } from 'react';
import CustomerHelp from '../Transactions/Popups/VendorHelpPopup';
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage"; 
import '../App.css';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from '../BookLoader';
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
import '../App.css';
import { upperCase } from "upper-case";

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

const config = require('../ApiConfig');
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const VendorProductTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [type, setType] = useState("");
  const [perioddrop, setPerioddrop] = useState([]);
  const [typeDrop, setTypeDrop] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [period, setPeriod] = useState("");
  const [vendor_code, setvendor_code] = useState("");
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [rowData, setRowData] = useState([]);
  const [start_Date, setStart_Date] = useState('');
  const [end_Date, setEnd_Date] = useState('');
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  

  const [columnDefs] = useState([
    {
      headerName: "Transaction Date",
      field: "transaction_date",
      editable: false,
      valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
    },
    {
      headerName: "Transaction No",
      field: "transaction_no",
      editable: false
    },
    {
      headerName: "Vendor Code",
      field: "vendor_code",
      editable: false
    },
    {
      headerName: "Vendor name",
      field: "vendor_name",
      editable: false
    },
    {
      headerName: "Purchase Amount",
      field: "bill_rate",
      editable: false
    },
    {
      headerName: "Tax Amount",
      field: "tax_amount",
      editable: false
    },
    {
      headerName: "Tax Type",
      field: "tax_type",
      editable: false
    },
    {
      headerName: "HSN code",
      field: "hsn_code",
      editable: false
    },
  ]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        setPerioddrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].Sno,
            label: val[0].DateRangeDescription,
          };
          setSelectedPeriod(firstOption);
          setPeriod(firstOption.value);
        }
      });
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getPurchaseAnalysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => {
        setTypeDrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          setSelectedType(firstOption);
          setType(firstOption.value);
        }
      });
  }, []);

  const handleChangePeriod = (selectedPeriod) => {
    setSelectedPeriod(selectedPeriod);
    setPeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  const handleChangeType = (selectedType) => {
    setSelectedType(selectedType);
    setType(selectedType ? selectedType.value : '');
  };

  const filteredOptionPeriod = perioddrop.map((option) => ({
    value: option.Sno,
    label: option.DateRangeDescription,
  }));

  const filteredOptionType = typeDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange((prevRange) => ({
      ...prevRange,
      [name]: value
    }));
  };


  const fetchpurchaseData = async () => {
    setLoading(true);
    try {
      const body = {
        mode: period.toString(),
        vendor_code: vendor_code,
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Type: type
      };

      if (selectedPeriod.label === "Custom Date") {
        body.StartDate = customDateRange.from;
        body.EndDate = customDateRange.to;
      }

      const response = await fetch(`${config.apiBaseUrl}/getpurchasereport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          const firstItem = searchData[0];
          setStart_Date(formatDate(firstItem.DateRange_Start) || "");
          setEnd_Date(formatDate(firstItem.DateRange_End) || "");
        }

        const newRows = searchData.map((matchedItem) => ({
          transaction_date: formatDate(matchedItem.transaction_date),
          transaction_no: matchedItem.transaction_no,
          vendor_code: matchedItem.vendor_code,
          vendor_name: matchedItem.vendor_name,
          bill_rate: matchedItem.bill_rate,
          tax_amount: matchedItem.tax_amount,
          tax_type: matchedItem.tax_type,
          hsn_code: matchedItem.hsn_code,
        }));
        setRowData(newRows);
        setRowData(searchData)
        console.log(searchData);
      }  else if (response.status === 404) {
              console.log("Data not found");
              toast.warning("Data not found")
              setRowData([]);
            } else {
              const errorResponse = await response.json();
              toast.warning(errorResponse.message );
            }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }finally {
      setLoading(false);
    }
  };

  const transformRowData = (data) => {
    return data.map(row => ({
      "Transaction Date": formatDate(row.transaction_date),
      "Transaction No": row.transaction_no,
      "Vendor Code": row.vendor_code.toString(),
      "Vendor Name": row.vendor_name.toString(),
      "Pay Type": row.pay_type.toString(),
      "Purchase Amount": row.bill_rate,
      "Tax Amount": row.tax_amount,
    }));
  };

  const companyName = sessionStorage.getItem('selectedCompanyName');


  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['Purchase Analysis'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${start_Date} to ${end_Date}`],
      []
    ];

    const transformedData = transformRowData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Analysis');
    XLSX.writeFile(workbook, 'Purchase_Analysis.xlsx');
  };


  const handleShowModal = () => {
    setOpen(true);
  };

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      const [{ VendorCode }] = data;
      const upperVendorCode = upperCase(VendorCode);
      setvendor_code(upperVendorCode);
    } else {
      console.error('Data is empty or undefined');
    }
  };

  const handlereload = () => {
    window.location.reload();
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpens(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [opens, setOpens] = useState(false);
  const dropdownRef = useRef();


  const handleClick = () => {
    navigate('/Dashboard')
  }

  return (
    <div className="container-fluid ">
            {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3 rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Purchase Analysis</h4> </div>
          <div className='col-md-3 d-flex justify-content-end row'>
            <div className='desktopbuttons'>
              <div className='row d-flex justify-content-end'>
                <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-dark p-1' title='Excel' onClick={handleExportToExcel} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                </svg>
                </a>
                </div>
                <div className='col-md-2 mt-1 mb-5 '><a className='border-none text-dark p-1' onClick={handlereload} title='Reload' style={{ cursor: "pointer" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                  </svg>
                </a>
                </div>

                <div className='col-md-2 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' onClick={handleClick} title="Close" style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </a>
            </div>
              </div>
            </div>
            <div className="mobile_buttons">
              <div className="p-1">
                <div className="col-auto position-relative" ref={dropdownRef}>
                  <button
                    className="bg-none salesbutton rounded-3 p-1"
                    onClick={() => setOpens(!opens)}
                    aria-expanded={opens}
                    aria-haspopup="true"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sliders2" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5M12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5M1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8m9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5m1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                    </svg>
                  </button>
                  {opens && (
                    <div className="dropdown-menu show mt-2 custom-dropdown" style={{ display: 'block' }}>
                      <div className='col-md-2 mt-1 mb-3' ><a className='border-none text-dark p-1' onClick={handleExportToExcel} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                      </svg>
                      </a>
                      </div>
                      <div className='col-md-2 mt-1 mb-3 ' ><a className='border-none text-dark p-1' onClick={handlereload} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                        </svg>
                      </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Vendor Code</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control pe-5"
                id='party_code'
                required
                title='Please enter the vendor code'
                value={vendor_code}
                onChange={(e) => setvendor_code(e.target.value)}
                maxLength={18}
                autoComplete='off' 
                />
              <a
                className=" position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                style={{ zIndex: 2 }}
                onClick={handleShowModal}
                title='Vendor Help'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </a>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Select Period </label>
            <Select
              id="Speriod"
              value={selectedPeriod}
              onChange={handleChangePeriod}
              options={filteredOptionPeriod}
              classNamePrefix="react-select"
              placeholder=""
              maxLength={18}
              title='Please select the period'
            />
          </div>
          {selectedPeriod.label === "Custom Date" && (
            <div className="col-md-5 mb-3">
              <div className="row">
                <div className="col-md-6">
                  <label className="fw-bold">From</label>
                  <input
                    type="date"
                    title='Please enter the from date'
                    className="form-control border-secondary"
                    name="from"
                    value={customDateRange.from}
                    onChange={handleCustomDateChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="fw-bold">To</label>
                  <input
                    type="date"
                    title='Please enter the to date'
                    className="form-control border-secondary"
                    name="to"
                    value={customDateRange.to}
                    onChange={handleCustomDateChange}
                  />
                </div>
              </div>
            </div>
          )}
          <div className='col-md-3 mb-2'>
            <label className='fw-bold'>Select Type</label>
            <Select
              id="Stype"
              value={selectedType}
              onChange={handleChangeType}
              options={filteredOptionType}
              classNamePrefix="react-select"
              placeholder=""
              title='Please select the type'
              required
              maxLength={18}
            />
          </div>
          <div className="col-md-2 mb-2 mt-4">
            <button className="button2 " onClick={fetchpurchaseData} title='Search'>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                className="bi bi-search" viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </button>
          </div>
        </div>
        <div className="ag-theme-alpine" style={{ height: 330, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={5}
          />
        </div>
      </div>
      <CustomerHelp open={open} handleClose={handleClose} handleVendor={handleVendor} />
    </div>
  );
};

export default VendorProductTable;
