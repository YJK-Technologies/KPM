import { useState, useEffect } from 'react';
import '../../App.css';
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
const columnDefs = [
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    headerName: "Item Code",
    field: "Item_code",
    cellStyle: { textAlign: "center" },
    editable: false,
  },
  {
    headerName: "Item Name",
    field: "Item_name",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Variant",
    field: "Item_variant",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Item Weight",
    field: "Item_wigh",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Base UOM",
    field: "Item_BaseUOM",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "SecondaryUOM",
    field: "Item_SecondaryUOM",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Short Name",
    field: "Item_short_name",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Without Tax",
    field: "Item_Last_salesRate_ExTax",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "With Tax",
    field: "Item_Last_salesRate_IncludingTax",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Purchase Price",
    field: "Item_std_purch_price",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Sales Price",
    field: "Item_std_sales_price",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Stock Code",
    field: "Item_stock_code",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Stock TYPE",
    field: "Item_stock_type",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Tax Type",
    field: "Item_purch_tax_type",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Cash Or Credit",
    field: "Item_Costing_Method",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "HSN Code",
    field: "hsn",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Register Brand",
    field: "Item_Register_Brand",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Our Brand",
    field: "Item_Our_Brand",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Status",
    field: "status",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Combined Tax Details",
    field: "combined_tax_details",
    editable: false,
    cellStyle: { textAlign: "center" },
  },
  {
    headerName: "Combined Tax Percent",
    field: "combined_tax_percent",
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


const PurchaseItemPopup = ({ open, handleClose, handleItem }) => {
  const [rowData, setRowData] = useState([]);
  const [Item_code, setItem_code] = useState("");
  const [Item_variant, setItem_variant] = useState("");
  const [Item_name, setItem_name] = useState("");
  const [Item_short_name, setItem_short_name] = useState("");
  const [Item_Our_Brand, setItem_Our_Brand] = useState("");
  const [status, setstatus] = useState("");
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [ourbranddrop, setourbranddrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [loading, setLoading] = useState('');

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/ourbrand`, {
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
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const filteredOptionBrand = ourbranddrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeBrand = (selectedBrand) => {
    setSelectedBrand(selectedBrand);
    setItem_Our_Brand(selectedBrand ? selectedBrand.value : '');
  };

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleSearchItem = async () => {
    setLoading(true);
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    try {
      const response = await fetch(`${config.apiBaseUrl}/itempursearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_code, Item_variant, Item_name, Item_short_name, Item_Our_Brand, status }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found')
        setRowData([]);
        clearInputs([])
        console.log("Data not found"); // Log the message for 404 Not Found
      } else {
        console.log("Bad request"); // Log the message for other errors
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
    setItem_code("");
    setItem_variant("");
    setItem_name("");
    setItem_short_name("");
    setItem_Our_Brand("");
    setstatus("");
    setSelectedBrand("");
    setSelectedStatus("");
  };
  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const handleConfirm = () => {
    const selectedData = selectedRows.map(row => ({
      itemCode: row.Item_code,
      itemName: row.Item_name,
      unitWeight: row.Item_wigh,
      purchaseAmt: row.Item_std_purch_price,
      taxType: row.Item_purch_tax_type,
      taxDetails: row.combined_tax_details,
      taxPer: row.combined_tax_percent,
    }));
    handleItem(selectedData);
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
                  <h5 className="modal-title fw-bold fs-3">Item Help</h5>
                  <button type="button" title="Close" className="btn-close" onClick={handleClose}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Item Code</label>
                      <div className="">
                        <input
                          type="text"
                          className="form-control pe-5"
                          id="ItemCode"
                          value={Item_code}
                          onChange={(e) => setItem_code(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Variant </label>
                      <input type="text" className="form-control"
                        id="Variant"
                        value={Item_variant}
                        onChange={(e) => setItem_variant(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Item Name </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ItemName"
                        value={Item_name}
                        onChange={(e) => setItem_name(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold"> Short Name</label>
                      <input
                        type='text'
                        className='exp-input-field form-control'
                        id="ShortName"
                        value={Item_short_name}
                        onChange={(e) => setItem_short_name(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Our Brand</label>
                      <div title="Please select the our brand">
                      <Select
                        type="text"
                        id='OurBrand'
                        classNamePrefix="react-select"
                        maxLength={30}
                        value={selectedBrand}
                        onChange={handleChangeBrand}
                        // onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        options={filteredOptionBrand}
                        autoComplete="off"
                      />
                    </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="fw-bold">Status</label>
                      <div title="Please select the status">
                      <Select
                        type="text"
                        className=""
                        classNamePrefix="react-select"
                        id='Status'
                        maxLength={18}
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                        // onKeyDown={(e) => e.key === 'Enter' && handleSearchItem()}
                        options={filteredOptionStatus}
                        autoComplete="off"
                      />
                    </div>
                    </div>
                    <div className="col-md-3 mb-2 mt-4 ">
                      <button onClick={handleSearchItem} title="Search" className="btn btn-primary pt-1"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
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
                      <button className='btn btn-primary pt-1 ms-2' title="Confirm">
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
                      paginationPageSize={5}
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

export default PurchaseItemPopup;
