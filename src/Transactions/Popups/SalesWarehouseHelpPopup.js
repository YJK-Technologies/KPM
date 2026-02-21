import { useState, useEffect } from "react";
import * as React from 'react';
import '../../App.css';
import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
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

const SalesWarehouseHelpPopup = ({ open, handleClose, handleWarehouse }) => {
    const [rowData, setRowData] = useState([]);
    const [warehouse_code, setwarehouse_code] = useState("");
    const [warehouse_name, setwarehouse_name] = useState("");
    const [status, setstatus] = useState("");
    const [location_no, setlocation_no] = useState("");
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusdrop, setStatusdrop] = useState([]);
    const [loading, setLoading] = useState('');

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

    const filteredOptionStatus = statusdrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangeStatus = (selectedStatus) => {
        setSelectedStatus(selectedStatus);
        setstatus(selectedStatus ? selectedStatus.value : '');
    };

    const columnDefs = [
        {
            checkboxSelection: true,
            headerName: "Warehouse Code",
            field: "warehouse_code",
            editable: false,
        },
        {
            headerName: "Warehouse Name",
            field: "warehouse_name",
            editable: false,
        },
        {
            headerName: "Status",
            field: "status",
            editable: false,
        },
        {
            headerName: "Location No",
            field: "location_no",
            editable: false,
        },
    ];

    const defaultColDef = {
        resizable: true,
        wrapText: true,
        sortable: true,
        editable: true,
        filter: true,
    };

    const handlewarehouseSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/warehouseSearchdata`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), warehouse_code, warehouse_name, status, location_no }) // Send company_no and company_name as search criteria
            });
            if (response.ok) {
                const searchData = await response.json();
                setRowData(searchData);
                console.log("data fetched successfully")
            } else if (response.status === 404) {
                toast.warning("Data Not Found");
                setRowData([]);
                clearInputs([]);
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.error);
                toast.error(errorResponse.message);
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedRows, setSelectedRows] = useState([]);

    const handleRowSelected = (event) => {
        setSelectedRows(event.api.getSelectedRows());
    };

    const handleConfirm1 = () => {
        const selectedData1 = selectedRows.map(row => ({
            warehouse: row.warehouse_code
        }));
        console.log('Selected Data:', selectedData1);
        handleWarehouse(selectedData1);
        handleClose();
        clearInputs([]);
        setRowData([]);
        setSelectedRows([]);
    }

    const handleReload = () => {
        clearInputs([])
        setRowData([])
    };

    const clearInputs = () => {
        setwarehouse_code("");
        setwarehouse_name("");
        setstatus("");
        setlocation_no("");
        setSelectedStatus("");
    };

    return (
        <div className="container-fluid mt-0  m-5">
            {loading && <LoadingScreen />}
            {open && (
                <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
                        <div className="modal-content rounded-4 shadow-lg">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold fs-3">Warehouse Help</h5>
                                <button type="button" className="btn-close" onClick={handleClose}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Warehouse Code</label>
                                        <div className="">
                                            <input
                                                type='text'
                                                id='transaction_no'
                                                className='form-control pe-5'
                                                maxLength={18}
                                                value={warehouse_code}
                                                onChange={(e) => setwarehouse_code(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handlewarehouseSearch()}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Warehouse Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            maxLength={250}
                                            value={warehouse_name}
                                            onChange={(e) => setwarehouse_name(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handlewarehouseSearch()}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Status</label>
                                        <div title="Please select the status">
                                        <Select
                                            id="status"
                                            value={selectedStatus}
                                            onChange={handleChangeStatus}
                                            options={filteredOptionStatus}
                                            placeholder=""
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Location No</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={location_no}
                                            maxLength={18}
                                            onChange={(e) => setlocation_no(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handlewarehouseSearch()}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="col-md-3 mb-2 mt-4">
                                        <button className="btn btn-primary pt-1" onClick={handlewarehouseSearch} title="Search">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
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

                                        <button className="btn btn-primary pt-1 ms-2" onClick={handleConfirm1} title="Confirm">
                                            {/* Check Icon */}
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
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesWarehouseHelpPopup;
