import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import { ToastContainer, toast } from 'react-toastify';
import { showConfirmationToast } from '../ToastConfirmation';
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
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from '../BookLoader';
import '../App.css';
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
const config = require('../ApiConfig')

const Category = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/AddCategory", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };

  const [rowData, setRowData] = useState([]);
  const [Item_Category_Code, setItem_Category_Code] = useState("");
  const [gridApi, setGridApi] = useState(null);
  const [Item_Category_Name, setItem_Category_Name] = useState("");
  const [Region_Code, setRegion_Code] = useState("");
  const [Display_Order, setDisplay_Order] = useState("");
  const [selectedDefault, setselectedDefault] = useState('');
  const [Is_Default, setdefault] = useState("");
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('');
  const [status, setstatus] = useState("");
  const [Item_Category_Description, setItem_Category_Description] = useState("");
  const [ourbranddrop, setourbranddrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [selectedItemCode, setSelectedItemCode] = useState(null);
  const [selectedItemImage, setSelectedItemIamge] = useState(null);
  const [regbranddrop, setregbranddrop] = useState([]);
  const [uomdrop, setuomdrop] = useState([]);
  const [suomdrop, setsuomdrop] = useState([]);
  const [loading, setLoading] = useState(false);

  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const handleChangeBrand = (selectedBrand) => {
    setselectedDefault(selectedBrand);
    setdefault(selectedBrand ? selectedBrand.value : '');
    setError(false);
  };

  const [open, setOpen] = React.useState(false);
  const [brandgriddrop, setBrandGriddrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
    setError(false);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const itemPermissions = permissions
    .filter(permission => permission.screen_type === 'Item')
    .map(permission => permission.permission_type.toLowerCase());


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getDefault`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setourbranddrop(val))
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
    }).then((response) => response.json())
      .then((data) => {
        const statusOption = data.map(option => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/uom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    }).then((response) => response.json())
      .then((data) => {
        const baseUOM = data.map(option => option.attributedetails_name);
        setuomdrop(baseUOM);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/uom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    }).then((response) => response.json())
      .then((data) => {
        const secondaryUOM = data.map(option => option.attributedetails_name);
        setsuomdrop(secondaryUOM);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/regbrand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((data) => {
        const regbrand = data.map(option => option.attributedetails_name);
        setregbranddrop(regbrand);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/ourbrand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    }).then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const brandOption = data.map(option => option.attributedetails_name);
        setBrandGriddrop(brandOption);
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
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  const handleSearch = async () => {
    setLoading(true);
    try {
      const company_code = sessionStorage.getItem('selectedCompanyCode')
      const response = await fetch(`${config.apiBaseUrl}/Categorysearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_Category_Code, Item_Category_Description, Item_Category_Name, Region_Code,Display_Order, Is_Default, status }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")
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


  const filteredOptionBrand = ourbranddrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddCategory", { state: { mode: "update", selectedRow } });
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleClickOpen = (params) => {
    const itemCode = params.data.Item_code;
    const itemImage = params.data.item_images;
    setSelectedItemCode(itemCode);
    setSelectedItemIamge(itemImage);
    setOpen(true);
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Item Category Code",
      field: "Item_Category_Code",
      cellStyle: { textAlign: "center" },
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
      headerName: "Item catogory Name",
      field: "Item_Category_Name",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: "Country Code",
      field: "Country_Code",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 40,
      },
    },
    {
      headerName: "Display Order",
      field: "Display_Order",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 40,
      },
    },
    {
      headerName: "Status",
      field: "Is_Active",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 40,
      },
    },
    {
      headerName: "Default Display",
      field: "Is_Default",
      editable: true,
      cellStyle: { textAlign: "center" },
        maxLength: 60,
      
    },
    {
      headerName: "Version",
      field: "Record_Version",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        maxLength: 60,
        values: suomdrop,
      },
    },
    {
      headerName: "Region Code",
      field: "Region_Code",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 50,
      },
    },
    {
      headerName: "Description",
      field: "Item_Category_Description",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 50,
      },
    },
    {
      headerName: "Keyfield",
      field: "Keyfield",
      editable: true,
       hide: true,  
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 20,
      },
    },
    
    
    {
      headerName: "Category Image",
      field: "Item_Category_Image",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 40,
      },
      cellRenderer: (params) => {
        if (params.value) {
          const base64Image = arrayBufferToBase64(params.value.data);
          return (
            <img src={`data:image/jpeg;base64,${base64Image}`}
              alt="Item Image"
              style={{ width: " 50px", height: "50px" }}
            />
          );
        } else {
          return "";
        }
      },
      onCellClicked: (params) => handleClickOpen(params),
    },
  ];

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const saveEditedData = async () => {
  const company_code = sessionStorage.getItem("selectedCompanyCode");
  const modified_by = sessionStorage.getItem("selectedUserCode");

  // Take only selected + edited rows
  const selectedRowsData = editedData.filter(row =>
    selectedRows.some(
      selectedRow => selectedRow.Item_Category_Code === row.Item_Category_Code
    )
  );

  if (selectedRowsData.length === 0) {
    toast.warning("Please select and edit at least one row");
    return;
  }

  showConfirmationToast(
    "Are you sure you want to update the selected rows?",
    async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/Item_Category_MasterUpdateRow`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": company_code,
              "Modified-By": modified_by
            },
            body: JSON.stringify({ editedData: selectedRowsData }), // Send only the selected rows for saving
            "company_code": company_code,
            "modified_by": modified_by
          });
         
       
        if (response.status === 200) {
            toast.success("Data Updated Successfully", {
              onClose: () => handleSearch(),
              autoClose: 1000,
            });
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
    toast.warning("Please select at least one row to delete");
    return;
  }

  const company_code = sessionStorage.getItem("selectedCompanyCode");
  const modified_by = sessionStorage.getItem("selectedUserCode");

  // ✅ Collect Keyfields
  const keyfieldsToDelete = selectedRows.map(row => row.Keyfield);

  console.log("Keyfields to delete:", keyfieldsToDelete);

  showConfirmationToast(
    "Are you sure you want to delete the selected rows?",
    async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/Item_Category_MasterDelete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              keyfields: keyfieldsToDelete,
              company_code,
              modified_by
            })
          }
        );

        if (response.ok) {
          toast.success("Data deleted successfully", {
            autoClose: 1000,
            onClose: () => handleSearch()
          });
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Delete failed");
        }
      } catch (error) {
        console.error("Delete Error:", error);
        toast.error("Error deleting data: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    () => toast.info("Delete cancelled")
  );
};


  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return
    };

    const reportData = selectedRows.map((row) => {
      const safeValue = (val) => (val !== undefined && val !== null ? val : '');

      return {
        "Item Category Code": safeValue(row.Item_Category_Code),
        "Item catogory Name": safeValue(row.Item_Category_Name),
        "Country Code": safeValue(row.Country_Code),
        "Display Order": safeValue(row.Display_Order),
        "Status": safeValue(row.Is_Active),
        "Default Display ": safeValue(row.Is_Default),
        "Version": safeValue(row.Record_Version),
        "Region Code": safeValue(row.Region_Code),
        "Description": safeValue(row.Item_Category_Description)
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Category</title>");
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
    reportWindow.document.write("<h1><u>Category Information</u></h1>");

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

  const handleNavigateToForm = () => {
    navigate("/AddItem", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
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
  //     (row) => row.Item_code === params.data.Item_code && row.Item_variant === params.data.Item_variant
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
      (row) => row.Item_Category_Code === params.data.Item_Category_Code && row.Item_Category_Name === params.data.Item_Category_Name
    );
  
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
  
      setEditedData((prevData) => {
        const existingIndex = prevData.findIndex(
          (item) => item.Item_Category_Code === params.data.Item_Category_Code && item.Item_Category_Name === params.data.Item_Category_Name
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const hasPermission = (perm) =>
    itemPermissions.includes(perm) || itemPermissions.includes('all permission');

  // Handler for when a row is selected
  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  };

  const defaultColDef = {
    resizable: true,
    wrapText: true,
  };

  return (
    <div className="container-fluid ">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3 rounded-5 " style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Category</h4> </div>
          <div className="desktopbuttons">
            <div className='d-flex justify-content-end row'>
              {['add', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 me-0 mb-5' ><a className='border-none text-dark p-1' title="Add Item" onClick={handleClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-patch-plus-fill" viewBox="0 0 16 16">
                  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM8.5 6v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 1 0" />
                </svg>
                </a>
                </div>
              )}
              {['update', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-success p-1' title="Update" onClick={saveEditedData} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                  <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                </svg>
                </a>
                </div>
              )}
              {['delete', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
                <div className='col-md-2 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' title="Delete" onClick={deleteSelectedRows} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
                </a>
                </div>
              )}
              {['view', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
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
                    {['add', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
                      <button className="dropdown-item text-dark" onClick={handleClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-patch-plus-fill" viewBox="0 0 16 16">
                          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM8.5 6v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 1 0" />
                        </svg>
                      </button>
                    )}
                    {['update', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
                      <button className="dropdown-item text-success" onClick={saveEditedData}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                          <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                        </svg>
                      </button>
                    )}
                    {['delete', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
                      <button className="dropdown-item text-danger" onClick={deleteSelectedRows}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                        </svg>
                      </button>
                    )}
                    {['view', 'all permission'].some(permission => itemPermissions.includes(permission)) && (
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
            <label className='fw-bold'>Item Category Code</label>
            <input
              type="text"
              className="form-control"
              id="Icode"
              placeholder=""
              required title="Please fill the code here"
              value={Item_Category_Code}
              onChange={(e) => setItem_Category_Code(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={18}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Item Category Name</label>
            <input
              type="text"
              className="form-control"
              id="Itemvar"
              placeholder=""
              required title="Please fill the variant here"
              value={Item_Category_Name}
              onChange={(e) => setItem_Category_Name(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={18}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Item Category Description</label>
            <input
              type="text"
              className="form-control"
              id="Iname"
              placeholder=""
              required title="Please fill the name here"
              value={Item_Category_Description}
              onChange={(e) => setItem_Category_Description(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={40}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Region Code</label>
            <input
              type="text"
              className="form-control"
              id="Ishname"
              placeholder=""
              required title="Please fill the short name here"
              value={Region_Code}
              onChange={(e) => setRegion_Code(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={50}
            />
          </div>
         
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Display order</label>
            <input
              type="text"
              className="form-control"
              id="Ishname"
              placeholder=""
              required title="Please fill the short name here"
              value={Display_Order}
              onChange={(e) => setDisplay_Order(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={50}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Default</label>
            <div title="Please select the our brand">
            <Select
              id="ahsts"
              value={selectedDefault}
              onChange={handleChangeBrand}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              options={filteredOptionBrand}
              classNamePrefix="react-select"
              placeholder=""
              maxLength={30}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Status</label>
            <div title="Please select the status">
            <Select
              type="text"
              id="ahsts"
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
            <button className="button2" onClick={handleSearch} title="Search" >
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

export default Category;
 