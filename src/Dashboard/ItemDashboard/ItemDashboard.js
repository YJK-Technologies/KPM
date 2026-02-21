import React, { useState, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import './iDash.css'
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  CellStyleModule,
  ValidationModule,
  RowSelectionModule,
  CustomEditorModule,
  TextEditorModule,
  SelectEditorModule,
  NumberEditorModule,
  DateEditorModule
} from 'ag-grid-community';
import '../../App.css';
import { ToastContainer, toast } from 'react-toastify';
import { format } from 'date-fns';
import Select from 'react-select';
import * as XLSX from 'xlsx';
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
  SelectEditorModule,
  NumberEditorModule,
  DateEditorModule
]);
const config = require('../../ApiConfig');

const VendorProductTable = () => {
  const [activeTab, setActiveTab] = useState("Products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [varient, setVarient] = useState("");
  const [unit, setUnit] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [stockValue, setStockValue] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [Transactiondrop, setTransactiondrop] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [partycode, setPartyCode] = useState('');

  useEffect(() => {
    const fetchDataByTab = async () => {
      try {
        let url = "";
        let body = {};
        const companyCode = sessionStorage.getItem("selectedCompanyCode");

        if (activeTab === "Products") {
          url = `${config.apiBaseUrl}/Product`;
          body = { company_code: companyCode };
        } else if (activeTab === "Units") {
          url = `${config.apiBaseUrl}/DashboardUnit`;
          body = { company_code: companyCode };
        } else if (activeTab === "Variants") {
          url = `${config.apiBaseUrl}/getAllItemVarient`;
          body = { company_code: companyCode };
        } else {
          return;
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        const mappedData = data.map((item, index) => {
          let name = "";

          if (activeTab === "Products") {
            name = `${item.Item_code} - ${item.Item_name}`;
          } else if (activeTab === "Units") {
            name = item.Item_SecondaryUOM;
          } else if (activeTab === "Variants") {
            name = item.Item_variant;
          }

          return {
            id: index,
            name: name,
          };
        });

        setItemList(mappedData);
      } catch (error) {
        console.error("Fetch error:", error.message);
      }
    };

    fetchDataByTab();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Products") {
      const companyCode = sessionStorage.getItem("selectedCompanyCode");

      fetch(`${config.apiBaseUrl}/Transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_code: companyCode }),
      })
        .then((res) => res.json())
        .then((val) => {
          setTransactiondrop(val);

          if (val.length > 0) {
            const firstOption = {
              value: val[0].attributedetails_name,
              label: val[0].attributedetails_name,
            };
            setSelectedTransaction(firstOption);
            setTransactionType(firstOption.value);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch transaction data:", err);
        });
    }
  }, [activeTab]);

  const handleChangetransaction = (selectedTransaction) => {
    setSelectedTransaction(selectedTransaction);
    setTransactionType(selectedTransaction ? selectedTransaction.value : '');
  };

  const filteredOptionTransaction = Transactiondrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredList = itemList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnDefsMap = {
    Products: [
      {
        headerName: "Transaction Date",
        field: "transaction_date",
        valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
      },
      {
        headerName: "Transaction No",
        field: "transaction_no",
      },
      {
        headerName: "Item Name",
        field: "item_name",
      },
      {
        headerName: "Vendor/Customer Code",
        field: "party_code",
      },
      {
        headerName: "Vendor/Customer Name",
        field: "party_name",
      },
      {
        headerName: "Quantity",
        field: "bill_qty",
      },
      {
        headerName: "Transaction Type",
        field: "transaction_type",
      },
      {
        headerName: "Item Amount",
        field: "item_amt",
      },
      {
        headerName: "Total Amount",
        field: "bill_rate",
      },
    ],
    Variants: [
      {
        headerName: 'Item Name',
        field: 'item_name',
      },
      {
        headerName: 'Item Variant',
        field: 'Item_variant',
      },
      {
        headerName: 'Current Stock',
        field: 'Current_Stock',
      },
      {
        headerName: 'Total Purchase Stock',
        field: 'Total_Purchased_Stock',
      },
      {
        headerName: 'Total Sales Stock',
        field: 'Total_Sales_Stock',
      },
      {
        headerName: 'Stock Value',
        field: 'Stock_Value',
      },
    ],
    Units: [
      {
        headerName: 'Item Name',
        field: 'Item_name',
      },
      {
        headerName: 'Item Weight',
        field: 'Item_weight',
      },
      {
        headerName: 'UOM',
        field: 'Item_primary_uom',
      },
      {
        headerName: 'Secondary UOM',
        field: 'Item_SecondaryUOM',
      },
      {
        headerName: 'Stock Value',
        field: 'StockValue',
      },
      {
        headerName: 'Current Stock',
        field: 'CurrentStock',
      },
    ],
  };

  const [columnDefs, setColumnDefs] = useState(columnDefsMap["Products"]);

  const handleItemClick = async (item) => {
    setSelectedItem(item.id);

    if (!item || !item.name) {
      toast.error("Invalid item data");
      return;
    }

    const companyCode = sessionStorage.getItem("selectedCompanyCode");

    try {
      if (activeTab === "Products") {
        const item_code = item.name.split(" - ")[0];

        const response = await fetch(`${config.apiBaseUrl}/getitemstockvalue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_code, company_code: companyCode }),
        });

        if (response.ok) {
          const searchData = await response.json();
          const [{ item_code, Item_stock, Stock_Value, Standard_Purchase_Price, Standard_Sales_Price }] = searchData;
          setSalesPrice(Standard_Sales_Price);
          setPurchasePrice(Standard_Purchase_Price);
          setStockQty(Item_stock);
          setStockValue(Stock_Value);
          setItemCode(item_code);
          setSelectedItemCode(item_code);

          const mode = selectedTransaction?.value || '';
          const transResponse = await fetch(`${config.apiBaseUrl}/TransDetail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_code, mode, company_code: companyCode }),
          });

          if (transResponse.ok) {
            const transData = await transResponse.json();
            setRowData(transData);
          } else if (transResponse.status === 404) {
            toast.warning("Transaction data not found");
            setRowData([]);
          }
        }
      } else if (activeTab === "Variants") {
        const variant = item.name;
        const response = await fetch(`${config.apiBaseUrl}/itemvairentname`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Item_variant: variant, company_code: companyCode }),
        });

        if (response.ok) {
          const searchData = await response.json();
          setRowData(searchData);
          setVarient(searchData[0]?.Item_variant || "");
        } else if (response.status === 404) {
          toast.error("Variant data not found");
        }
      } else if (activeTab === "Units") {
        const uom = item.name;
        const response = await fetch(`${config.apiBaseUrl}/uomdetail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UOM: uom, company_code: companyCode }),
        });

        if (response.ok) {
          const searchData = await response.json();
          setRowData(searchData);
          setUnit(searchData[0]?.Item_SecondaryUOM || "");
        } else if (response.status === 404) {
          toast.error("UOM data not found");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    }
  };

  useEffect(() => {
    if (activeTab !== "Products") return;

    if (partycode && selectedItemCode && fromDate && toDate) {
      SelectedItemPartyDate();
    } else if (fromDate && toDate) {
      SelectedItemDate();
    } else if (partycode && selectedItemCode) {
      SelectedItemParty();
    } else if (selectedItemCode) {
      SelectedItem(selectedItemCode);
    }
  }, [activeTab, selectedItemCode, selectedTransaction, fromDate, toDate]);

  const SelectedItemPartyDate = async () => {
    try {
      const mode = selectedTransaction ? selectedTransaction.value : '';

      const response = await fetch(`${config.apiBaseUrl}/alltransdetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_code: selectedItemCode, mode: mode, start_date: fromDate, end_date: toDate, party_code: partycode }),
      });

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData)
      } else if (response.status === 404) {
        console.log("Data Not found")
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const SelectedItemDate = async () => {
    try {
      const mode = selectedTransaction ? selectedTransaction.value : '';

      const response = await fetch(`${config.apiBaseUrl}/datetransdetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_code: selectedItemCode, mode: mode, start_date: fromDate, end_date: toDate }),
      });

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData)
      } else if (response.status === 404) {
        console.log("Data Not found")
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const SelectedItemParty = async () => {
    try {
      const mode = selectedTransaction ? selectedTransaction.value : '';

      const response = await fetch(`${config.apiBaseUrl}/partytransdetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_code: selectedItemCode, mode: mode, party_code: partycode, company_code: sessionStorage.getItem("selectedCompanyCode") }),
      });

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData)
      } else if (response.status === 404) {
        console.log("Data Not found");
        setRowData([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const SelectedItem = async (itemcode,) => {
    try {
      const mode = selectedTransaction ? selectedTransaction.value : '';

      const response = await fetch(`${config.apiBaseUrl}/TransDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_code: itemcode, mode: mode, company_code: sessionStorage.getItem("selectedCompanyCode") }),
      });

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData)
      } else if (response.status === 404) {
        toast.warning('Data not found');
        setRowData([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handlePartyCodeChange = (e) => {
    setPartyCode(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (partycode) {
        SelectedItemParty(partycode);
      }
    }
  };

  useEffect(() => {
    setColumnDefs(columnDefsMap[activeTab]);
    setSelectedItemId(null);
    setSelectedItem(null);
    setRowData([]);
  }, [activeTab]);

  const handleExportToExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    let transformedData;
    let fileName;

    // Check the activeTab and export accordingly
    switch (activeTab) {
      case "Products":
        transformedData = transformRowDataProducts(rowData);
        fileName = 'Products.xlsx';
        break;
      case "Variants":
        transformedData = transformRowDataVariants(rowData);
        fileName = 'Item_Variants.xlsx';
        break;
      case "Units":
        transformedData = transformRowDataUnits(rowData);
        fileName = 'Units.xlsx';
        break;
      default:
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, fileName);
  };

  // Products transform function
  const transformRowDataProducts = (data) => {
    return data.map(row => ({
      "Transaction Date": row.transaction_date,
      "Transaction No": row.transaction_no.toString(),
      "Item Name": row.item_name.toString(),
      "Vendor/Customer Code": row.party_code.toString(),
      "Vendor/Customer Name": row.party_name.toString(),
      "Quantity": row.bill_qty.toString(),
      "Transaction Type": row.transaction_type.toString(),
      "Item Amount": row.item_amt.toString(),
      "Total Amount": row.bill_rate.toString(),
    }));
  };

  // Variants transform function
  const transformRowDataVariants = (data) => {
    return data.map(row => ({
      "Item Name": row.item_name,
      "Item Variant": row.Item_variant,
      "Current Stock": row.Current_Stock.toString(),
      "Total Purchase Stock": row.Total_Purchased_Stock.toString(),
      "Total Sales Stock": row.Total_Sales_Stock.toString(),
      "Stock Value": row.Stock_Value.toString(),
    }));
  };

  const transformRowDataUnits = (data) => {
    return data.map(row => ({
      "Item Name": row.Item_name,
      "Item Weight": row.Item_weight.toString(),
      "UOM": row.Item_primary_uom.toString(),
      "Secondary UOM": row.Item_SecondaryUOM.toString(),
      "Stock Value": row.StockValue.toString(),
      "Current Stock": row.CurrentStock.toString(),
    }));
  };


  return (
    <div className="container-fluid h-100">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg rounded-2 bg-white p-3 mb-3">
        <div className="d-flex justify-content-center " >
          <div className="radio-input d-flex ms-3 gap-3">
            {["Products", "Variants", "Units"].map((tab) => (
              <label key={tab}>
                <input
                  type="radio"
                  name="value-radio"
                  value={tab}
                  checked={activeTab === tab}
                  onChange={() => setActiveTab(tab)}
                />
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </label>
            ))}
            <span className="selection"></span>
          </div>
        </div>
      </div>
      <div className="row ms-2 h-100 mb-2" >
        <div
          className="col-md-3 bg-white mb-3 border-end rounded-2 d-flex flex-column"
          style={{ height: "720px", maxHeight: "auto" }}
        >
          <h5 className="fw-bold text-capitalize p-3 pb-0">{activeTab}</h5>
          <div className="p-3 pt-2">
            <input
              type="text"
              className="form-control mb-3"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-grow-1 overflow-auto px-3 pb-3" style={{ minHeight: 0 }}>
            <ul className="list-group">
              {filteredList.map((item) => (
                <li
                  key={item.id}
                  className={`list-group-item ${selectedItemId === item.id ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleItemClick(item)}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-9 p-3 mt-0 pt-0 d-flex flex-column gap-3">
          {activeTab === "Products" && (
            <div className="shadow-lg p-3 rounded-2 bg-white">
              {selectedItem !== null && selectedItem !== undefined ? (
                <>
                  <h5 className="fw-bold mb-3">Selected Item: {itemCode}</h5>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Sales Price:</strong>
                       ₹ {salesPrice}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Purchase Price:</strong>
                       ₹ {purchasePrice}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Stock Quantity:</strong>
                       {stockQty}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Stock Value:</strong>
                       ₹ {stockValue}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted">
                  <h5 className="fw-bold">No item selected</h5>
                  <p>Please select a product from the list to view details.</p>
                </div>
              )}
            </div>
          )}
          <div className="shadow-lg bg-white p-3 rounded-3">
            <div className="row mb-2">
              {activeTab === "Products" && (
                <>
                  <div className="col-md-2 mb-2">
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control pe-5"
                        placeholder="Enter Party Code..."
                        autoComplete="off"
                        title="Enter Customer or Vendor Code"
                        value={partycode}
                        onChange={handlePartyCodeChange}
                        onKeyDown={handleKeyDown}
                      />
                      <a
                        className="position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                        style={{ zIndex: 2 }}
                        onClick={() => SelectedItemParty()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="col-md-1">
                    <label className="fw-bold">From</label>
                  </div>
                  <div className="col-md-2">
                    <input
                      type="date"
                      className="form-control"
                      value={fromDate}
                      onChange={handleFromDateChange}
                    />
                  </div>
                  <div className="col-md-1">
                    <label className="fw-bold">To</label>
                  </div>
                  <div className="col-md-2">
                    <input
                      type="date"
                      className="form-control"
                      value={toDate}
                      onChange={handleToDateChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <Select
                      classNamePrefix="react-select"
                      value={selectedTransaction}
                      onChange={handleChangetransaction}
                      options={filteredOptionTransaction}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="row mb-2">
              <div className="col-md-12 text-end">
                <button className="btn btn-dark p-2" onClick={handleExportToExcel}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="currentColor" className="bi bi-file-earmark-excel-fill"
                    viewBox="0 0 16 16">
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="ag-theme-alpine"
              style={{
                height: activeTab === "Products"
                  ? selectedItem ? 430 : 465
                  : selectedItem ? 630 : 630,
                width: "100%",
                // transition: "height 0.3s ease"
              }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                pagination={true}
                key={activeTab}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductTable;