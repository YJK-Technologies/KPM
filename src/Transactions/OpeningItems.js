import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import AttriHdrInputPopup from '../Transactions/Popups/OpeningItemHelp';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showConfirmationToast } from '../ToastConfirmation';
import PurchaseItemPopup from '../Transactions/Popups/PurchaseItemPopup';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  CellStyleModule,
  ValidationModule,
  TooltipModule 
} from 'ag-grid-community';
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
  TooltipModule 
]);
const config = require("../ApiConfig");

const VendorProductTable = () => {

  const navigate = useNavigate();
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transaction_date, settransaction_date] = useState("");
  const [transaction_no, settransaction_no] = useState("");
  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: "", itemName: "", purchaseQty: "" },]);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
const navigationOrder = ['itemCode', 'billQty'];
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 0-indexed

    let startYear, endYear;

    if (currentMonth >= 4) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }

    const financialYearStartDate = `${startYear}-04-01`;
    const financialYearEndDate = `${endYear}-03-31`;

    setFinancialYearStart(financialYearStartDate);
    setFinancialYearEnd(financialYearEndDate);
  }, []);


  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const openingPermissions = permissions
    .filter(permission => permission.screen_type === 'OpeningItem')
    .map(permission => permission.permission_type.toLowerCase());


  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleOpeningItem = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getallOpeningItem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }),
      });
      if (response.ok) {
        setSaveButtonVisible(false);
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          settransaction_date(formatDate(item.transaction_date));
          settransaction_no(item.transaction_no);
        } else {
          console.log("Header Data is empty or not found");
          settransaction_date("");
          settransaction_no("");
        }

        if (searchData.Details && searchData.Details.length > 0) {
          const updatedRowData = searchData.Details.map((item) => {
            return {
              serialNumber: item.Item_SNo,
              itemCode: item.Item_code,
              itemName: item.Item_name,
              billQty: item.bill_qty
            };
          });

          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([
            {
              serialNumber: 1,
              itemCode: "",
              itemName: "",
              billQty: "",
            },
          ]);
        }

        console.log("data fetched successfully");
      } else if (response.status === 404) {
        toast.warning("Data not found");

        settransaction_date("");
        settransaction_no("");
        setRowData([
          {
            serialNumber: 1,
            itemCode: "",
            itemName: "",
            billQty: "",
          },
        ]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };


  const [globalItem, setGlobalItem] = useState(null);
  const [global, setGlobal] = useState(null);

  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber;
    setGlobal(GlobalSerialNumber);
    const GlobalItem = params.data.itemCode;
    setGlobalItem(GlobalItem);
    setShowModal2(true);
    console.log("Opening popup...");
  };


  const handleItem = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce(
      (max, row) => Math.max(max, row.serialNumber),
      0
    );

    selectedData.forEach((item) => {
      const existingItemWithSameCode = updatedRowDataCopy.find(
        (row) => row.serialNumber === global && row.itemCode === globalItem
      );

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
      } else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
        };
        updatedRowDataCopy.push(newRow);
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };

  const handleItemCode = async (params) => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    try {
      const response = await fetch(`${config.apiBaseUrl}/getitemcodepurdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_code, Item_code: params.data.itemCode }),
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRow = rowData.map((row) => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find((item) => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                itemCode: matchedItem.Item_code,
                itemName: matchedItem.Item_name,
              };
            }
          }
          return row;
        });
        setRowData(updatedRow);
        console.log(updatedRow);
      } else if (response.status === 404) {
        toast.warning("Data not found!", {
          onClose: () => {
            const updatedRowData = rowData.map((row) => {
              if (row.itemCode === params.data.itemCode) {
                return {
                  ...row,
                  itemCode: "",
                  itemName: "",
                };
              }
              return row;
            });
            setRowData(updatedRowData);
          },
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleSaveButtonClick = async () => {
    if (!transaction_date) {
      toast.warning("Missing required field: Transaction Date");
      setError(" ");
      return;
    }
  
    const invalidRow = rowData.find(
      (row) =>
        !row.itemCode || row.itemCode.trim() === "" ||
        !row.itemName || row.itemName.trim() === "" ||
        row.billQty === undefined || row.billQty === null || row.billQty === ""
    );
  
    if (invalidRow) {
      toast.warning("Please fill Item Code, Item Name, and Qty for all rows before saving.");
      return;
    }
  
    setLoading(true);
  
    try {
      const Header = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        transaction_date,
        created_by: sessionStorage.getItem("selectedUserCode"),
      };
  
      const response = await fetch(`${config.apiBaseUrl}/openingitemhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
  
      if (response.ok) {
        const searchData = await response.json();
        const [{ transaction_no }] = searchData;
        settransaction_no(transaction_no);
        toast.success("Data Inserted Successfully");
  
        await OpeningItemDetails(transaction_no);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const OpeningItemDetails = async (transaction_no) => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.billQty > 0
      );

      setLoading(true);

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          created_by: sessionStorage.getItem("selectedUserCode"),
          transaction_date,
          transaction_no,
          Item_SNo: row.serialNumber,
          Item_code: row.itemCode,
          Item_name: row.itemName,
          bill_qty: row.billQty,
        };

        const response = await fetch(`${config.apiBaseUrl}/addOpeningItemDetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        }
        );

        if (response.ok) {
          console.log("Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
          console.error(errorResponse.details || errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;
    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
    setRowData(updatedRowData);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        itemCode: '',
        itemName: '',
        Hsn: '',
        purchaseQty: '',
        baseuom: '',
        purchaseAmt: '',
        TotalItemAmount: ''
      };
      setRowData([newRow]);
    }
    else {
      const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
        ...row,
        serialNumber: index + 1
      }));
      setRowData(updatedRowDataWithNewSerials);
    }
  };


  const handleDeleteButtonClick = async () => {
    if (!transaction_no) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    showConfirmationToast(
      "Are you sure you want to delete the data?",
      async () => {
        setLoading(true);
        try {
          const detailResult = await OIDetailDelete();
          const headerResult = await OIHeaderDelete();

          if (headerResult === true && detailResult === true) {
            console.log("Data Deleted Successfully");
            toast.success("Data Deleted Successfully", {
              autoClose: true,
              onClose: () => {
                window.location.reload();
              },
            });
          } else {
            const errorMessage = headerResult !== true ? headerResult : detailResult;
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error executing API calls:", error);
          toast.error('Error occurred: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data deletion cancelled.");
      }
    );
  };


  const OIHeaderDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/openingitemdelhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
        return errorResponse.message || errorResponse.details;
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      return "Error occurred during header deletion.";
    }
  };

  const OIDetailDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deleteOpeningItemDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
        return errorResponse.message || errorResponse.details;
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      return "Error occurred during detail deletion.";
    }
  };

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: "", itemName: "", purchaseQty: 0 };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([
          { serialNumber: 1, itemCode: "", itemName: "", purchaseQty: "" },
        ]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const columnDefs = [
    {
      headerName: "S.No",
      field: "serialNumber",
      maxWidth: 80,
      sortable: false,
      editable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 50,
      tooltipValueGetter: (p) =>"Delete",
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
        </svg>
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false
    },
    {
      headerName: "Item Code",
      field: "itemCode",
      editable: true,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      sortable: false,
    },
    {
      headerName: "Item Name",
      field: "itemName",
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showSearchIcon = isWideEnough;

        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
            <div className="flex-grow-1">
              {params.editing ? (
                <input
                  type="text"
                  className="form-control"
                  value={params.value || ''}
                  onChange={(e) => params.setValue(e.target.value)}
                  style={{ width: '100%' }}
                />
              ) : (
                params.value
              )}
            </div>

            {showSearchIcon && (
              <span
                className="icon searchIcon"
                style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={() => handleClickOpen(params)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Qty",
      field: "billQty",
      editable: true,
      filter: true,
      // cellEditor: "agNumberCellEditor",
      sortable: false,
      valueSetter: (params) => {
        const newValue = params.newValue?.toString().trim();
        const isValid = /^\d*$/.test(newValue);
        if (isValid) {
          params.data.billQty = newValue;
          return true;
        }
        return false; 
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    flex: 1,
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal2 = () => setShowModal2(true);
  const handleCloseModal2 = () => setShowModal2(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleOpeningItem(transaction_no);
    }
  };
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleOI = async (data) => {
    setSaveButtonVisible(false);
    setLoading(true);
    console.log(data)
    if (data && data.length > 0) {
      const [{ transactionNo, transactionDate }] = data;

      const No = document.getElementById("transactionno");
      if (No) {
        No.value = transactionNo;
        settransaction_no(transactionNo);
      } else {
        console.error("transactionNO element not found");
      }

      const Date = document.getElementById("Date");
      if (Date) {
        Date.value = transactionDate;
        settransaction_date(formatDate(transactionDate));
      } else {
        console.error("transactionDate element not found");
      }

      await OpeningBalanceDetail(transactionNo);
    } else {
      console.log("Data not fetched...!");
      setLoading(false);
    }
  };

  const OpeningBalanceDetail = async (transactionNo) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getallOpeningItemDetail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transaction_no: transactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        searchData.forEach((item) => {
          const {
            Item_SNo,
            Item_code,
            Item_name,
            bill_qty
          } = item;
          newRowData.push({
            serialNumber: Item_SNo,
            itemCode: Item_code,
            itemName: Item_name,
            billQty: bill_qty
          });
        });
        setRowData(newRowData);
      } else if (response.status === 404) {
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
    window.location.reload();
  };

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    settransaction_date(currentDate);
  }, []);

  return (
    <div className="container-fluid ">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3 rounded-5 " style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold"> Opening Item</h4> </div>
          <div className='desktopbuttons'>
            <div className='d-flex justify-content-end row'>
              {saveButtonVisible &&
                ['add', 'all permission'].some(permission => openingPermissions.includes(permission)) && (
                  <div className='col-md-3 mt-1 mb-5' ><a className='border-none text-success p-1' title="Save" onClick={handleSaveButtonClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                  </svg>
                  </a>
                  </div>
                )}
              {['delete', 'all permission'].some(permission => openingPermissions.includes(permission)) && (
                <div className='col-md-3 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' title="Delete" onClick={handleDeleteButtonClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
                </a>
                </div>
              )}
              <div className="col-md-3 mt-1 me-3 mb-5">
                <a className='border-none text-dark p-1' title="Reload" onClick={handleReload} style={{ cursor: "pointer" }}> <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
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
                    {['add', 'all permission'].some(permission => openingPermissions.includes(permission)) && (
                      <div className='col-md-5 mt-1  p-2' ><a className='border-none text-success p-1' title="Save" onClick={handleSaveButtonClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                        <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                      </svg>
                      </a>
                      </div>
                    )}
                    {['delete', 'all permission'].some(permission => openingPermissions.includes(permission)) && (
                      <div className='col-md-5 mt-1 me-0 p-2' ><a className='border-none text-danger p-1' onClick={handleDeleteButtonClick} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                      </svg>
                      </a>
                      </div>
                    )}
                    <a className='border-none text-dark p-1 d-flex justify-content-center' onClick={handleReload} title="Reload" style={{ cursor: "pointer" }}> <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
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
            <label className={` fw-bold ${deleteError && !transaction_no ? "red" : ""}`}>Transaction No</label>
            <div className="position-relative">
              <input
                type="text"
                id="transactionno"
                className="form-control pe-5"
                placeholder=""
                required
                title="Please fill the transaction no here"
                value={transaction_no}
                onKeyPress={handleKeyPress}
                autoComplete="off"
                onChange={(e) => settransaction_no(e.target.value)} />
              <a
                className="position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                style={{ zIndex: 2,cursor:'pointer' }}
                onClick={handleShowModal}
                title='Opening Item Help'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </a>
            </div>
          </div>
          <div className='col-md-3 mb-2'>
            <label className={`fw-bold ${error && !transaction_date ? 'text-danger' : ''}`}>Transaction Date{!showAsterisk && <span className="text-danger">*</span>}</label>
            <div className="position-relative">
              <input
                type="date"
                id="Date"
                className="form-control pe-5"
                value={transaction_date}
                min={financialYearStart}
                max={financialYearEnd}
                onChange={(e) => settransaction_date(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className='row '>
          <div className='d-flex justify-content-end'>
            <div className='desktopbuttons'>
              <div className='d-flex justify-content-end me-2'>
                <button className=' col-md-7 salesbutton me-2' title="Add Row" onClick={handleAddRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
                </button>
                <button className='col-md-7 salesbutton' title="Less Row" onClick={handleRemoveRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8" />
                </svg>
                </button>
              </div>
            </div>
            <div className='mobile_buttons mt-2'>
              <div className='d-flex justify-content-end me-2'>
                <button className=' col-md-7 salesbutton me-2' onClick={handleAddRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
                </button>
                <button className='col-md-7 salesbutton' onClick={handleRemoveRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8" />
                </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="ag-theme-alpine" style={{ height: 330, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={(params) => setGridApi(params.api)}
            onSelectionChanged={onSelectionChanged}
            onCellKeyDown={(event) => {
              if (event.event.key === 'Enter') {
                event.event.preventDefault();

                const currentField = event.column.getColId();
                const currentIndex = navigationOrder.indexOf(currentField);

                if (currentIndex !== -1 && currentIndex < navigationOrder.length - 1) {
                  const nextField = navigationOrder[currentIndex + 1];

                  event.api.startEditingCell({
                    rowIndex: event.node.rowIndex,
                    colKey: nextField,
                  });
                }
              }
            }}
          />
        </div>
      </div>
      {showModal && (
        <AttriHdrInputPopup open={showModal} handleClose={handleCloseModal} handleOI={handleOI} />
      )}
      {showModal2 && (
        <PurchaseItemPopup open={showModal2} handleClose={handleCloseModal2} handleItem={handleItem} />
      )}
    </div>
  );
};

export default VendorProductTable;
