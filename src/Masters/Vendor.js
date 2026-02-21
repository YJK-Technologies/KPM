import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { showConfirmationToast } from '../ToastConfirmation';
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
import secureLocalStorage from "react-secure-storage"; 

import '../App.css';
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

  const handleClick = () => { navigate('/AddVendorDet', { state: { mode: "create" } }); };

  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [vendor_code, setvendor_code] = useState("");
  const [rowData, setRowData] = useState([]);
  const [vendor_name, setvendor_name] = useState("");
  const [panno, setpanno] = useState("");
  const [vendor_gst_no, setvendor_gst_no] = useState("");
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [vendor_addr_1, setvendor_addr_1] = useState("");
  const [vendor_area_code, setvendor_area_code] = useState("");
  const [vendor_state_code, setvendor_state_code] = useState("");
  const [vendor_country_code, setvendor_country_code] = useState("");
  const [vendor_mobile_no, setvendor_mobile_no] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusdrop, setStatusdrop] = useState([]);
  const [drop, setDrop] = useState([]);
  const [companygriddrop, setCompanyGriddrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [transactiongriddrop, setTransactionGriddrop] = useState([]);
  const [salesgriddrop, setSalesGriddrop] = useState([]);
  const [brokergriddrop, setBrokerGriddrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
  const [error, setError] = useState("");
  const [status, setstatus] = useState("");
  const [condrop, setCondrop] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [loading, setLoading] = useState(false);

  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");
  const config = require('../ApiConfig');

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const vendorPermissions = permissions
    .filter(permission => permission.screen_type === 'Vendor')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/Companyno`)
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.company_no);
        setCompanyGriddrop(statusOption);
      })
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
      .then((val) => setStatusdrop(val));
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
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const cityNames = data.map(option => option.attributedetails_name);
        setDrop(cityNames);
      })
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
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const countries = data.map(option => option.attributedetails_name);
        setCondrop(countries);
      })
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
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const States = data.map(option => option.attributedetails_name);
        setStatedrop(States);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Code",
      field: "vendor_code",
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 18,
      },
      cellRenderer: (params) => {
        const handleClick = () => {
          handleNavigateWithRowData(params.data);
        };

        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={handleClick}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Name",
      field: "vendor_name",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    // {
    //   headerName: "Company Code",
    //   field: "company_code",
    //   editable: true,
    //   cellStyle: { textAlign: "left" },
    //   cellEditor: "agSelectCellEditor",
    //   cellEditorParams: {
    //     values: companygriddrop,
    //   },
    // },
    {
      headerName: "Address 1",
      field: "vendor_addr_1",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 2",
      field: "vendor_addr_2",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 3",
      field: "vendor_addr_3",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Address 4",
      field: "vendor_addr_4",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "City",
      field: "vendor_area_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: drop,
      },
    },
    {
      headerName: "State",
      field: "vendor_state_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statedrop,
      },
    },
    {
      headerName: "Country",
      field: "vendor_country_code",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: condrop,
      },
    },
    {
      headerName: "Status",
      field: "status",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statusgriddrop,
      },
    },
    {
      headerName: "PAN No",
      field: "panno",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: "GST No",
      field: "vendor_gst_no",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 15,
      },
    },
    {
      headerName: "Office No",
      field: "vendor_office_no",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: 'agTextCellEditor', // Use text editor to allow control
      cellEditorParams: {
        maxLength: 20,
      },
      valueSetter: (params) => {
        const newValue = params.newValue?.toString().trim();
        const isValid = /^\d*$/.test(newValue); // allow only digits
        if (isValid) {
          params.data.vendor_office_no = newValue;
          return true;
        }
        return false;
      },
      onCellEditingStarted: (params) => {
        const input = document.querySelector('.ag-cell-edit-input');
        if (input) {
          input.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          });
        }
      },
    }, 
    {
      headerName: "Residential No",
      field: "vendor_resi_no",
      // cellEditor: "agNumberCellEditor",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
      valueSetter: (params) => {
        const newValue = params.newValue?.toString().trim();
        const isValid = /^\d*$/.test(newValue);
        if (isValid) {
          params.data.vendor_resi_no = newValue;
          return true;
        }
        return false; 
      },
    },
    {
      headerName: "Mobile No",
      field: "vendor_mobile_no",
      editable: true,
      // cellEditor: "agNumberCellEditor",
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
      valueSetter: (params) => {
        const newValue = params.newValue?.toString().trim();
        const isValid = /^\d*$/.test(newValue);
        if (isValid) {
          params.data.vendor_mobile_no = newValue;
          return true;
        }
        return false; 
      },
    },
    {
      headerName: "Email",
      field: "vendor_email_id",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Keyfield",
      field: "keyfield",
      hide: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddVendorDet", { state: { mode: "update", selectedRow } });
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  // Assuming you have a unique identifier for each row, such as 'id'
  // const onCellValueChanged = (params) => {
  //   const updatedRowData = [...rowData];
  //   const rowIndex = updatedRowData.findIndex(
  //     (row) => row.vendor_code === params.data.vendor_code && row.company_code === params.data.company_code && row.keyfield == params.data.keyfield
  //   );
  //   if (rowIndex !== -1) {
  //     updatedRowData[rowIndex][params.colDef.field] = params.newValue;
  //     setRowData(updatedRowData);

  //     setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
  //   }
  // };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.vendor_code === params.data.vendor_code && row.company_code === params.data.company_code && row.keyfield == params.data.keyfield
    );
  
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
  
      setEditedData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.vendor_code === params.data.vendor_code && item.company_code === params.data.company_code && item.keyfield == params.data.keyfield
        );
  
        if (existingIndex !== -1) {
          const updatedEdited = [...prevData];
          updatedEdited[existingIndex] = updatedRowData[rowIndex];
          return updatedEdited;
        } else {
          return [...prevData, updatedRowData[rowIndex]];
        }
      });
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/vendorsearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), vendor_code, vendor_name, panno, vendor_gst_no, vendor_addr_1, vendor_area_code, vendor_state_code, vendor_country_code, vendor_mobile_no, status })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found")
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
    setError(false);
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
      .then((val) => setStatusdrop(val));
  }, []);

  const saveEditedData = async () => {
    const modified_by = sessionStorage.getItem('selectedUserCode');
    //const company_code = sessionStorage.getItem('selectedCompanyCode');
    // Filter the editedData state to include only the selected rows
    const selectedRowsData = editedData.filter(row =>
      selectedRows.some(selectedRow =>
        selectedRow.vendor_code === row.vendor_code && selectedRow.company_code === row.company_code
      )
    );

    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update its data");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/updvendordetData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              //"company-code": company_code
            },
            body: JSON.stringify({
              vendor_codesToUpdate: selectedRowsData.map(row => row.vendor_code),
              company_codesToUpdate: selectedRowsData.map(row => row.company_code),
              updatedData: selectedRowsData
            }),
          });

          if (response.status === 200) {
            setTimeout(() => {
              toast.success("Data Updated Successfully")
              handleSearch();
            }, 3000);
            return;
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Updating Data: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data updated cancelled.");
      }
    );
  };

  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select atleast One Row to Delete")
      return;
    }

    const modified_by = sessionStorage.getItem('selectedUserCode');
    const company_code = sessionStorage.getItem('selctedCompanyCode');
    const keyfieldsToDelete = selectedRows.map((row) => row.keyfield);
    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteVendorData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": modified_by,
              "company-code": company_code,

            },
            body: JSON.stringify({ keyfieldsToDelete }),
            "modified_by": modified_by
          });

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data Deleted successfully")
              handleSearch();
            }, 3000);

          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error Deleting Data: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data Delete cancelled.");
      }
    );
  };


  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return
    };

    const reportData = selectedRows.map((row) => {
      const formatValue = (val) => (val !== undefined && val !== null ? val : '');

      const addressParts = [
        row.vendor_addr_1,
        row.vendor_addr_2,
        row.vendor_addr_3,
        row.vendor_addr_4,
        row.vendor_area_code,
        row.vendor_state_code,
        row.vendor_country_code,
      ].map(formatValue);

      const formattedAddress = `
        ${addressParts[0]},
        ${addressParts[1]},
        ${addressParts[2]}<br>
        ${addressParts[3]}<br>
        ${addressParts[4]}<br>
        ${addressParts[5]}<br>
        ${addressParts[6]}
      `;

      return {
        "Vendor Code": formatValue(row.vendor_code),
        "Vendor Name": formatValue(row.vendor_name),
        "Address": formattedAddress,
        "Email": formatValue(row.vendor_email_id),
        "Status": formatValue(row.status),
        "PAN No": formatValue(row.panno),
        "GST No": formatValue(row.vendor_gst_no),
        "Vendor Office No": formatValue(row.vendor_office_no),
        "Vendor Residential No": formatValue(row.vendor_resi_no),
        "Mobile No": formatValue(row.vendor_mobile_no)
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Vendor</title>");
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
    reportWindow.document.write("<h1><u>Vendor Information</u></h1>");

    // Create table with headers
    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

    // Populate the rows
    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value}</td>`);
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");

    reportWindow.document.write(
      '<button class="report-button" title="Print" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return 'N/A' if the date is missing
    const date = new Date(dateString);

    // Format as DD/MM/YYYY
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    const formattedCreatedDate = formatDate(rowData.created_date);
    const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };

  // Handler for when a row is selected
  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const hasPermission = (perm) =>
    vendorPermissions.includes(perm) || vendorPermissions.includes('all permission');

  const handleReload = () => {
    window.location.reload();
  };


  return (
    <div className="container-fluid ">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3 rounded-5 " style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Vendor</h4> </div>
          <div className="desktopbuttons">
            <div className='d-flex justify-content-end row'>
              {['add', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 me-0 mb-5' ><a className='border-none text-dark p-1' title="Add Vendor" onClick={handleClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-patch-plus-fill" viewBox="0 0 16 16">
                  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM8.5 6v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 1 0" />
                </svg>
                </a>
                </div>
              )}
              {['update', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-success p-1' title="Update" onClick={saveEditedData} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                  <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                </svg>
                </a>
                </div>
              )}
              {['delete', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' title="Delete" onClick={deleteSelectedRows} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
                </a>
                </div>
              )}
              {['view', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-dark p-1' title="Generate Report" onClick={generateReport} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16">
                  <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1" />
                  <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                </svg>
                </a>
                </div>
              )}
              <div className="col-md-2 mt-1 mb-5">
                <a className='border-none text-dark p-1' title="Reload" onClick={handleReload} style={{ cursor: "pointer" }}> <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
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
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}
                  aria-haspopup="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sliders2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5M12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5M1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8m9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5m1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                  </svg>
                </button>
                {open && (
                  <div className="dropdown-menu show mt-2 custom-dropdown" style={{ display: 'block' }}>
                    {['add', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                      <button className="dropdown-item text-dark" onClick={handleClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-patch-plus-fill" viewBox="0 0 16 16">
                          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM8.5 6v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 1 0" />
                        </svg>
                      </button>
                    )}
                    {['update', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                      <button className="dropdown-item text-success" onClick={saveEditedData}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                          <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                        </svg>
                      </button>
                    )}
                    {['delete', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                      <button className="dropdown-item text-danger" onClick={deleteSelectedRows}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                        </svg>
                      </button>
                    )}
                    {['view', 'all permission'].some(permission => vendorPermissions.includes(permission)) && (
                      <button className="dropdown-item text-dark" onClick={generateReport}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16">
                          <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1" />
                          <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                        </svg>
                      </button>
                    )}
                    <a className='border-none text-dark p-1 d-flex justify-content-center' onClick={handleReload} title="Reload" style={{ cursor: "pointer" }}> <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                    </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Code </label>
            <input
              type="text"
              className="form-control"
              id="vencode"
              placeholder=""
              required title="Please fill the code here"
              value={vendor_code}
              onChange={(e) => setvendor_code(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={18}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Name</label>
            <input
              type="text"
              className="form-control"
              id="venname"
              placeholder=""
              required title="Please fill the name here"
              value={vendor_name}
              onChange={(e) => setvendor_name(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={250}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>PAN No</label>
            <input
              type="text"
              className="form-control"
              id="panno"
              placeholder=""
              required title="Please fill the Pan number here"
              value={panno}
              onChange={(e) => setpanno(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={18}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>GST No</label>
            <input
              type="text"
              className="form-control"
              id="vengst"
              placeholder=""
              required title="Please fill the GST number here"
              value={vendor_gst_no}
              onChange={(e) => setvendor_gst_no(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={15}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Address</label>
            <input
              type="text"
              className="form-control"
              id="venaddr1"
              placeholder=""
              required title="Please fill the address here"
              value={vendor_addr_1}
              onChange={(e) => setvendor_addr_1(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={250}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>City</label>
            <input
              type="text"
              className="form-control"
              id="venarcode"
              placeholder=""
              required title="Please fill the area code"
              value={vendor_area_code}
              onChange={(e) => setvendor_area_code(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={100}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>State</label>
            <input
              type="text"
              className="form-control"
              id="venstatcode"
              placeholder=""
              required title="Please fill the state code here"
              value={vendor_state_code}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onChange={(e) => setvendor_state_code(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Country</label>
            <input
              type="text"
              className="form-control"
              id="vencountrycode"
              placeholder=""
              required title="Please fill the country code"
              value={vendor_country_code}
              onChange={(e) => setvendor_country_code(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={100}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Contact No</label>
            <input
              type="text"
              className="form-control"
              id="contactno"
              placeholder=""
              required title="Please fill the contact number here"
              value={vendor_mobile_no}
              onChange={(e) => setvendor_mobile_no(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={20}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Status</label>
            <div title="Please select the status">
            <Select
              id="status"
              value={selectedStatus}
              onChange={handleChangeStatus}
              // onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              options={filteredOptionStatus}
              classNamePrefix="react-select"
              placeholder=""
            />
          </div>
          </div>
          <div className="col-md-2 mb-2 mt-4">
            <button title="Search" onClick={handleSearch} className="button2 " >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                className="bi bi-search" viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </button>
          </div>
        </div>
        <div className="ag-theme-alpine mt-4" style={{ height: 330, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            pagination={true}
            onSelectionChanged={onSelectionChanged}
            paginationAutoPageSize={true}
            onRowSelected={onRowSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;
