import React, { useState, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  CellStyleModule,
  ValidationModule,
  RowSelectionModule,
  CustomEditorModule,
  TextEditorModule,
  SelectEditorModule
} from 'ag-grid-community';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage"; 

// Register necessary modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  PaginationModule,
  CellStyleModule,
  ValidationModule,
  RowSelectionModule,
  CustomEditorModule,
  TextEditorModule,
  SelectEditorModule
]);
const config = require('./ApiConfig');

const VendorProductTable = () => {
  const user_code = sessionStorage.getItem('user_code');
  const [userName, setUserName] = useState("");
  const [userCode, setUserCode] = useState("");
  const [companyNo, setCompanyNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [shortName, setShortName] = useState("");
  const [locationNo, setLocationNo] = useState("");
  const [rowData, setRowData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedRadio, setSelectedRadio] = useState(null);

  const columnData = [
    {
      checkboxSelection: true,
      headerName: 'S.No',
      field: 'ItemSNO',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Company Code',
      field: 'company_no',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Company Name',
      field: 'company_name',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Location code',
      field: 'location_no',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Location Name',
      field: 'location_name',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Short Name',
      field: 'short_name',
      sortable: false,
      editable: false,
      hide: true
    },
  ];

  const UserPermission = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getUserPermission`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_id: sessionStorage.getItem('role_id'), company_code: sessionStorage.getItem('selectedCompanyCode'), user_code: sessionStorage.getItem('user_code') }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        sessionStorage.setItem('permissions', JSON.stringify(data));
        const storedPermissions = JSON.parse(sessionStorage.getItem('permissions'));
        console.log('Stored permissions:', storedPermissions);

        window.dispatchEvent(new Event("permissionsUpdated"));

      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleSave = (data) => {
    if (!data || Object.keys(data).length === 0) {
      toast.warning("Please select a row ");
      return;
    }

    sessionStorage.setItem('selectedCompanyCode', data.company_no);
    sessionStorage.setItem('selectedCompanyName', data.company_name);
    sessionStorage.setItem('selectedLocationCode', data.location_no);
    sessionStorage.setItem('selectedLocationName', data.location_name);
    sessionStorage.setItem('selectedShortName', data.short_name);
    sessionStorage.setItem('selectedUserName', data.user_name);
    sessionStorage.setItem('selectedUserCode', data.user_code);

    setUserName(data.user_name);
    setUserCode(data.user_code);
    setCompanyNo(data.company_no);
    setCompanyName(data.company_name);
    setLocationName(data.location_name);
    setShortName(data.short_name);
    setLocationNo(data.location_no);

    const event = new CustomEvent('storageUpdate');
    window.dispatchEvent(event);

    toast.success("Data Saved Successfully");
  };

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getusercompany`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user_code })
        });

        if (response.ok) {
          const searchData = await response.json();
          if (searchData.length > 0) {
            setRowData(searchData.map((item, index) => ({
              ...item,
              ItemSNO: index + 1
            })));

            const savedCompanyNo = sessionStorage.getItem('selectedCompanyCode');
            const savedLocationNo = sessionStorage.getItem('selectedLocationCode');

            if (savedCompanyNo && savedLocationNo) {
              const savedData = searchData.find(item =>
                item.company_no === savedCompanyNo && item.location_no === savedLocationNo
              );
              if (savedData) {
                setUserName(savedData.user_name);
                setUserCode(savedData.user_code);
                setCompanyNo(savedData.company_no);
                setCompanyName(savedData.company_name);
                setLocationName(savedData.location_name);
                setShortName(savedData.short_name);
                setLocationNo(savedData.location_no);
                setSelectedData(savedData);
              } else {
                setDefaultData(searchData[0]);
              }
            } else {
              setDefaultData(searchData[0]);
            }
          } else {
            console.log("Data not found");
          }
        } else {
          console.log("Bad request");
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    };

    const setDefaultData = (data) => {
      setUserName(data.user_name);
      setUserCode(data.user_code);
      setCompanyNo(data.company_no);
      setCompanyName(data.company_name);
      setLocationName(data.location_name);
      setShortName(data.short_name);
      setLocationNo(data.location_no);
      setSelectedData(data);
    };

    fetchUserData();
  }, [user_code]);

  const onSelectionChanged = (event) => {
    const selectedNode = event.api.getSelectedNodes()[0];
    if (selectedNode) {
      const selectedData = selectedNode.data;
      setSelectedData(selectedData);
      setUserName(selectedData.user_name);
      setUserCode(selectedData.user_code);
      setCompanyNo(selectedData.company_no);
      setCompanyName(selectedData.company_name);
      setLocationName(selectedData.location_name);
      setShortName(selectedData.short_name);
      setLocationNo(selectedData.location_no);
    } else {
      setSelectedData(null);
    }
  };

  return (
    <div className="container-fluid ">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-5 rounded-5 " style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">List Of Companies</h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='col-md-5 me-5 mt-1 mb-5' ><a className='border-none text-success p-1' title="Save" style={{ cursor: "pointer" }} onClick={() => handleSave(selectedData)}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
              <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
            </svg>
            </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>User Code: {userCode}</label>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>User Name: {userName}</label>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Company Code: {companyNo}</label>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Company Name: {companyName}</label>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Location Code: {locationNo}</label>
          </div>
          <div className="col-md-3 mb-2">
            <label className='fw-bold'>Location Name: {locationName} </label>
          </div>
        </div>
        <div className="ag-theme-alpine mt-4" style={{ height: 330, width: '100%' }}>
          <AgGridReact
            columnDefs={columnData}
            rowData={rowData}
            defaultColDef={{ editable: true, resizable: true }}
            rowSelection="single"
            onSelectionChanged={onSelectionChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;
