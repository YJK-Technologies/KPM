import { useState, useEffect } from "react";
import * as React from 'react';
import '../../App.css';
import { AgGridReact } from 'ag-grid-react';
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
import { toast } from 'react-toastify';
import Select from 'react-select';
import { format } from 'date-fns';
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

const SalesReturnPopup = ({ open, handleClose, handleDataView }) => {
    const [rowData, setRowData] = useState([]);
    const [bill_date, setbill_date] = useState("");
    const [bill_no, setbill_no] = useState("");
    const [dely_chlno, setdely_chlno] = useState("");
    const [sales_type, setsales_type] = useState("");
    const [customer_code, setcustomer_code] = useState("");
    const [customer_name, setcustomer_name] = useState("");
    const [pay_type, setpay_type] = useState("");
    const [order_type, setorder_type] = useState("");
    const [return_no, setReturn_no] = useState("");
    const [paydrop, setPaydrop] = useState([]);
    const [salesdrop, setSalesdrop] = useState([]);
    const [selectedPay, setSelectedPay] = useState('');
    const [selectedSales, setSelectedSales] = useState('');
    const [Type, setType] = useState("sales");
    const [loading, setLoading] = useState('');

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/paytype`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
                Screen_Type: Type

            }),
        })
            .then((response) => response.json())
            .then((data) => setPaydrop(data))
            .catch((error) => console.error("Error fetching payment types:", error));

        fetch(`${config.apiBaseUrl}/salestype`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
                Screen_Type: Type

            }),
        })
            .then((response) => response.json())
            .then((data) => setSalesdrop(data))
            .catch((error) => console.error("Error fetching sales types:", error));
    }, []);

    const filteredOptionPay = paydrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filteredOptionSales = salesdrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangePay = (selectedOption) => {
        setSelectedPay(selectedOption);
        setpay_type(selectedOption ? selectedOption.value : '');
    };

    const handleChangeSales = (selectedOption) => {
        setSelectedSales(selectedOption);
        setsales_type(selectedOption ? selectedOption.value : '');
    };

    const columnDefs = [
        {
            checkboxSelection: true,
            headerName: "Bill Date",
            field: "bill_date",
            editable: false,
            valueFormatter: (params) => {
                if (!params.value) return '';
                const date = new Date(params.value);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            },
        },
        {
            headerName: "Bill No",
            field: "bill_no",
            editable: false,
        },
        {
            headerName: "Return No",
            field: "return_no",
            editable: false,
        },
        {
            headerName: "Return Date",
            field: "return_date",
            editable: false,
            valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
        },
        {
            headerName: "Return Reason",
            field: "return_reason",
            editable: false,
        },
        {
            headerName: "Return Person",
            field: "return_person",
            editable: false,
        },
        {
            headerName: "Customer Code",
            field: "customer_code",
            editable: false,
        },
        {
            headerName: "Customer Name",
            field: "customer_name",
            editable: false,
        },
        {
            headerName: "Sales Type",
            field: "sales_type",
            editable: false,
        },
        {
            headerName: "Sales Amount",
            field: "sale_amt",
            editable: false,
        },
        {
            headerName: "Bill Amount",
            field: "bill_amt",
            editable: false,
        },
        {
            headerName: "Pay Type",
            field: "pay_type",
            editable: false,
        },
        {
            headerName: "Key Field",
            field: "key_field",
            editable: false,
            hide: true,
        },
        {
            headerName: "Round Off",
            field: "roff_amt",
            editable: false,
        },
        {
            headerName: "Tax Amount",
            field: "tax_amount",
            editable: false,
        },
    ];

    const defaultColDef = {
        resizable: true,
        wrapText: true,
        sortable: true,
        editable: true,
    };

    const handleSearchItem = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getsalesreturnsearchViewdata`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bill_date, company_code: sessionStorage.getItem('selectedCompanyCode'), bill_no, return_no, dely_chlno, sales_type, customer_code, customer_name, pay_type, order_type })
            });
            if (response.ok) {
                const searchData = await response.json();
                setRowData(searchData);
                console.log("data fetched successfully")
            } else if (response.status === 404) {
                toast.warning('Data not found!', {
                    onClose: () => {
                        setRowData([]);
                        clearInputs([])
                    }
                })
                console.log("Data not found");
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

    const handleReload = () => {
        clearInputs([])
        setRowData([])
    };

    const clearInputs = () => {
        setbill_date("");
        setbill_no("");
        setdely_chlno("");
        setsales_type("");
        setcustomer_code("");
        setcustomer_name("");
        setpay_type("");
        setorder_type("");
        setReturn_no("");
        setSelectedPay("");
        setSelectedSales("");
    };

    const [selectedRows, setSelectedRows] = useState([]);
    const handleRowSelected = (event) => {
        setSelectedRows(event.api.getSelectedRows());
    };

    const handleConfirm = () => {
        const selectedData = selectedRows.map(row => ({
            BillNo: row.bill_no,
            Retper: row.return_person,
            RetReason: row.return_reason,
            BillDate: row.bill_date,
            SalesType: row.sales_type,
            PayType: row.pay_type,
            TotalTax: row.tax_amount,
            TotalAmount: row.bill_amt,
            CustomerName: row.customer_name,
            SaleAmount: row.sale_amt,
            CustomerCode: row.customer_code,
            RoundOff: row.roff_amt,
            TotalSales: row.sale_amt,
            ReturnNo: row.return_no,
            ReturnDate: row.return_date,
        }));
        console.log('Selected Data:', selectedData);
        handleDataView(selectedData);
        handleClose();
        clearInputs([])
        setRowData([])
    }

    return (
        <div className="container-fluid mt-0">
            {loading && <LoadingScreen />}
            {open && (
                <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
                        <div className="modal-content rounded-4 shadow-lg">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Sales Return Help</h5>
                                <button type="button" className="btn-close" onClick={handleClose}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Bill Date</label>
                                        <div className="">
                                            <input
                                                type="date"
                                                placeholder=''
                                                className="form-control pe-5"
                                                id="billdate"
                                                title="Please enter the bill date"
                                                value={bill_date}
                                                onChange={(e) => setbill_date(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Bill No</label>
                                        <input
                                            type="text"
                                            placeholder=''
                                            className="form-control"
                                            id="billno"
                                            title="Please enter the bill no"
                                            maxLength={10}
                                            value={bill_no}
                                            onChange={(e) => setbill_no(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Sales Return No</label>
                                        <input
                                            type="text"
                                            placeholder=''
                                            className="form-control"
                                            id="Return no"
                                            value={return_no}
                                            title="Please enter the sales return no"
                                            maxLength={10}
                                            onChange={(e) => setReturn_no(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Customer Code</label>
                                        <input type="text"
                                            placeholder=''
                                            className="form-control"
                                            id="cuscode"
                                            maxLength={18}
                                            value={customer_code}
                                            title="Please enter the customer code"
                                            onChange={(e) => setcustomer_code(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Customer Name </label>
                                        <input
                                            type="text"
                                            placeholder=""
                                            className="form-control"
                                            id="cusname"
                                            maxLength={50}
                                            title="Please enter the customer name"
                                            value={customer_name}
                                            onChange={(e) => setcustomer_name(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Sales Type </label>
                                        <div title="Please select the sales type">
                                        <Select
                                            id="salesType"
                                            value={selectedSales}
                                            onChange={handleChangeSales}
                                            options={filteredOptionSales}
                                            classNamePrefix="react-select"
                                            placeholder=""
                                            title="Please select the sales type"
                                            data-tip="Please select a payment type"
                                            autoComplete="off"
                                        />
                                    </div>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="fw-bold">Pay Type</label>
                                        <div title="Please select the pay type">
                                        <Select
                                            id="payType"
                                            value={selectedPay}
                                            onChange={handleChangePay}
                                            options={filteredOptionPay}
                                            classNamePrefix="react-select"
                                            placeholder=""
                                            title="Please select the pay type"
                                            data-tip="Please select a payment type"
                                            autoComplete="off"
                                        />
                                    </div>
                                    </div>
                                    <div className="col-md-3 mb-2 mt-4">
                                        <button className="btn btn-primary pt-1" onClick={handleSearchItem} title="Search">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                            </svg>
                                        </button>
                                        <button className="btn btn-primary pt-1 ms-2" onClick={handleReload} title="Reload">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 0-.908-.418A6 6 0 1 0 8 2v1z" />
                                                <path d="M8 1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H5a.5.5 0 0 1 0-1h2.5V1.5A.5.5 0 0 1 8 1z" />
                                            </svg>
                                        </button>
                                        <button className="btn btn-primary pt-1 ms-2" onClick={handleConfirm} title="Confirm">
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
                                        rowSelection="multiple"
                                        pagination
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

export default SalesReturnPopup;
