import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import { AgGridReact } from 'ag-grid-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; import {
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

const VendorProductTable = ({ open, handleClose, handleOI }) => {

  const [rowData, setRowData] = useState([]);
  const [transaction_no, settransaction_no] = useState("");
  const [transaction_date, settransaction_date] = useState("");
  const [Item_code, setItem_code] = useState("");
  const [Item_name, setItem_name] = useState("");
  const [loading, setLoading] = useState("");


  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Transaction No",
      field: "transaction_no",
      cellStyle: { textAlign: "center" },
      editable: false,
    },
    {
      headerName: "Transaction Date",
      field: "transaction_date",
      editable: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Item No",
      field: "Item_SNo",
      editable: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Item Code",
      field: "Item_code",
      editable: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Item Name",
      field: "Item_name",
      editable: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Qty",
      field: "bill_qty",
      editable: false,
      cellStyle: { textAlign: "center" },
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
      const response = await fetch(`${config.apiBaseUrl}/openingItemSearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no, transaction_date, Item_code, Item_name }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning("Data Not Found")
          .then(() => {
            setRowData([]);
            clearInputs([])
          });
        console.log("Data not found"); // Log the message for 404 Not Found
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
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
    settransaction_no("");
    settransaction_date("");
    setItem_code("");
    setItem_name("");
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const handleConfirm = () => {
    const selectedData = selectedRows.map(row => ({
      transactionNo: row.transaction_no,
      transactionDate: row.transaction_date
    }));
    handleOI(selectedData)
    handleClose();
    clearInputs([]);
    setRowData([]);
    setSelectedRows([]);
  }

  return (
    <div>
      {loading && <LoadingScreen />}
      {open && (
        <div className="container-fluid mt-0  m-5">
          <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg mt-0" role="document">
              <div className="modal-content rounded-4 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold fs-3">Opening Item Help</h5>
                  <button type="button" title="Close" className="btn-close" onClick={handleClose}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Transaction No</label>
                      <div className="">
                        <input
                          type="text"
                          className="form-control pe-5"
                          value={transaction_no}
                          onChange={(e) => settransaction_no(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Transaction Date </label>
                      <input
                        type="text"
                        className="form-control"
                        value={transaction_date}
                        onChange={(e) => settransaction_date(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>

                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Item Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={Item_code}
                        onChange={(e) => setItem_code(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Item Name </label>
                      <input
                        type="text"
                        className="form-control"
                        value={Item_name}
                        onChange={(e) => setItem_name(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-3 mb-2 mt-4 ">
                      <button className="btn btn-primary pt-1"title="Search" onClick={handleSearchItem}> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                      </svg></button>
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
                      pagination={true}
                      rowSelection="multiple"
                      paginationPageSize={5}
                      onSelectionChanged={handleRowSelected}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProductTable;
