
import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import LoadingScreen from '../BookLoader';
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
import secureLocalStorage from "react-secure-storage"; 

// import '../App.css';
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
function Grid() {
    const [rowData, setRowData] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [editedData, setEditedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemCodeDrop, setItemCodeDrop] = useState([]);
    const [item, setItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const companyName = sessionStorage.getItem('selectedCompanyName');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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

                    const defaultOption = {
                        value: "All",
                        label: "All - All"
                    };
                    setSelectedItem(defaultOption);
                    setItem("All");
                } else {
                    console.warn("No data found");
                    setItemCodeDrop([]);
                }
            } catch (error) {
                console.error("Error fetching item codes:", error);
            }
        };

        fetchItemCode();
    }, []);

    const filteredOptionItem = itemCodeDrop.map((option) => ({
        value: option.Item_code,
        label: `${option.Item_code} - ${option.Item_name}`,
    }));

    const handleChangeItem = (selectedItem) => {
        setSelectedItem(selectedItem);
        setItem(selectedItem ? selectedItem.value : '');
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
            // headerCheckboxSelection: true,
            // checkboxSelection: true,
            headerName: "Transaction Date",
            field: "transaction_date",
            editable: true,
        },
        {
            headerName: "Item Code",
            field: "Item_code",
            editable: true,
        },
        {
            headerName: "Item Name",
            field: "Item_name",
            editable: true,
        },
        {
            headerName: "Qty",
            field: "bill_qty",
            editable: true,
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
        if (item) {
            fetchGstReport()
        }
    }, [item]);

    const fetchGstReport = async () => {
        setLoading(true);
        try {
            const body = {
                Item_code: item,
                company_code: sessionStorage.getItem("selectedCompanyCode"),
            };

            const response = await fetch(`${config.apiBaseUrl}/getOpeningItemPeriod`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const fetchedData = await response.json();
                const newRows = fetchedData.map((matchedItem) => ({
                    transaction_date: formatDate(matchedItem.transaction_date),
                    Item_code: matchedItem.Item_code,
                    Item_name: matchedItem.Item_name,
                    bill_qty: matchedItem.bill_qty,
                }));
                setRowData(newRows);
            } else if (response.status === 404) {
                console.log("Data Not found");
                toast.warning("Data Not found");
                setRowData([])
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message);
                console.error(errorResponse.details || errorResponse.message);
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const transformRowData = (data) => {
        return data.map(row => ({
            "Transaction Date": row.transaction_date,
            "Item Code": row.Item_code,
            "Item Name": row.Item_name.toString(),
            "Qty": row.bill_qty.toString(),
        }));
    };

    const handleExportToExcel = () => {
        if (rowData.length === 0) {
            toast.warning('There is no data to export.');
            return;
        }

        const headerData = [
            ['Opening Item Analysis'],
            [`Company Name: ${companyName}`],
            []
        ];

        const transformedData = transformRowData(rowData);

        const worksheet = XLSX.utils.aoa_to_sheet(headerData);

        XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Opening Item');
        XLSX.writeFile(workbook, 'Opening_Item_Analysis.xlsx');
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
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            {loading && <LoadingScreen />}
            <div className="card shadow-lg border-0 p-3 rounded-5 " >
                <div className="d-flex justify-content-between">
                    <div className='d-flex justify-content-start'> <h4 className=" fw-semibold text-dark fs-2 fw-bold">Opening Item Analysis</h4> </div>
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
                        <label className='fw-bold'>Item Code</label>
                        <div title="Please select the item coe">
                        <Select
                            value={selectedItem}
                            onChange={handleChangeItem}
                            options={filteredOptionItem}
                            classNamePrefix="react-select"
                            placeholder=""
                        />
                    </div>
                    </div>
                </div>
                <div className="ag-theme-alpine mt-4" style={{ height: 330, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        onCellValueChanged={onCellValueChanged}
                        onSelectionChanged={onSelectionChanged}
                        pagination={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default Grid;
