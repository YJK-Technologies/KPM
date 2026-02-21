import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
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
  const gridRef = useRef();
  const [month, setMonth] = useState("");
  const [error, setError] = useState("");
  const [item, setItem] = useState(null);
  const [item_code, setItem_Code] = useState("");
  const [item_variant, setItem_variant] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCodeDrop, setItemCodeDrop] = useState([]);
  const [itemVariantDrop, setItemVariantDrop] = useState([]);
  const [selectedItem_code, setSelectedItem_code] = useState("");
  const [selectedItem_variant, setSelectedItem_variant] = useState("");
  const [isVariantSelected, setIsVariantSelected] = useState(false);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");
  const [loading, setLoading] = useState(false);

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const itemStockPermissions = permissions
    .filter(permission => permission.screen_type === 'ItemWiseStock')
    .map(permission => permission.permission_type.toLowerCase());

  const filteredOptionItem = itemCodeDrop.map((option) => ({
    value: option.Item_code,
    label: `${option.Item_code} - ${option.Item_name}`,
  }));

  const handleChangeItem = async (selectedItem) => {
    setSelectedItem(selectedItem);
    setItem(selectedItem ? selectedItem.value : '');
    if (selectedItem) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getitemcodeVariant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            Item_code: selectedItem.value
          }),
        });

        if (response.ok) {
          const data = await response.json();

          const defaultVariant = filteredOptionVariant.find(option => option.attributedetails_name === data.variant);
          setSelectedItem_variant(defaultVariant);
        } else {
          console.warn("No variants found for the selected item");
        }
      } catch (error) {
        console.error("Error fetching item variants:", error);
      }
    }
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/variant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((data) => data.json())
      .then((val) => setItemVariantDrop(val));
  }, []);

  const filteredOptionVariant = itemVariantDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeVariant = async (selectedVariant) => {
    setSelectedItem_variant(selectedVariant);
    setItem_variant(selectedVariant ? selectedVariant.value : '');
    if (selectedVariant) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getitemcodeVariant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            Item_code: "",
            Item_variant: selectedVariant.value,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          const defaultItem = filteredOptionItem.find(option => option.Item_code === data.itemcode);
          setSelectedItem(defaultItem || null);
        }
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    }
  };

  useEffect(() => {
    if (isVariantSelected) {
      return;
    }

    const fetchItemCode = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getItemCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        });

        const data = await response.json();
        if (response.ok) {
          const updatedData = [{ Item_code: "All", Item_name: "All" }, ...data];
          setItemCodeDrop(updatedData);
        } else {
          console.warn("No data found for item codes");
          setItemCodeDrop([]);
        }
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    };

    fetchItemCode();
  }, [isVariantSelected]);

  const [selectedCompanyNo, setselectedCompanyNo] = useState(null);
  const [selectedCompanyLogo, setSelectedCompanyLogo] = useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCompanyNoChange = (event) => {
    setMonth(event.target.value);
  };

  const handleSearch = async () => {
    if (!month) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true);

      try {
        const response = await fetch(`${config.apiBaseUrl}/getDateWiseItemStock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            month,
            item_code: item,
            item_variant: item_variant,
            company_code: sessionStorage.getItem('selectedCompanyCode')
          })
        });
        if (response.ok) {
          const fetchedData = await response.json();
          const newRows = fetchedData.map((matchedItem) => ({
            transaction_date: formatDate(matchedItem.transaction_date),
            Item_code: matchedItem.Item_code,
            item_variant: matchedItem.item_variant,
            Item_name: matchedItem.Item_name,
            openingItemQty: matchedItem.openingItemQty,
            PurchaseQty: matchedItem.PurchaseQty,
            ReceivedGoodsQty: matchedItem.ReceivedGoodsQty,
            SalesReturnQty: matchedItem.SalesReturnQty,
            TotalRecQty: matchedItem.TotalRecQty,
            SalesQty: matchedItem.SalesQty,
            PurchaseReturnQty: matchedItem.PurchaseReturnQty,
            TaxInvoiceQty: matchedItem.TaxInvoiceQty,
            DCItemQty: matchedItem.DCItemQty,
            TotalIssQty: matchedItem.TotalIssQty,
            ClosingStock: matchedItem.ClosingStock,
          }));
          setRowData(newRows);
          console.log("data fetched successfully")
        } else if (response.status === 404) {
          console.log("Data not found");
          toast.warning("Data not found");
          setRowData([]);
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
        toast.error("Error fetching search data:", error);
      }finally {
        setLoading(false);
      }
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    const formattedCreatedDate = formatDate(rowData.created_date);
    const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };

  const columnDefs = [
    {
      headerName: "Date",
      field: "transaction_date",
      editable: false
    },
    {
      headerName: "Item Code",
      field: "Item_code",
      editable: false
    },
    {
      headerName: "Item variant",
      field: "item_variant",
      editable: false

    },
    {
      headerName: "Item Name",
      field: "Item_name",
      editable: false

    },
    {
      headerName: "Opening Item Qty",
      field: "openingItemQty",
      editable: false
    },
    {
      headerName: "Received",
      children: [
        {
          headerName: "Purchase Qty",
          field: "PurchaseQty",
          editable: false
        },
        {
          headerName: "Sales Return Qty",
          field: "SalesReturnQty",
          editable: false
        },
        {
          headerName: "Total Received",
          field: "TotalRecQty",
          editable: false
        },
      ],
    },
    {
      headerName: "Issued",
      children: [
        {
          headerName: "Sales",
          field: "SalesQty",
          editable: false
        },
        {
          headerName: "Purchase Return",
          field: "PurchaseReturnQty",
          editable: false
        },
        {
          headerName: "Total Issued",
          field: "TotalIssQty",
          editable: false
        },
      ],
    },
    {
      headerName: "Closing",
      field: "ClosingStock",
      editable: false
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

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  // const onCellValueChanged = (params) => {
  //   const updatedRowData = [...rowData];
  //   const rowIndex = updatedRowData.findIndex(
  //     (row) => row.company_no === params.data.company_no
  //   );
  //   if (rowIndex !== -1) {
  //     updatedRowData[rowIndex][params.colDef.field] = params.newValue;
  //     setRowData(updatedRowData);
  //     setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
  //   }
  // };


  const handleExcelDownload = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const companyName = sessionStorage.getItem('selectedCompanyName');


    const headerData = [
      ['Item Wise Stock'],
      [`Company Name: ${companyName}`],
      [`Date Range: ${month}`],
      [] // Empty row for spacing
    ];

    const columnOrder = [
      "transaction_date", "Item_code", "item_variant", "Item_name", "openingItemQty",
      "PurchaseQty", "SalesReturnQty", "TotalRecQty",
      "SalesQty", "PurchaseReturnQty", "TotalIssQty",
      "ClosingStock"
    ];

    const multiLevelHeader = [
      [
        "Date", "Item Code", "Item Variant", "Item Name", "Opening Item Qty",
        "Received", "Received", "Received",
        "Issued", "Issued", "Issued",
        "Closing"
      ],
      [
        "", "", "", "", "",
        "Purchase Qty", "Sales Return Qty", "Total Received",
        "Sales", "Purchase Return", "Total Issued",
        "Closing Stock"
      ]
    ];

    const formattedRowData = rowData.map(row => {
      const ordered = {};
      columnOrder.forEach(key => {
        ordered[key] = row[key];
      });
      return ordered;
    });

    const dataSheet = XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.sheet_add_aoa(dataSheet, headerData, { origin: "A1" });

    XLSX.utils.sheet_add_aoa(dataSheet, multiLevelHeader, { origin: `A${headerData.length + 1}` });

    XLSX.utils.sheet_add_json(dataSheet, formattedRowData, { skipHeader: true, origin: `A${headerData.length + multiLevelHeader.length + 1}` });

    const mergeOffset = headerData.length;

    dataSheet["!merges"] = [
      { s: { r: mergeOffset + 0, c: 0 }, e: { r: mergeOffset + 1, c: 0 } }, // Date
      { s: { r: mergeOffset + 0, c: 1 }, e: { r: mergeOffset + 1, c: 1 } }, // Item Code
      { s: { r: mergeOffset + 0, c: 2 }, e: { r: mergeOffset + 1, c: 2 } }, // Item Variant
      { s: { r: mergeOffset + 0, c: 3 }, e: { r: mergeOffset + 1, c: 3 } }, // Item Name
      { s: { r: mergeOffset + 0, c: 4 }, e: { r: mergeOffset + 1, c: 4 } }, // Opening Item Qty
      { s: { r: mergeOffset + 0, c: 5 }, e: { r: mergeOffset + 0, c: 7 } }, // Received
      { s: { r: mergeOffset + 0, c: 8 }, e: { r: mergeOffset + 0, c: 10 } }, // Issued
      { s: { r: mergeOffset + 0, c: 11 }, e: { r: mergeOffset + 1, c: 11 } }, // Closing
    ];

    // Create workbook and export
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Date wise Item Stock");

    XLSX.writeFile(workbook, "Date_Wise_Item_Stock_data.xlsx");
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
          <div className='d-flex justify-content-start'> <h4 className=" fw-semibold text-dark fs-2 fw-bold">Item Wise Stock</h4> </div>
          <div className='col-md-3 d-flex justify-content-end row'>
            <div className='desktopbuttons'>
              <div className='row d-flex justify-content-end'>
                <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-dark p-1' title='Excel' onClick={handleExcelDownload} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
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
                      <div className='col-md-2 mt-1 mb-3' ><a className='border-none text-dark p-1' onClick={handleExcelDownload} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
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
            <label className={`fw-bold ${error && !month ? 'text-danger' : ''}`}>Month<span className="text-danger">*</span></label>
            <input
              id="cno"
              className="exp-input-field form-control"
              type="month"
              placeholder=""
              required
              title="Please enter the month"
              value={month}
              onChange={handleCompanyNoChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Item Code</label>
            <div title="Please select the item code">
            <Select
              id="status"
              value={selectedItem}
              onChange={handleChangeItem}
              options={filteredOptionItem}
              classNamePrefix="react-select"
              placeholder=""
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={25}
            />
          </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Item Variant</label>
            <div title="Please select the item varient">
            <Select
              id="ahsts"
              value={selectedItem_variant}
              onChange={handleChangeVariant}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              options={filteredOptionVariant}
              classNamePrefix="react-select"
              placeholder=""
              maxLength={25}
              isClearable
            />
          </div>
          </div>
          <div className="col-md-2 mb-2 mt-4">
            <button className="button2" onClick={handleSearch} title="Search">
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
      
            pagination={true}
            defaultColDef={defaultColDef}
            rowData={rowData}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;
