import React, { useState, useRef, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from "react-secure-storage"; 
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
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const [columnDefs] = useState([
    { 
      headerName: "Item Code", 
      field: "Item_code",
      editable:false 
    },
    { 
      headerName: "Item Name", 
      field: "Item_name",
      editable:false 
    },
    { 
      headerName: "Opening Qty", 
      field: "OpeningItemQty",
      editable:false 
    },
    { 
      headerName: "Purchase Qty", 
      field: "PurchaseQty",
      editable:false 
    },
    { 
      headerName: "Purchase Return Qty", 
      field: "PurchaseReturnQty",
      editable:false 
    },
    { 
      headerName: "Sales Qty", 
      field: "SalesQty",
      editable:false 
    },
    { 
      headerName: "Sales Return Qty", 
      field: "SalesReturnQty",
      editable:false 
    },
    { 
      headerName: "Total Qty", 
      field: "Total_Quantity",
      editable:false 
    },
    { 
      headerName: "Total Value", 
      field: "stock_value",
      editable:false 
    },
  ]);

  const [rowData, setRowData] = useState([]);
  const [itemDrop, setItemDrop] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [item, setItem] = useState("");

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const companyPermissions = permissions
    .filter(permission => permission.screen_type === 'GSTReport')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getCurrentStockItemCode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setItemDrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);

  useEffect(() => {
    const fetchCurrentStockData = async () => {
      try {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");
        const response = await fetch(`${config.apiBaseUrl}/getTotalStockValueDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code: companyCode, item_code: item }),
        });
        if (response.ok) {
          const data = await response.json();
          setRowData(data);
        } else if (response.status === 404) {
          console.log('Data not found');
          setRowData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchCurrentStockData();
  }, [item]);

  useEffect(() => {
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.classList.add("title-animation", "visible");
      }

      if (buttonRef.current) {
        buttonRef.current.classList.add("button-animation", "visible");
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (rowData.length > 0) {
      document.querySelectorAll(".row-animation").forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("show");
        }, index * 100); // staggered effect
      });
    }
  }, [rowData]);


  const handleChangeItem = (selected) => {
    setSelectedItem(selected);
    setItem(selected ? selected.value : '');
  };

  const handleNavigateToDashboard = () => {
    navigate(-1);
  };

  const filteredOptionItem = Array.isArray(itemDrop)
    ? itemDrop.map((option) => ({
      value: option.Item_code,
      label: `${option.Item_code} - ${option.Item_name}`,
    }))
    : [];


// const handleExcelDownload = () => {
//     // Filter rows with meaningful data
//     const filteredRowData = rowData.filter(row =>
//       row.Item_code > 0 
//     );
  

//     // Format purchase row data using columnDefs
//     const formattedRowData = filteredRowData.map(row => {
//       const newRow = {};
//       columnDefs.forEach(col => {
//         if (!col.hide && col.field !== 'delete' && col.headerName) {
//           newRow[col.headerName] = row[col.field];
//         }
//       });
//       return newRow;
//     });

//     const rowDataSheet = XLSX.utils.json_to_sheet(formattedRowData);

  
//     // Build and export workbook
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Total Stock");
//     XLSX.writeFile(workbook, "total_stock.xlsx");
//   };
const companyName = sessionStorage.getItem('selectedCompanyName');
const transformRowData = (data) => {
  return data.map(row => ({
    "Item Code": row.Item_code,
    "Item Name": row.Item_name,
    "Opening Qty": row.OpeningItemQty.toString(),
    "Purchase Qty": row.PurchaseQty.toString(),
    "Purchase Return Qty": row.PurchaseReturnQty.toString(),
    "Sales Qty": row.SalesQty,
    "Sales Return Qty": row.SalesReturnQty,
    "Total Qty": row.Total_Quantity,
    "Total Value": row.stock_value,
  }));
};

   const handleExcelDownload = () => {
      if (rowData.length === 0) {
        toast.warning('There is no data to export.');
        return;
      }
  
      const headerData = [
        ['Total Stock'],
        [`Company Name: ${companyName}`],
        []
      ];
  
      const transformedData = transformRowData(rowData);
  
      const worksheet = XLSX.utils.aoa_to_sheet(headerData);
  
      XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Total Stock');
      XLSX.writeFile(workbook, 'Total_Stock.xlsx');
    };
  return (
    <div className="container-fluid ">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-5 rounded-5 " style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'>
            <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Total Stock</h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='col-md-5 mt-1 text-danger' title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" onClick={handleNavigateToDashboard}>
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
              </svg>
            </div>
            <div className='col-md-2 mt-1 mb-3' ><a className='border-none text-dark p-1' onClick={handleExcelDownload} title="Excel" style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                      </svg>
                      </a>
                      </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="fw-bold"> Item Name</label>
            <Select
              className="exp-input-field"
              value={selectedItem}
              onChange={handleChangeItem}
              options={filteredOptionItem}
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="ag-theme-alpine mt-4" style={{ height: 330, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationAutoPageSize={true}
            rowSelection="Single"
            onSelectionChanged={() => console.log("Selection Changed")}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;

