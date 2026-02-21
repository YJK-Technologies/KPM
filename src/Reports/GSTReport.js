import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
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
import LoadingScreen from '../BookLoader';
import secureLocalStorage from "react-secure-storage"; 

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

const VendorProductTable = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [periodDrop, setPeriodDrop] = useState([]);
  const [taxDrop, setTaxDrop] = useState([]);
  const [partyDrop, setPartyDrop] = useState([]);
  const [period, setPeriod] = useState(null);
  const [tax, setTax] = useState(null);
  const [party, setParty] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [start_Date, setStart_Date] = useState('');
  const [end_Date, setEnd_Date] = useState('');
  const companyName = sessionStorage.getItem('selectedCompanyName');
  const [loading, setLoading] = useState(false);

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const companyPermissions = permissions
    .filter(permission => permission.screen_type === 'GSTReport')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        setPeriodDrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[4].Sno,
            label: val[4].DateRangeDescription,
          };
          setSelectedPeriod(firstOption);
          setPeriod(firstOption.value);
        }
      });
  }, []);

  const filteredOptionPeriod = Array.isArray(periodDrop)
    ? periodDrop.map((option) => ({
      value: option.Sno,
      label: option.DateRangeDescription,
    }))
    : [];

  const handleChangePeriod = (selectedPeriod) => {
    setSelectedPeriod(selectedPeriod);
    setPeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  const fetchGSTReport = () => {
    fetch(`${config.apiBaseUrl}/getGSTReport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    }).then((data) => data.json())
      .then((val) => {
        setTaxDrop(val);

        setPartyDrop(val);

        if (val.length > 0) {
          const firstTaxOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          const firstPartyOption = {
            value: val[0].descriptions,
            label: val[0].descriptions,
          };

          setSelectedTax(firstTaxOption);
          setTax(firstTaxOption.value);
          setSelectedParty(firstPartyOption);
          setParty(firstPartyOption.value);
        }
      });
  };

  useEffect(() => {
    fetchGSTReport();
  }, []);


  const filteredOptionTax = Array.isArray(taxDrop)
    ? taxDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const handleChangeTax = (selectedTax) => {
    setSelectedTax(selectedTax);
    setTax(selectedTax ? selectedTax.value : "");

    const updatedPartyOptions = partyDrop.filter(
      (option) => option.attributedetails_name === selectedTax?.value
    );
    if (updatedPartyOptions.length > 0) {
      const firstPartyOption = {
        value: updatedPartyOptions[0].descriptions,
        label: updatedPartyOptions[0].descriptions,
      };
      setSelectedParty(firstPartyOption);
      setParty(firstPartyOption.value);
    } else {
      setSelectedParty(null);
      setParty("");
    }
  };

  const filteredOptionParty = Array.isArray(partyDrop)
    ? partyDrop.map((option) => ({
      value: option.descriptions,
      label: option.descriptions,
    }))
    : [];

  const handleChangeParty = (selectedParty) => {
    setSelectedParty(selectedParty);
    setParty(selectedParty ? selectedParty.value : "");

    const updatedTaxOptions = taxDrop.filter(
      (option) => option.descriptions === selectedParty?.value
    );
    if (updatedTaxOptions.length > 0) {
      const firstTaxOption = {
        value: updatedTaxOptions[0].attributedetails_name,
        label: updatedTaxOptions[0].attributedetails_name,
      };
      setSelectedTax(firstTaxOption);
      setTax(firstTaxOption.value);
    } else {
      setSelectedTax(null);
      setTax("");
    }
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const columnDefs = [
    {
      headerName: "Date",
      field: "Date",
      editable: false,
    },
    {
      headerName: "Bill No",
      field: "BillNo",
      editable: false,
    },
    {
      headerName: "Party Name",
      field: "PartyName",
      editable: false,
    },
    {
      headerName: "GST No",
      field: "GSTNo",
      editable: false,
    },
    {
      headerName: "Percentage %",
      field: "Percentage",
      editable: false,
    },
    {
      headerName: "CGST",
      field: "CGST",
      editable: false,
    },
    {
      headerName: "SGST",
      field: "SGST",
      editable: false,
    },
    {
      headerName: "IGST",
      field: "IGST",
      editable: false,
    },
    {
      headerName: "Bill Rate",
      field: "BillRate",
      editable: false,
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    // flex: 1,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };


  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      alert("Please select at least one row to generate a report");
      return;
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleDateString("en-GB");
    };

    const reportData = selectedRows.map((row) => {
      return {
        "Date": formatDate(row.Date),
        "Bill No": row.BillNo,
        "Party Name": row.PartyName,
        "GST No": row.GSTNo,
        "Percentage %": row.Percentage,
        "CGST": row.CGST,
        "SGST": row.SGST,
        "IGST": row.IGST,
        "Bill Rate": row.BillRate,
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>GST Report</title>");
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        h1 {
            color: maroon;
            text-align: center;
            font-size: 24px;
            margin-bottom: 30px;
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
            vertical-align: top;
        }
        th {
            background-color: maroon;
            color: white;
            font-weight: bold;
        }
        td {
            background-color: #fdd9b5;
        }
        tr:nth-child(even) td {
            background-color: #fff0e1;
        }
        .report-button {
            display: block;
            width: 150px;
            margin: 20px auto;
            padding: 10px;
            background-color: maroon;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
            text-align: center;
            border-radius: 5px;
        }
        .report-button:hover {
            background-color: darkred;
        }
        @media print {
            .report-button {
                display: none;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
      `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write("<h1><u>GST Report</u></h1>");

    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value}</td>`);
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");

    reportWindow.document.write(
      '<button class="report-button" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.company_no === params.data.company_no
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  useEffect(() => {
    if (selectedPeriod?.label === "Custom Date") {
      if (startDate && endDate) {
        fetchGstReport();
      }
    }
    else if (period && party) {
      fetchGstReport();
    }
  }, [selectedPeriod, period, party, startDate, endDate]);

  const fetchGstReport = async () => {
    setLoading(true);
    try {
      if (selectedPeriod === "Custom Date" && (!startDate || !endDate)) {
        return;
      }

      const body = {
        Mode: period.toString(),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Party: party,
        StartDate: selectedPeriod?.label === "Custom Date" ? startDate : undefined,
        EndDate: selectedPeriod?.label === "Custom Date" ? endDate : undefined,
      };

      const response = await fetch(`${config.apiBaseUrl}/getGstReportAnalysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const fetchedData = await response.json();
        if (fetchedData.length > 0) {
          const firstItem = fetchedData[0];
          setStart_Date(formatDate(firstItem.DateRange_Start) || "");
          setEnd_Date(formatDate(firstItem.DateRange_End) || "");
        }

        const newRows = fetchedData.map((matchedItem) => ({
          Date: formatDate(matchedItem.Date),
          BillNo: matchedItem.BillNo,
          PartyName: matchedItem.PartyName,
          GSTNo: matchedItem.GSTNo,
          Percentage: matchedItem.Percentage.toString(),
          CGST: matchedItem.CGST,
          SGST: matchedItem.SGST,
          IGST: matchedItem.IGST,
          BillRate: matchedItem.BillRate,
        }));

        const totalCGST = newRows.reduce((sum, row) => sum + row.CGST, 0);
        const totalSGST = newRows.reduce((sum, row) => sum + row.SGST, 0);
        const totalIGST = newRows.reduce((sum, row) => sum + row.IGST, 0);

        const totalRow = {
          Date: "",
          BillNo: "",
          PartyName: "",
          GSTNo: "",
          Percentage: "Total",
          CGST: totalCGST,
          SGST: totalSGST,
          IGST: totalIGST,
        };

        setRowData([...newRows, totalRow]);
      } else if (response.status === 404) {
              console.log("Data not found");
              toast.warning("Data not found")
              setRowData([]);
            } else {
              const errorResponse = await response.json();
              toast.warning(errorResponse.message );
            }
          } catch (err) {
            console.error("Error saving data:", err);
            toast.error("Error updating data: " + err.messag);
          } finally {
      setLoading(false);
    }
  };

  const handleCustomDatestart = (e) => {
    e.preventDefault();
    setStartDate(e.target.value);
  };

  const handleCustomDateend = (e) => {
    e.preventDefault();
    setEndDate(e.target.value);
  };

  const transformRowData = (data) => {
    return data.map(row => ({
      "Date": row.Date,
      "Bill No": row.BillNo,
      "Party Name": row.PartyName,
      "GST No": row.GSTNo,
      "Percentage %": row.Percentage,
      "CGST": row.CGST,
      "SGST": row.SGST,
      "IGST": row.IGST,
      "Bill Rate": row.BillRate,
    }));
  };

  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['GST Report Analysis'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${start_Date} to ${end_Date}`],
      []
    ];

    const transformedData = transformRowData(rowData);
    const worksheet = XLSX.utils.aoa_to_sheet(headerData);
    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GST Report');
    XLSX.writeFile(workbook, 'Gst_Report.xlsx');
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


  return (
    <div className="container-fluid ">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      
      <div className="card shadow-lg border-0 p-3 rounded-5 " >
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className=" fw-semibold text-dark fs-2 fw-bold">GST Report</h4> </div>
          <div className='col-md-3 d-flex justify-content-end row'>
            <div className='desktopbuttons'>
              <div className='row d-flex justify-content-end'>
                <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-dark p-1' title='Excel' onClick={handleExportToExcel} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                </svg>
                </a>
                </div>
                <div className='col-md-2 mt-1 mb-5 ' ><a className='border-none text-dark p-1' title='Reload' onClick={handlereload} style={{ cursor: "pointer" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
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
            <label className="fw-bold">Date Range</label>
            <div title="Please select the date range">
            <Select
              value={selectedPeriod}
              onChange={handleChangePeriod}
              options={filteredOptionPeriod}
              classNamePrefix="react-select"
            />
          </div>
          </div>
          {selectedPeriod && selectedPeriod.label === "Custom Date" && (
            <div className="col-md-5 mb-3">
              <div className="row">
                <div className="col-md-6">
                  <label className="fw-bold">From</label>
                  <input
                    type="date"
                    className="form-control"
                    title="Please enter the from date"
                    value={startDate}
                    onChange={handleCustomDatestart}
                  />
                </div>
                <div className="col-md-6">
                  <label className="fw-bold">To</label>
                  <input
                    type="date"
                    title="please enter the to date"
                    className="form-control"
                    value={endDate}
                    onChange={handleCustomDateend}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Tax</label>
            <div title="Please select the tax">
            <Select
              value={selectedTax}
              onChange={handleChangeTax}
              options={filteredOptionTax}
              classNamePrefix="react-select"
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Party</label>
            <div title="Please select the party">
            <Select
              value={selectedParty}
              onChange={handleChangeParty}
              options={filteredOptionParty}
              classNamePrefix="react-select"
            />
          </div>
          </div>
        </div>
        <div className="ag-theme-alpine mt-4" style={{ height: 330, width: "100%" }}>
          <AgGridReact 
          pagination={true}
          
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={onSelectionChanged} />
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;
