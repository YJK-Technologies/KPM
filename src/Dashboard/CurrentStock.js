import React, { useState, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
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
  const [error, setError] = useState("");
  const [return_date, setreturn_date] = useState("");
  const [status, setStatus] = useState(0);

  const [columnDefs] = useState([
    { headerName: "Item Code", field: "Item_code" },
    { headerName: "Item Name", field: "Item_name"},
    { headerName: "Opening Item Qty", field: "OpeningItemQty"},
    { headerName: "Purchase Qty", field: "PurchaseQty"},
    { headerName: "Sales Return Qty", field: "SalesReturnQty"},
    { headerName: "Purchase Return Qty", field: "PurchaseReturnQty" },
    { headerName: "Sales Qty", field: "SalesQty"},
    { headerName: "Total Qty", field: "Total_Quantity"},
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
          const response = await fetch(`${config.apiBaseUrl}/getCurrentStockDetails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code: companyCode,item_code:item }),
          });
          if(response.ok){
            const data = await response.json();
            setRowData(data);
          }
          else if(response.status === 404){
            console.log('Data not found')
            setRowData([])
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchCurrentStockData();
    }, [item]);

    const filteredOptionItem = Array.isArray(itemDrop)
    ? itemDrop.map((option) => ({
        value: option.Item_code,
        label: `${option.Item_code} - ${option.Item_name}`,
      }))
    : [];
  
      const handleChangeItem = (selected) => {
        setSelectedItem(selected);
        setItem(selected ? selected.value : '');
        setError(false);
      };
  
    const navigate = useNavigate();
    
    const handleNavigateToDashboard = () => {
      navigate(-1);
    };
  

  
  return (
    <div className="container-fluid ">
      <div className="card shadow-lg border-0 p-5 rounded-5 " style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'>
            <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Current Stock</h4> </div>
          <div className='d-flex justify-content-end row'>
           
            <div className='col-md-5 mt-1 me-5 text-danger'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" onClick={handleNavigateToDashboard}>
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
            </svg>
            </div>
          </div>
        </div>
        <div className="row mb-3">
            <div className="col-md-3">
            <label> Item Code</label>
            <Select 
             type="text" 
             className="exp-input-field"
             value={selectedItem}
             onChange={handleChangeItem}
             options={filteredOptionItem}   
             />
            </div>
           
         </div>
        <div className="ag-theme-alpine mt-4" style={{ height: 330, width: "100%" }}>
          <AgGridReact
           rowData={rowData}
           columnDefs={columnDefs}
           pagination={true}
           paginationAutoPageSize={true}
            />
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;

