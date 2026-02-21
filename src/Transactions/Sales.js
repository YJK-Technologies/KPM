import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate, useLocation } from 'react-router-dom';
import SalesPopup from '../Transactions/Popups/SalesHelpPopup';
import CustomerHelp from '../Transactions/Popups/CustomerHelpPopup';
import ItemHelp from '../Transactions/Popups/SalesItemHelpPopup';
import WarehouseHelp from '../Transactions/Popups/SalesWarehouseHelpPopup';
import SalesDeletedHelp from '../Transactions/Popups/DeletedSalesHelpPopup';
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
import { ToastContainer, toast } from 'react-toastify';
import { Modal, Button } from "react-bootstrap";
import { BrowserMultiFormatReader } from "@zxing/library";
import { showConfirmationToast } from '../ToastConfirmation';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faSearch, faCamera } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../BookLoader';
import secureLocalStorage from "react-secure-storage"; 
import printDB from './printDB'; 

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

const VendorProductTable = () => {
  // const [showModal, setShowModal] = useState(false);
  // const [showModal2, setShowModal2] = useState(false);
  const [paydrop, setPaydrop] = useState([]);
  const [orderdrop, setOrderdrop] = useState([]);
  const [salesdrop, setSalesdrop] = useState([]);
  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', salesQty: 0, salesMode: '', discount: 0, ItemTotalWeight: 0, purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' }]);
  const [loading, setLoading] = useState(false);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [customerCode, setCustomerCode] = useState("");
  const [payType, setPayType] = useState("");
  const [salesType, setSalesType] = useState("");
  const [delvychellanno, setDelvychellanno] = useState("");
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState("");
  const [selectedPay, setSelectedPay] = useState(null);
  const [selectedSales, setSelectedSales] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [TotalBill, setTotalBill] = useState(0);
  const [TotalTax, setTotalTax] = useState(0)
  const [Totalsales, setTotalsales] = useState(0)
  const [round_difference, setRoundDifference] = useState(0)
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [authError, setAuthError] = useState("");
  const [status, setStatus] = useState('');
  const [customerName, setCustomerName] = useState("");
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [orderType, setOrderType] = useState(null);
  const [warehouseDrop, setWarehouseDrop] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedscreens, setSelectedscreens] = useState(null);
  const [Screens, setScreens] = useState(null);
  const [screensDrop, setScreensDrop] = useState([]);
  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });
  const [refNo, setRefNo] = useState("");
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [authorizeButton, setAuthorizeButton] = useState(false);
  const location = useLocation();
  const savedPath = sessionStorage.getItem('currentPath');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [salesModeDrop, setSalesModeDrop] = useState([]);
  const [selectedSalesMode, setSelectedSalesMode] = useState(null);
  const [salesMode, setSalesMode] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [warehouse, setWarehouse] = useState('');
  const navigate = useNavigate();
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [Type, setType] = useState("sales");
  const [updated, setupdated] = useState(false)
  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [printOption, setPrintOption] = useState("");
  const [printCopies, setPrintCopies] = useState(1);
  const [rowDataTerms, setRowDataTerms] = useState([{ serialNumber: 1, Terms_conditions: '' }]);
  const [itemCodeDrop, setItemCodeDrop] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const navigationOrder = ['itemCode', 'warehouse', 'salesQty', 'purchaseAmt'];
  const [screenDrop, setScreenDrop] = useState([]);
  const [Screen, setScreen] = useState('Sales');
  const [SelectedScreen, setSelectedscreen] = useState(null);
  const [isChecked, setIsChecked] = useState(false);

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const sales = permissions
    .filter(permission => permission.screen_type === 'Sales')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 0-indexed

    let startYear, endYear;

    if (currentMonth >= 4) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }

    const financialYearStartDate = `${startYear}-04-01`;
    const financialYearEndDate = `${endYear}-03-31`;

    setFinancialYearStart(financialYearStartDate);
    setFinancialYearEnd(financialYearEndDate);
  }, []);


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        const { Sales_mode, pay_type, sales_type, order_type, Party_code, warehouse_code, Transaction_type, Party_name, Print_templates, Print_copies, Print_options } = data[0];

        const setDefault = (type, setType, options, setSelected) => {
          if (type) {
            setType(type);
            setSelected(options.find((opt) => opt.value === type) || null);
          }
        };

        setDefault(Sales_mode, setSalesMode, filteredOptionSalesMode, setSelectedSalesMode);
        setDefault(pay_type, setPayType, filteredOptionPay, setSelectedPay);
        setDefault(sales_type, setSalesType, filteredOptionSales, setSelectedSales);
        setDefault(order_type, setOrderType, filteredOptionOrder, setSelectedOrder);
        setDefault(warehouse_code, setWarehouse, filteredOptionWarehouse, setSelectedWarehouse);
        setDefault(Transaction_type, setSalesType, filteredOptionSales, setSelectedSales);

        if (Party_code) setCustomerCode(Party_code);
        if (Party_name) setCustomerName(Party_name);
        if (Print_templates) setTemplateName(Print_templates);
        if (Print_options) setPrintOption(Print_options);
        if (Print_copies) setPrintCopies(Print_copies);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [paydrop, salesModeDrop, salesdrop, orderdrop, warehouseDrop, salesdrop]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
    setBillDate(currentDate);
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setScreensDrop(data))
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDashBoardType`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })

      .then((response) => response.json())
      .then((data) => {
        setScreenDrop(data);
        const defaultScreen = data.find((item) => item.attributedetails_name === "Sales") || data[0];
        if (defaultScreen) {
          setSelectedscreen({
            value: defaultScreen.attributedetails_name,
            label: defaultScreen.attributedetails_name,
          });
          setScreen(defaultScreen.attributedetails_name);
        }
      })
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const filteredOptionScreens = screensDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionScreen = screenDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeScreen = (selectedScreen) => {
    setSelectedscreen(selectedScreen);
    setScreen(selectedScreen ? selectedScreen.value : '');
  };

  useEffect(() => {
    const currentPath = location.pathname;
    console.log(`Current path: ${currentPath}`);
    if (savedPath !== '/Sales') {
      sessionStorage.setItem('screenSelection', 'Add');
    }
  }, [location]);

  useEffect(() => {
    const savedScreen = sessionStorage.getItem('screenSelection');
    if (savedScreen) {
      setSelectedscreens({ value: savedScreen, label: savedScreen === 'Add' ? 'Add' : 'Delete' });
      setScreens(savedScreen);
    } else {
      setSelectedscreens({ value: 'Add', label: 'Add' });
      setScreens('Add');
    }
  }, []);


  // Save to sessionStorage and update state when user changes selection
  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    const screenValue = selected?.value === 'Add' ? 'Add' : 'Delete';
    setScreens(screenValue);

    // Save the selection to sessionStorage
    sessionStorage.setItem('screenSelection', screenValue);
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getwarehousedrop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setWarehouseDrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getSalesMode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSalesModeDrop(data);
        if (data.length > 0) {
          const firstOption = {
            value: data[0].attributedetails_name,
            label: data[0].attributedetails_name,
          };
          setSelectedSalesMode(firstOption);
          setSalesMode(firstOption.value);
        }
      })
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const filteredOptionSalesMode = Array.isArray(salesModeDrop)
    ? salesModeDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const handleChangeSalesMode = (selectedSalesMode) => {
    setSelectedSalesMode(selectedSalesMode);
    setSalesMode(selectedSalesMode ? selectedSalesMode.value : '');
  };

  const filteredOptionWarehouse = warehouseDrop.map((option) => ({
    value: option.warehouse_code,
    label: option.warehouse_code,
  }));

  const handleChangeWarehouse = (selectedOption) => {
    setSelectedWarehouse(selectedOption);
    setWarehouse(selectedOption ? selectedOption.value : '');
  };

  const ItemSalesAmountCalculation = async (params) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesItemAmountCalculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Item_SNO: params.data.serialNumber, Item_code: params.data.itemCode, bill_qty: params.data.salesQty, discount: params.data.discount, item_amt: params.data.purchaseAmt,
          tax_type_header: params.data.taxType, tax_name_details: params.data.taxDetails, tax_percentage: params.data.taxPer, UnitWeight: params.data.unitWeight, keyfield: params.data.keyField, company_code: sessionStorage.getItem("selectedCompanyCode")
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                ItemTotalWeight: formatToTwoDecimalPoints(matchedItem.ItemTotalWeight ?? 0),
                TotalItemAmount: formatToTwoDecimalPoints(matchedItem.TotalItemAmount ?? 0),
                TotalTaxAmount: formatToTwoDecimalPoints(matchedItem.TotalTaxAmount ?? 0),
                discountAmount: formatToTwoDecimalPoints(matchedItem.DiscountAmount ?? 0),
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);

        let updatedRowDataTaxCopy = [...rowDataTax];

        searchData.forEach(item => {
          const existingItem = updatedRowDataTaxCopy.find(row => row.ItemSNO === item.ItemSNO && row.Item_code !== item.Item_code);

          if (existingItem) {
            const indexToRemove = updatedRowDataTaxCopy.indexOf(existingItem);
            updatedRowDataTaxCopy.splice(indexToRemove, 1);
          }
          const existingItemWithSameCode = updatedRowDataTaxCopy.find(row => row.ItemSNO === item.ItemSNO && row.Item_code === item.Item_code && row.TaxType === item.TaxType);

          if (existingItemWithSameCode) {
            existingItemWithSameCode.TaxPercentage = item.TaxPercentage ?? 0;
            existingItemWithSameCode.TaxAmount = parseFloat(item.TaxAmount ?? 0).toFixed(2);
          } else {
            const newRow = {
              ItemSNO: item.ItemSNO,
              TaxSNO: item.TaxSNO,
              Item_code: item.Item_code,
              TaxType: item.TaxType,
              TaxPercentage: item.TaxPercentage ?? 0,
              TaxAmount: parseFloat(item.TaxAmount ?? 0).toFixed(2),
              keyfield: item.keyfield,
            };
            updatedRowDataTaxCopy.push(newRow);
          }
        });

        updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);
        setRowDataTax(updatedRowDataTaxCopy);

        const hasSalesQty = updatedRowData.some(row => row.salesQty >= 0);

        if (hasSalesQty) {
          const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || 0).join(',');
          const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || 0).join(',');

          const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
          const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

          await TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

          console.log("TotalAmountCalculation executed successfully");
        } else {
          console.log("No rows with Sales Qty greater than 0 found");
        }

        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.error);
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    }

  };


  const TotalAmountCalculation = async (formattedTotalTaxAmounts, formattedTotalItemAmounts) => {
    if (parseFloat(formattedTotalTaxAmounts) >= 0 && parseFloat(formattedTotalItemAmounts) >= 0) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/SalesTotalAmountCalculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Tax_amount: formattedTotalTaxAmounts, sale_amt: formattedTotalItemAmounts, company_code: sessionStorage.getItem("selectedCompanyCode") }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log(typeof (data))
          const [{ rounded_amount, round_difference, TotalSales, TotalTax }] = data;
          setTotalBill(formatToTwoDecimalPoints(rounded_amount));
          setRoundDifference(formatToTwoDecimalPoints(round_difference));
          setTotalsales(formatToTwoDecimalPoints(TotalSales));
          setTotalTax(formatToTwoDecimalPoints(TotalTax));
        } else {
          const errorMessage = await response.text();
          console.error(`Server responded with error: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const handleItemCode = async (params) => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    const clearRowAndRecalculate = () => {
      const updatedRowData = rowData.map(row => {
        if (row.serialNumber === params.data.serialNumber) {
          return {
            ...row,
            itemCode: '',
            itemName: '',
            unitWeight: 0,
            purchaseAmt: 0,
            discount: 0,
            taxType: '',
            salesQty: 0,
            discountAmount: '',
            taxDetails: '',
            taxPer: '',
            warehouse: '',
            ItemTotalWeight: '',
            TotalTaxAmount: '',
            TotalItemAmount: ''
          };
        }
        return row;
      });

      setRowData(updatedRowData);

      // Recalculate total amounts
      const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || '0.00').join(',');
      const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || '0.00').join(',');

      const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
      const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

      TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/getItemCodeSalesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_code: params.data.itemCode, type: salesMode })
      });

      if (response.ok) {
        const searchData = await response.json();
        setIsLocked(true);

        const updatedRowData = rowData.map(row => {
          if (row.serialNumber === params.data.serialNumber) {
            const matchedItem = searchData[0];
            if (matchedItem) {
              return {
                ...row,
                itemCode: matchedItem.Item_code,
                itemName: matchedItem.Item_name,
                unitWeight: matchedItem.Item_wigh,
                discount: matchedItem.discount_Percentage,
                purchaseAmt: matchedItem.Item_std_sales_price,
                taxType: matchedItem.Item_sales_tax_type,
                taxDetails: matchedItem.combined_tax_details,
                taxPer: matchedItem.combined_tax_percent,
                keyField: `${row.serialNumber}-${matchedItem.Item_code}-${Date.now()}`,
                warehouse: selectedWarehouse ? selectedWarehouse.value : '',
              };
            }
          }
          return row;
        });

        setRowData(updatedRowData);
        console.log(updatedRowData);
        return true;
      } else if (response.status === 404) {
        toast.warning('Data not found!', {
          onClose: () => {
            clearRowAndRecalculate();
          }
        });
        return false;
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);

        clearRowAndRecalculate();
        return false;
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching data: " + error.message);

      clearRowAndRecalculate();
      return false;
    }
  };


  const handleWarehouseCode = async (params) => {

    const itemDetailsSet = rowData.some(
      (row) => row.itemCode === params.data.itemCode && row.itemName
    );

    if (!itemDetailsSet) {
      toast.warning("Please fetch item details first before setting the warehouse.");
      // .then(() => {
      //   
      //   const updatedRowData = rowData.map((row) => {
      //     if (row.itemCode === params.data.itemCode) {
      //       return {
      //         ...row,
      //         warehouse: "", 
      //       };
      //     }
      //     return row;
      //   });
      //   setRowData(updatedRowData);
      // });
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/getWarehouseCodeData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ warehouse_code: params.data.warehouse, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                warehouse: matchedItem.warehouse_code
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);
        console.log(updatedRowData);
      } else if (response.status === 404) {
        toast.warning('Data not found!', {
          onClose: () => {
            const updatedRowData = rowData.map(row => {
              if (row.itemCode === params.data.itemCode) {
                return {
                  ...row,
                  warehouse: ''
                };
              }
              return row;
            });
            setRowData(updatedRowData);
          }
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  }

  const handleSearchCustomer = async (code) => {
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getCustomerCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), customer_code: code }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          const [{ customer_code, customer_name }] = searchData
          setCustomerCode(customer_code);
          setCustomerName(customer_name);

          console.log("data fetched successfully")
        }
      } else if (response.status === 404) {
        toast.warning('Data not found');
        setCustomerCode('');
        setCustomerName('');
      } else {
        toast.warning('There was an error with your request.');
        setCustomerCode('');
        setCustomerName('');
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error('Error inserting data: ' + error.message);
      setCustomerCode('');
      setCustomerName('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPressRef = async (e) => {
    if (e.key === 'Enter') {
      const isSuccess = await handleRefNo(billNo);
      if (isSuccess) {
        TransactionStatus(billNo);
      }
    }
  };

  const TransactionStatus = async (billNo) => {
    console.log(TransactionStatus)
    try {
      const response = await fetch(`${config.apiBaseUrl}/salauthstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        const searchData = await response.json();
        if (Array.isArray(searchData)) {
          const formattedOptions = searchData.map(item => ({
            value: item.descriptions,
            label: item.attributedetails_name
          }));

          setStatus(formattedOptions);
          console.log(searchData);
        }
      } else {
        console.log("Failed to fetch some data");
        const errorResponse = await response.json();
        toast.error(errorResponse.message || "Bad request!")
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      toast.error("Error:", error)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchCustomer(customerCode);
      // paytype.current.focus();
    }
  };

  const handleChange = (e) => {
    const Customer = e.target.value;
    setCustomerCode(Customer);
  };

  //CODE ITEM CODE TO ADD NEW ROW FUNCTION
  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex } = params;
    const lastRowIndex = rowData.length - 1;
  if (colDef.field === 'salesQty' && rowIndex === lastRowIndex) {
      const serialNumber = rowData.length + 1;
      const newRowData = {
        serialNumber, delete: null, itemName: null, unitWeight: null, warehouse: null, salesQty: 0, totalWeight: null, purchaseAmt: null, taxAmt: null, totalAmt: null
      };
      setRowData(prevRowData => [...prevRowData, newRowData]);
    }
  
  };

  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    console.log(clickedRowIndex)
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber; // Assuming itemCode is used to identify the row

    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
    const updatedRowDataTax = rowDataTax.filter(row => Number(row.ItemSNO) !== serialNumberToDelete);

    setRowData(updatedRowData);
    setRowDataTax(updatedRowDataTax);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        delete: '',
        itemCode: '',
        itemName: '',
        search: '',
        unitWeight: '',
        warehouse: '',
        purchaseQty: '',
        ItemTotalWight: '',
        purchaseAmt: '',
        TotalTaxAmount: '',
        TotalItemAmount: ''
      };
      setRowData([newRow]);

      const formattedTotalItemAmounts = '0.00';
      const formattedTotalTaxAmounts = '0.00';

      TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);
    } else {
      const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
        ...row,
        serialNumber: index + 1
      }));
      setRowData(updatedRowDataWithNewSerials);

      const updatedRowDataTaxWithNewSerials = updatedRowDataTax.map((taxRow) => {
        const correspondingRow = updatedRowDataWithNewSerials.find(
          (dataRow) => dataRow.keyField === taxRow.keyfield
        );

        return correspondingRow
          ? { ...taxRow, ItemSNO: correspondingRow.serialNumber.toString() }
          : taxRow;
      });
      setRowDataTax(updatedRowDataTaxWithNewSerials);

      const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || '0.00').join(',');
      const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || '0.00').join(',');

      const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
      const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

      TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);
    }

  };


  function qtyValueSetter(params) {

    if (!params.data.warehouse || params.data.warehouse.trim() === "") {
      toast.warning('Please select a warehouse before entering the quantity.');
      return false;
    }

    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning('Please enter a valid numeric quantity.');
      return false;
    }
    if (newValue < 0) {
      toast.warning('Quantity cannot be negative.');
      return false;
    }

    params.data.salesQty = newValue;
    return true;
  }

  //mobile scanner functionality code
  const [showScanner, setShowScanner] = useState(false);
  const [editingParams, setEditingParams] = useState(null);

  const handleOpenScanner = (params) => {
    setEditingParams(params);
    setShowScanner(true);
  };

  const handleScanComplete = (barcode) => {
    if (editingParams) {
      editingParams.node.setDataValue("itemCode", barcode);
    }
    setShowScanner(false);
  };

  const BarcodeScanner = ({ onClose, onScan }) => {
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    useEffect(() => {
      detectBackCamera();

      return () => {
        stopCamera();
      };
    }, []);

    const detectBackCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");

        if (videoDevices.length > 0) {
          // Try to find the back camera first
          const backCamera = videoDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoDevices[0];

          startCamera(backCamera.deviceId);
        } else {
          console.error("No video devices found");
        }
      } catch (err) {
        console.error("Error detecting cameras:", err);
      }
    };

    const startCamera = async (deviceId) => {
      stopCamera();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId }, facingMode: "environment" }, // Force back camera on mobile
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startScanner();
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    const startScanner = () => {
      if (!scannerRef.current) {
        scannerRef.current = new BrowserMultiFormatReader();
      }

      scannerRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          onScan(result.getText());
        }
      });
    };

    const stopCamera = () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };

    const handleClose = () => {
      stopCamera();
      onClose();
    };

    return (
      <Modal show={true} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center", background: "black" }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%" }}></video>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 80,
      sortable: false,
      editable: false
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 25,
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return <FontAwesomeIcon title='Delete' icon={faTrash} style={{ cursor: 'pointer', marginRight: "12px" }} />;
      },
      sortable: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      headerName: 'Item Code',
      field: 'itemCode',
      editable: !showExcelButton,
      filter: true,
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showIcons = isWideEnough;

        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
            <div className="flex-grow-1">
              {params.editing ? (
                <input
                  type="text"
                  className="form-control"
                  value={params.value || ''}
                  onChange={(e) => params.setValue(e.target.value)}
                  style={{ width: '100%' }}
                />
              ) : (
                params.value
              )}
            </div>

            {showIcons && (
              <span
                className="icon searchIcon"
                style={{
                  position: 'absolute',
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                title='Item Help'
                onClick={() => handleClickOpen(params)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </span>
            )}

            {showIcons && (
              <span
                className="icon cameraIcon"
                style={{
                  position: "absolute",
                  right: "-10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => handleOpenScanner(params)}
                title='Barcode Scanner'
              >
                <FontAwesomeIcon icon={faCamera} />
              </span>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      headerName: 'Unit Weight',
      field: 'unitWeight',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      editable: !showExcelButton,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleWarehouseCode(params);
      },
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showSearchIcon = isWideEnough;

        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
            <div className="flex-grow-1">
              {params.editing ? (
                <input
                  type="text"
                  className="form-control"
                  value={params.value || ''}
                  onChange={(e) => params.setValue(e.target.value)}
                  style={{ width: '100%' }}
                />
              ) : (
                params.value
              )}
            </div>

            {showSearchIcon && (
              <span
                className="icon searchIcon"
                style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
                title='Warehouse Help'
                onClick={() => handleOpen(params)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </span>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      headerName: 'Qty',
      field: 'salesQty',
      editable: !showExcelButton,
      filter: true,
      valueSetter: qtyValueSetter,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Discount %',
      field: 'discount',
      editable: false,
      hide: true,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Total Weight',
      field: 'ItemTotalWeight',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Unit Price',
      field: 'purchaseAmt',
      editable: !showExcelButton,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Discount Amount',
      field: 'discountAmount',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'TotalTaxAmount',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Total',
      field: 'TotalItemAmount',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: !showExcelButton,
      filter: true,
      sortable: false,
      hide: true
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: !showExcelButton,
      filter: true,
      sortable: false,
      hide: true
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: !showExcelButton,
      filter: true,
      sortable: false,
      hide: true,
    },
    {
      headerName: 'KeyField',
      field: 'keyField',
      editable: false,
      filter: true,
      sortable: false,
      hide: true,
    },
  ];

  const columnDefsTax = [
    {
      headerName: 'S.No',
      field: 'ItemSNO',
      maxWidth: 80,
      editable: false,
    },
    {
      headerName: 'Tax S.No',
      field: 'TaxSNO',
      maxWidth: 120,
      editable: false,
    },
    {
      headerName: 'Item Code',
      field: 'Item_code',
      editable: false,
    },
    {
      headerName: 'Tax Type ',
      field: 'TaxType',
      editable: false,
    },
    {
      headerName: 'Tax %',
      field: 'TaxPercentage',
      editable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxAmount',
      editable: false,
    },
    {
      headerName: 'Keyfield',
      field: 'keyfield',
      sortable: false,
      editable: false,
      hide: true,
    }
  ];

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

    fetch(`${config.apiBaseUrl}/ordertype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setOrderdrop(data))
      .catch((error) => console.error("Error fetching Order type:", error));
  }, []);

  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionSales = salesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionOrder = orderdrop.map((option) => {
    const words = option.attributedetails_name.trim().split(/\s+/);

    const formattedName = words.map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word.toLowerCase();
      }
    }).join(' ');

    return {
      value: formattedName,
      label: formattedName,
    };
  });

  const handleChangePay = (selectedOption) => {
    setSelectedPay(selectedOption);
    setPayType(selectedOption ? selectedOption.value : '');
  };

  const handleChangeSales = (selectedOption) => {
    setSelectedSales(selectedOption);
    setSalesType(selectedOption ? selectedOption.value : '');
  };

  const handleChangeOrder = (selectedOption) => {
    setSelectedOrder(selectedOption);
    setOrderType(selectedOption ? selectedOption.value : '');
  };


  //CODE TO SAVE PURCHASE HEADER 
  const handleSaveButtonClick = async () => {
    if (!customerCode || !payType || !billDate || !salesType) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    if (rowData.length === 0 || rowDataTax.length === 0) {
      toast.warning('No Sales details or tax details found to save.');
      return;
    }
    const filteredRowData = rowData.filter(row => row.salesQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);

    const hasNullWarehouse = filteredRowData.some((row) => !row.warehouse || row.warehouse.trim() === '');
    if (hasNullWarehouse) {
      toast.warning('One or more rows have a null or empty warehouse.');
      return;
    }

    if (filteredRowData.length === 0 || rowDataTax.length === 0) {
      toast.warning('please check purchase Qty, Unit price and Total values are greaterthan Zero');
      return;
    }
    setLoading(true);

    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/addSalesOrderHdr`
          : `${config.apiBaseUrl}/addsaleshdrdata`;

      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        customer_code: customerCode,
        customer_name: customerName,
        pay_type: payType,
        sales_type: salesType,
        order_type: orderType,
        bill_date: billDate,
        sale_amt: Totalsales,
        tax_amount: TotalTax,
        bill_amt: TotalBill,
        roff_amt: round_difference,
        dely_chlno: delvychellanno,
        sales_mode: salesMode,
        paid_amount: paidAmount,
        return_amount: returnAmount,
        sales_order_no: billNo,
        created_by: sessionStorage.getItem('selectedUserCode')
      };
      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        const [{ transaction_no }] = searchData;
        setBillNo(transaction_no);

        await saveInventoryDetails(transaction_no, screenType);
        await saveInventoryTaxDetails(transaction_no, screenType);
        if (screenType === "Sales") {
          await saveTermsandCondition(transaction_no);
        }
        toast.success("Data inserted Successfully");
        setShowExcelButton(true);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.error);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };


  //CODE TO SAVE PURCHASE DETAILS
  const saveInventoryDetails = async (transaction_no, screenType) => {
    try {
      const url =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/addSalesOrderDetail`
          : `${config.apiBaseUrl}/addsalesdetData`;

      // Filter out invalid rows (empty or incomplete rows)
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.salesQty > 0
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          bill_no: transaction_no,
          item_code: row.itemCode,
          item_name: row.itemName,
          weight: row.unitWeight,
          warehouse_code: row.warehouse,
          bill_qty: row.salesQty,
          total_weight: row.ItemTotalWeight,
          item_amt: row.purchaseAmt,
          bill_rate: row.TotalItemAmount,
          customer_code: customerCode,
          customer_name: customerName,
          pay_type: payType,
          sales_type: salesType,
          bill_date: billDate,
          dely_chlno: delvychellanno,
          ItemSNo: row.serialNumber,
          tax_amt: row.TotalTaxAmount,
          discount: row.discount,
          discount_amount: row.discountAmount,
          created_by: sessionStorage.getItem('selectedUserCode')
        };
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Sales Detail Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.error);
          toast.warning(errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const saveInventoryTaxDetails = async (transaction_no, screenType) => {
    try {
      const url =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/addSalesOrderTaxDet`
          : `${config.apiBaseUrl}/addsalestaxdetail`;

      const savedRows = new Set();
      for (const row of rowData) {
        const matchingTaxRows = rowDataTax.filter(taxRow => taxRow.Item_code === row.itemCode);

        for (const taxRow of matchingTaxRows) {
          const uniqueKey = `${transaction_no}-${taxRow.ItemSNO}-${taxRow.TaxSNO}`;

          if (savedRows.has(uniqueKey)) {
            continue;
          }
          const Details = {
            company_code: sessionStorage.getItem('selectedCompanyCode'),
            bill_no: transaction_no,
            item_code: row.itemCode,
            item_name: row.itemName,
            customer_code: customerCode,
            pay_type: payType,
            bill_date: billDate,
            ItemSNo: row.serialNumber,
            TaxSNo: taxRow.TaxSNO,
            tax_type: row.taxType,
            tax_name_details: taxRow.TaxType,
            tax_amt: taxRow.TaxAmount,
            tax_per: taxRow.TaxPercentage,
            created_by: sessionStorage.getItem('selectedUserCode')
          };

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("Sales Tax Detail Data inserted successfully");
            savedRows.add(uniqueKey);
          } else {
            const errorResponse = await response.json();
            console.error(errorResponse.error);
            toast.warning(errorResponse.message);
          }
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const saveTermsandCondition = async (transaction_no) => {
    try {
      const validRows = rowDataTerms.filter(row => row.Terms_conditions.trim() !== '');
      for (const row of validRows) {
        const Details = {
          created_by: sessionStorage.getItem('selectedUserCode'),
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          bill_no: transaction_no,
          Terms_conditions: row.Terms_conditions,
        };

        try {
          const response = await fetch(`${config.apiBaseUrl}/salesTermsandCondition`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("DC Data inserted successfully");
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert data");
            console.error(errorResponse.details || errorResponse.message);
          }
        } catch (error) {
          console.error(`Error inserting row: ${row.Terms_conditions}`, error);
          toast.error('Error inserting data: ' + error.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };


  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return (`${year}-${month}-${day}`);
  };


  const handleToggleTable = (table) => {
    setActiveTable(table);
  };

  const handleItem = async (selectedData) => {
    setIsLocked(true);
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce((max, row) => Math.max(max, row.serialNumber), 0);

    selectedData.map(item => {
      const existingItemWithSameCode = updatedRowDataCopy.find(row => row.serialNumber === global && row.itemCode === globalItem);

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
        existingItemWithSameCode.unitWeight = item.unitWeight;
        existingItemWithSameCode.purchaseAmt = item.purchaseAmt;
        existingItemWithSameCode.taxType = item.taxType;
        existingItemWithSameCode.taxDetails = item.taxDetails;
        existingItemWithSameCode.taxPer = item.taxPer;
        existingItemWithSameCode.discount = item.discount;
        existingItemWithSameCode.keyField = `${existingItemWithSameCode.serialNumber}-${existingItemWithSameCode.itemCode}-${Date.now()}`;
        existingItemWithSameCode.salesQty = null;
        existingItemWithSameCode.warehouse = selectedWarehouse ? selectedWarehouse.value : '';
        existingItemWithSameCode.ItemTotalWeight = null;
        existingItemWithSameCode.TotalTaxAmount = null;
        existingItemWithSameCode.TotalItemAmount = null;
        return true;
      }
      else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
          unitWeight: item.unitWeight,
          purchaseAmt: item.purchaseAmt,
          taxType: item.taxType,
          taxDetails: item.taxDetails,
          taxPer: item.taxPer,
          discount: item.discount,
          keyField: `${highestSerialNumber}-${item.itemCode}-${Date.now()}`,
          salesQty: null,
          warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          ItemTotalWeight: null,
          TotalTaxAmount: null,
          TotalItemAmount: null
        };
        updatedRowDataCopy.push(newRow);
        return true;
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };

  const handleWarehouse = (data) => {
    console.log('Data received by handleWarehouse:', data);

    const itemDetailsSet = rowData.some(
      (row) => row.itemCode === globalItem && row.itemName
    );

    if (!itemDetailsSet) {
      toast.warning("Please fetch item details first before setting the warehouse.");
      return;
    }

    const updatedRowData = rowData.map(row => {
      if (row.serialNumber === global) {
        console.log('1st if condition met, row:', row);
        const matchedItem = data.find(item => item.id === row.id);

        if (matchedItem) {
          console.log('2nd if condition met, matchedItem:', matchedItem);
          return {
            ...row,
            warehouse: matchedItem.warehouse
          };
        } else {
          console.log('No matching item found for row.id:', row.id);
        }
      } else {
        console.log('No match for row.serialNumber:', row.serialNumber, global);
      }
      return row;
    });

    setRowData(updatedRowData);
    console.log('Updated rowData:', updatedRowData);
  };

 const handleData = async ({ header }) => {
  if (!header?.BillNo) return;

 
  setBillNo(header.BillNo);
  setCustomerCode(header.CustomerCode);
  setCustomerName(header.CustomerName);


  await handleRefNo(header.BillNo);
};



  const SalesReturnTax = async (BillNo) => {
    try {
      const apiPath = isChecked || SelectedScreen?.value === "Sales Order"
        ? "getSOTaxDetail"
        : "getSalesTaxDetail";

      const response = await fetch(`${config.apiBaseUrl}/${apiPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let TaxName = '';
        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newTaxDetail.push({
            ItemSNO: ItemSNo,
            TaxSNO: TaxSNo,
            Item_code: item_code,
            TaxType: tax_name_details,
            TaxPercentage: tax_per,
            TaxAmount: tax_amt,
            TaxName: tax_type
          });
          taxNameDetailsArray.push(tax_name_details);
          taxPer.push(tax_per);
          TaxName = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTax(newTaxDetail);

        SalesReturnDetail(BillNo, taxNameDetailsString, taxPerDetaiString, TaxName);
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const SalesReturnDetail = async (BillNo, taxNameDetailsString, taxPerDetaiString, TaxName) => {
    try {
      const apiPath = isChecked || SelectedScreen?.value === "Sales Order"
        ? "getSODetail"
        : "getSalesDetail";

      const response = await fetch(`${config.apiBaseUrl}/${apiPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();

        const newRowData = [];
        searchData.forEach(item => {
          const {
            ItemSNo,
            item_code,
            item_name,
            weight,
            warehouse_code,
            bill_qty,
            total_weight,
            item_amt,
            tax_amt,
            bill_rate,
            discount_amount,
            discount
          } = item;

          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: item_code,
            itemName: item_name,
            unitWeight: weight,
            salesQty: bill_qty,
            warehouse: warehouse_code,
            discountAmount: discount_amount,
            discount: discount,
            ItemTotalWeight: total_weight,
            purchaseAmt: item_amt,
            TotalTaxAmount: tax_amt,
            TotalItemAmount: bill_rate
          });
        });
        setRowData(newRowData);

        if (!isChecked && SelectedScreen?.value === "Sales") {
          await salesTermsandCondition(BillNo);
        }

      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const salesTermsandCondition = async (BillNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getTermsandConditionSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData)

        const newRowData = [];
        searchData.forEach(item => {
          const { Terms_Conditions } = item;
          newRowData.push({ Terms_conditions: Terms_Conditions });
        });

        setRowDataTerms(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowDataTerms([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      const [{ CustomerCode, CustomerName }] = data;
      setCustomerCode(CustomerCode);
      setCustomerName(CustomerName)
    } else {
      console.error('Data is empty or undefined');
    }
  };

  const PrintHeaderData = async () => {
    setLoading(true)
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/printSOHeader`
          : `${config.apiBaseUrl}/refNumberTosalesHeaderPrintData`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const PrintDetailData = async () => {
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/printSODetail`
          : `${config.apiBaseUrl}/refNumberTosalesDetailPrintData`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const PrintSumTax = async () => {
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/printSOTaxDetail`
          : `${config.apiBaseUrl}/refNumberTosalesSumTax`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const generateReport = async () => {
    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();
      const taxData = await PrintSumTax();

      if (headerData && detailData && taxData) {

        sessionStorage.setItem('SheaderData', JSON.stringify(headerData));
        sessionStorage.setItem('SdetailData', JSON.stringify(detailData));
        sessionStorage.setItem('StaxData', JSON.stringify(taxData));

        if (!templateName) {
          toast.error("Template name not set.");
          return;
        }

        if (printOption === "Print Preview") {
          window.open(`/${templateName}`, '_blank');
        } else if (printOption === "Print") {
          for (let i = 0; i < printCopies; i++) {
            const printWindow = window.open(
              `/${templateName}?print=true`,
              '_blank',
              'width=800,height=600'
            );

            printWindow.onload = () => {
              printWindow.focus();
              printWindow.print();
            };
          }
        }
      } else {
        console.log("Failed to fetch some data");
        toast.error("Reference Number Does Not Exist");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const handleDeleteHeader = async () => {
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/deleteSalesOrderHdr`
          : `${config.apiBaseUrl}/saledeletehdrData`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete header.";
      }
    } catch (error) {
      return "Error deleting header: " + error.message;
    }
  };

  const handleDeleteDetail = async () => {
    try {
      const screenType = SelectedScreen?.value;

      const url =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/deleteSalesOrderDetail`
          : `${config.apiBaseUrl}/saleDeleteDetailData`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete detail.";
      }
    } catch (error) {
      return "Error deleting detail: " + error.message;
    }
  };

  const handleDeleteTaxDetail = async () => {
    try {
      const screenType = SelectedScreen?.value;

      const url =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/deleteSalesOrderTaxDet`
          : `${config.apiBaseUrl}/salesDeleteTaxData`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete tax detail.";
      }
    } catch (error) {
      return "Error deleting tax detail: " + error.message;
    }
  };

  const deleteTermsandCondition = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deleteSalesTermsandCondition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        })
      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete terms and conditions.";
      }
    } catch (error) {
      return "Error deleting terms and conditions: " + error.message;
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!billNo) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data ?",
      async () => {
        setLoading(true);
        try {
          const screenType = SelectedScreen?.label || ""; // or use your stored screen variable
          const termsResult = screenType === "Sales" ? await deleteTermsandCondition() : true;
          const taxDetailResult = await handleDeleteTaxDetail();
          const detailResult = await handleDeleteDetail();
          const headerResult = await handleDeleteHeader();

          if (headerResult === true && detailResult === true && taxDetailResult === true && termsResult === true) {
            console.log("All API calls completed successfully");
            toast.success("Data Deleted Successfully", {
              autoClose: true,
              onClose: () => {
                window.location.reload();
              }
            });
          } else {
            const errorMessage =
              headerResult !== true
                ? headerResult
                : detailResult !== true
                  ? detailResult
                  : taxDetailResult !== true
                    ? taxDetailResult
                    : termsResult !== true
                      ? termsResult
                      : "An unknown error occurred.";

            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error executing API calls:", error);
          toast.warning(error.message || "An Error occured while Deleting Data");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data deleted cancelled.");
      }

    );
  };

  const formatToTwoDecimalPoints = (number) => {
    return parseFloat(number).toFixed(2);
  };

  const handleRefNo = async (code) => {
    setLoading(true);
    try {
      const apiPath = isChecked || SelectedScreen?.value === "Sales Order"
        ? "/getSalesOrder"
        : "/getSalesData";

      const response = await fetch(`${config.apiBaseUrl}${apiPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: code,
          company_code: sessionStorage.getItem('selectedCompanyCode')
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          return false;
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
          return false;
        }
      }

      const searchData = await response.json();

      if (searchData.table1 && searchData.table1.length > 0) {
        const item = searchData.table1[0];
        if (!isChecked) {
          setShowAsterisk(true);
          setButtonsVisible(false);
          setShowExcelButton(true);
          setupdated(true);
          if (!isChecked && SelectedScreen?.value !== "Sales Order") {
            setAuthorizeButton(true);
            setShowDropdown(true);
          }
        }

        setBillDate(formatDate(item.bill_date));
        setBillNo(item.bill_no);
        setCustomerCode(item.customer_code);
        setCustomerName(item.customer_name);
        setDelvychellanno(item.dely_chlno);
        setTotalBill(formatToTwoDecimalPoints(item.bill_amt));
        setRoundDifference(formatToTwoDecimalPoints(item.roff_amt));
        setTotalsales(formatToTwoDecimalPoints(item.sale_amt));
        setTotalTax(formatToTwoDecimalPoints(item.tax_amount));
        setPaidAmount(formatToTwoDecimalPoints(item.paid_amount));
        setReturnAmount(formatToTwoDecimalPoints(item.return_amount));

        const selectedOption = filteredOptionSales.find(option => option.value === item.sales_type);
        setSelectedSales(selectedOption);
        setSalesType(selectedOption?.value);

        const selected = filteredOptionPay.find(option => option.value === item.pay_type);
        setSelectedPay(selected);
        setPayType(selected?.value);

        const selectedOrder = filteredOptionOrder.find(option => option.value === item.order_type);
        setSelectedOrder(selectedOrder);
        setOrderType(selectedOrder?.value);

        const selectedSalesMode = filteredOptionSalesMode.find(option => option.value === item.sales_mode);
        setSelectedSalesMode(selectedSalesMode);
        setSalesMode(selectedSalesMode?.value);
      } else {
        console.log("Header Data is empty or not found");
        clearFormFields();
        return false;
      }

      if (searchData.table2 && searchData.table2.length > 0) {
        const updatedRowData = searchData.table2.map(item => {
          const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);
          const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
          const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
          const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

          setCustomerName(item.customer_name);

          return {
            serialNumber: item.ItemSNo,
            itemCode: item.item_code,
            itemName: item.item_name,
            unitWeight: item.weight,
            warehouse: item.warehouse_code,
            salesQty: item.bill_qty,
            ItemTotalWeight: item.total_weight,
            itemAmt: item.item_amt,
            totalReturnAmt: item.bill_rate,
            ReturnWeight: item.return_weight,
            purchaseAmt: item.item_amt,
            delvychellanno: item.dely_chlno,
            discount: item.discount,
            discountAmount: item.discount_amount,
            TotalTaxAmount: parseFloat(item.tax_amt).toFixed(2),
            TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
            taxType: taxType || null,
            taxPer: taxPer || null,
            taxDetails: taxDetails || null
          };
        });

        setRowData(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
      }

      if (searchData.table3 && searchData.table3.length > 0) {
        const updatedRowDataTax = searchData.table3.map(item => ({
          ItemSNO: item.ItemSNo,
          TaxSNO: item.TaxSNo,
          Item_code: item.item_code,
          TaxType: item.tax_name_details,
          TaxPercentage: item.tax_per,
          TaxAmount: item.tax_amt,
          TaxName: item.tax_type
        }));

        setRowDataTax(updatedRowDataTax);
      } else {
        console.log("Tax Data is empty or not found");
        setRowDataTax([]);
      }

      if (searchData.table4 && searchData.table4.length > 0) {
        const updatedRowDataTerms = searchData.table4.map(item => ({
          Terms_conditions: item.Terms_Conditions
        }));
        setRowDataTerms(updatedRowDataTerms);
      } else {
        console.log("Terms Data is empty or not found");
        setRowDataTerms([]);
      }

      console.log("data fetched successfully");
      return true;
    } catch (error) {
      console.error("Error fetching search data:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearFormFields = () => {
    setTotalsales('');
    setDelvychellanno('');
    setPayType('');
    setSalesType('');
    setBillDate('');
    setBillNo('');
    setCustomerCode('');
    setCustomerName('');
    setTotalTax('');
    setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
    setRowDataTax([]);
    setRowDataTerms([]);
  };

  //code sales delete screen
  const handleDeletedData = async (data) => {
    if (data && data.length > 0) {
      const [{ BillNo, BillDate, PaidAmount, ReturnAmount, SalesMode, SalesType, RoundOff, SaleAmount, TotalAmount, TotalTax, PayType, CustomerName, CustomerCode, OrderType }] = data;
      console.table(data);

      const billDate = document.getElementById('billDate');
      if (billDate) {
        billDate.value = BillDate;
        setDeleteBillDate(formatDate(BillDate));
      } else {
        console.error('Billdate element not found');
      }

      const billNo = document.getElementById('saleReferNo');
      if (billNo) {
        billNo.value = BillNo;
        setRefNo(BillNo);
      } else {
        console.error('Billdate element not found');
      }

      const deletedSalesMode = document.getElementById('deletedSalesMode');
      if (deletedSalesMode) {
        deletedSalesMode.value = SalesMode;
        setDeletedSalesMode(SalesMode);
      } else {
        console.error('deletedSalesMode element not found');
      }

      const deletedPaidAmount = document.getElementById('deletedPaidAmount');
      if (deletedPaidAmount) {
        deletedPaidAmount.value = PaidAmount;
        setDeletedPaidAmount(PaidAmount);
      } else {
        console.error('deletedPaidAmount element not found');
      }

      const deletedReturnAmount = document.getElementById('deletedReturnAmount');
      if (deletedReturnAmount) {
        deletedReturnAmount.value = ReturnAmount;
        setDeletedReturnAmount(ReturnAmount);
      } else {
        console.error('deletedReturnAmount element not found');
      }

      const ordertype = document.getElementById('ordertype');
      if (ordertype) {
        ordertype.value = OrderType;
        setDeleteOrderType(OrderType);
      } else {
        console.error('transactionNumber element not found');
      }

      const salesType = document.getElementById('salesType');
      if (salesType) {
        salesType.value = SalesType;
        setDeleteSalesType(SalesType);
      } else {
        console.error('transactionNumber element not found');
      }

      const payType = document.getElementById('payType');
      if (payType) {
        payType.value = PayType;
        setDeletePayType(PayType);
      } else {
        console.error('transactionNumber element not found');
      }

      const customerCode = document.getElementById('customercode');
      if (customerCode) {
        customerCode.value = CustomerCode;
        setDeleteCustomerCode(CustomerCode);
      } else {
        console.error('vendor element not found');
      }

      const customerName = document.getElementById('customername');
      if (customerName) {
        customerName.value = CustomerName;
        setDeleteCustomerName(CustomerName);
      } else {
        console.error('vendor element not found');
      }

      const roundOff = document.getElementById('roundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setDeleteRoundDifference(RoundOff);
      } else {
        console.error('vendor element not found');
      }

      // const dcNo = document.getElementById('dcno');
      // if (dcNo) {
      //   dcNo.value = DCNo;
      //   setDeleteDelvychellanno(DCNo);
      // } else {
      //   console.error('vendor element not found');
      // }

      const saleAmount = document.getElementById('totalSaleAmount');
      if (saleAmount) {
        saleAmount.value = SaleAmount;
        setDeleteTotalsales(SaleAmount);
      } else {
        console.error('vendor element not found');
      }

      const totalAmount = document.getElementById('totalBillAmount');
      if (totalAmount) {
        totalAmount.value = TotalAmount;
        setDeleteTotalBill(TotalAmount);
      } else {
        console.error('vendor element not found');
      }

      const totalTax = document.getElementById('totalTaxAmount');
      if (totalTax) {
        totalTax.value = TotalTax;
        setDeleteTotalTax(TotalTax);
      } else {
        console.error('vendor element not found');
      }

      await SalesDeleteTax(BillNo);
    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  }

  const SalesDeleteTax = async (BillNo) => {
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/getDeletedSOTaxDetail`
          : `${config.apiBaseUrl}/salesdelsearchtax`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let TaxName = '';
        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newTaxDetail.push({
            deleteItemSNO: ItemSNo,
            deleteTaxSNO: TaxSNo,
            deleteItem_code: item_code,
            deleteTaxType: tax_name_details,
            deleteTaxPercentage: tax_per,
            deleteTaxAmount: tax_amt,
            TaxName: tax_type
          });
          taxNameDetailsArray.push(tax_name_details);
          taxPer.push(tax_per);
          TaxName = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTaxDelete(newTaxDetail);

        SalesDeleteDetail(BillNo, taxNameDetailsString, taxPerDetaiString, TaxName);
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const SalesDeleteDetail = async (BillNo) => {
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/getDeletedSODetail`
          : `${config.apiBaseUrl}/saledelsearchitem`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        searchData.forEach(item => {
          const {
            ItemSNo,
            item_code,
            item_name,
            weight,
            warehouse_code,
            bill_qty,
            total_weight,
            item_amt,
            tax_amt,
            bill_rate,
            discount_amount,
            discount
          } = item;

          newRowData.push({
            deleteSerialNumber: ItemSNo,
            deleteItemCode: item_code,
            deleteItemName: item_name,
            deleteUnitWeight: weight,
            deleteSalesQty: bill_qty,
            deleteWarehouse: warehouse_code,
            deleteItemTotalWeight: total_weight,
            deletePurchaseAmt: item_amt,
            deleteTotalTaxAmount: tax_amt,
            deleteTotalItemAmount: bill_rate,
            deletedDiscountAmount: discount_amount,
            deletedDiscount: discount,
          });
        });
        setRowDataDelete(newRowData);

        if (screenType === "Sales") {
          await saledDeletedTerms(BillNo);
        }

      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const saledDeletedTerms = async (BillNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedTermsSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData)

        const newRowData = [];
        searchData.forEach(item => {
          const { Terms_Conditions } = item;
          newRowData.push({ deletedTermsConditions: Terms_Conditions });
        });

        setDeletedRowDataTerms(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowDataTerms([]);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message || "Internal Server Error");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleDeletedRerNo = (e) => {
    const deleteNumber = e.target.value;
    setRefNo(deleteNumber);
  }

  const handleKeyDelete = (e) => {
    if (e.key === 'Enter') {
      handleDeleteRefNo(refNo);
    }
  };

  const handleDeleteRefNo = async (code) => {
    setLoading(true);
    try {
      const screenType = SelectedScreen?.value;

      const headerUrl =
        screenType === "Sales Order"
          ? `${config.apiBaseUrl}/getDeletedSalesOrder`
          : `${config.apiBaseUrl}/getRefSalesDelete`;

      const response = await fetch(headerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem('selectedCompanyCode') }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        if (searchData.table1 && searchData.table1.length > 0) {
          const item = searchData.table1[0];
          setRefNo(item.bill_no);
          setDeleteBillDate(formatDate(item.bill_date));
          setDeleteCustomerCode(item.customer_code);
          setDeleteCustomerName(item.customer_name);
          setDeleteDelvychellanno(item.dely_chlno);
          setDeleteOrderType(item.order_type);
          setDeletePayType(item.pay_type);
          setDeleteSalesType(item.sales_type);
          setDeletedSalesMode(item.sales_mode);
          setDeleteTotalBill(formatToTwoDecimalPoints(item.bill_amt));
          setDeleteRoundDifference(formatToTwoDecimalPoints(item.roff_amt));
          setDeleteTotalsales(formatToTwoDecimalPoints(item.sale_amt));
          setDeleteTotalTax(formatToTwoDecimalPoints(item.tax_amount));
          setDeletedPaidAmount(formatToTwoDecimalPoints(item.paid_amount));
          setDeletedReturnAmount(formatToTwoDecimalPoints(item.return_amount));

        } else {
          console.log("Header Data is empty or not found");
          setRefNo('')
          setDeleteTotalsales('');
          setDeleteDelvychellanno('');
          setDeletePayType('');
          setDeleteSalesType('');
          setDeleteBillDate('');
          setRefNo('');
          setDeleteCustomerCode('');
          setDeleteCustomerName('');
          setDeleteTotalTax('');
        }

        if (searchData.table2 && searchData.table2.length > 0) {

          const updatedRowData = searchData.table2.map(item => {
            const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);
            const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
            const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
            const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;
            document.getElementById('customercode').textContent = item.customer_name;

            return {
              deleteSerialNumber: item.ItemSNo,
              deleteItemCode: item.item_code,
              deleteItemName: item.item_name,
              deleteUnitWeight: item.weight,
              deleteWarehouse: item.warehouse_code,
              deleteSalesQty: item.bill_qty,
              deleteItemTotalWeight: item.total_weight,
              deletePurchaseAmt: item.item_amt,
              deletedDiscount: item.discount,
              deletedDiscountAmount: item.discount_amount,
              deleteTotalTaxAmount: parseFloat(item.tax_amt).toFixed(2),
              deleteTotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
              taxType: taxType || null,
              taxPer: taxPer || null,
              taxDetails: taxDetails || null
            };
          });

          setRowDataDelete(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
        }

        if (searchData.table3 && searchData.table3.length > 0) {

          const updatedRowDataTax = searchData.table3.map(item => {
            return {
              deleteItemSNO: item.ItemSNo,
              deleteTaxSNO: item.TaxSNo,
              deleteItem_code: item.item_code,
              deleteTaxType: item.tax_name_details,
              deleteTaxPercentage: item.tax_per,
              deleteTaxAmount: item.tax_amt,
              TaxName: item.tax_type
            };
          });

          console.log(updatedRowDataTax);
          setRowDataTaxDelete(updatedRowDataTax);
        } else {
          console.log("Tax Data is empty or not found");
          setRowDataTax([]);
        }

        if (searchData.table4 && searchData.table4.length > 0) {
          const updatedRowDataTerms = searchData.table4.map(item => {
            return {
              deletedTermsConditions: item.Terms_Conditions,
            };
          });
          setDeletedRowDataTerms(updatedRowDataTerms);
        }
        else {
          console.log("Detail Data is empty or not found");
          setDeletedRowDataTerms([])
        }

        console.log("data fetched successfully")

      } else if (response.status === 404) {
        toast.warning('Data not found');

        setRefNo('')
        setTotalsales('');
        setDelvychellanno('');
        setPayType('');
        setSalesType('');
        setBillDate('');
        setBillNo('');
        setCustomerCode('');
        setCustomerName('');
        setTotalTax('');
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
        setRowDataTax([]);
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  //sales deleted code
  const [rowDataDelete, setRowDataDelete] = useState([{ deleteSerialNumber: 1, deleteItemCode: '', deleteItemName: '', deleteUnitWeight: '', deleteWarehouse: '', deleteSalesQty: '', deleteItemTotalWeight: '', deletePurchaseAmt: 0, deleteTotalTaxAmount: '', deleteTotalItemAmount: '' }]);
  const [rowDataTaxDelete, setRowDataTaxDelete] = useState([]);
  const [deleteCustomerCode, setDeleteCustomerCode] = useState("");
  const [deleteCustomerName, setDeleteCustomerName] = useState("");
  const [deletePayType, setDeletePayType] = useState("");
  const [deleteSalesType, setDeleteSalesType] = useState("");
  const [deleteOrderType, setDeleteOrderType] = useState(null);
  const [deleteDelvychellanno, setDeleteDelvychellanno] = useState("");
  const [deletedSalesMode, setDeletedSalesMode] = useState("");
  const [deletedPaidAmount, setDeletedPaidAmount] = useState("");
  const [deletedReturnAmount, setDeletedReturnAmount] = useState("");
  const [deleteBillDate, setDeleteBillDate] = useState("");
  const [deleteTotalBill, setDeleteTotalBill] = useState(0);
  const [deleteTotalTax, setDeleteTotalTax] = useState(0)
  const [deleteTotalsales, setDeleteTotalsales] = useState(0)
  const [deleteRoundedDifference, setDeleteRoundDifference] = useState(0)

  const columnDeletdDef = [
    {
      headerName: 'S.No',
      field: 'deleteSerialNumber',
      maxWidth: 80,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'deleteItemCode',
      editable: true,
      filter: true,
      editable: false,
      onCellValueChanged: function (params) {
      }
    },
    {
      headerName: 'Item Name',
      field: 'deleteItemName',
      editable: true,
      filter: true,
      editable: false,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false
    },
    {
      headerName: 'Unit Weight',
      field: 'deleteUnitWeight',
      editable: true,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Warehouse',
      field: 'deleteWarehouse',
      editable: true,
      filter: true,
      editable: false,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false
    },
    {
      headerName: 'Qty',
      field: 'deleteSalesQty',
      editable: true,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Total Weight',
      field: 'deleteItemTotalWeight',
      editable: true,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Unit Price',
      field: 'deletePurchaseAmt',
      editable: true,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Tax Amount',
      field: 'deleteTotalTaxAmount',
      editable: true,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Discount %',
      field: 'deletedDiscount',
      editable: false,
      hide: true,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Discount Amount',
      field: 'deletedDiscountAmount',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Total',
      field: 'deleteTotalItemAmount',
      editable: true,
      filter: true,
      editable: false,
      maxWidth: 155,
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: true,
      filter: true,
      editable: false,
      hide: true
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: true,
      filter: true,
      editable: false,
      hide: true
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: true,
      filter: true,
      editable: false,
      hide: true,
    },
  ];

  const columnDelDefsTax = [
    {
      headerName: 'S.No',
      field: 'deleteItemSNO',
      editable: false,
      maxWidth: 80,
    },
    {
      headerName: 'Tax S.No',
      field: 'deleteTaxSNO',
      maxWidth: 120,
      editable: false,
    },
    {
      headerName: 'Item Code',
      field: 'deleteItem_code',
      editable: false,
    },
    {
      headerName: 'Tax Type ',
      field: 'deleteTaxType',
      editable: false,
    },
    {
      headerName: 'Tax percentage',
      field: 'deleteTaxPercentage',
      editable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'deleteTaxAmount',
      editable: false,
    }
  ];

  const handleReload = () => {
    window.location.reload();
  };

  const handleExcelDownload = () => {
    const filteredRowData = rowData.filter(row => row.salesQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);
    const filteredRowDataTax = rowDataTax.filter(taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0);

    const headerData = [{
      "Company Code": sessionStorage.getItem('selectedCompanyCode'),
      "Customer Code": customerCode,
      "Customer Name": customerName,
      "Pay Type": payType,
      "Sales Type": salesType,
      "Order Type": orderType,
      "Bill No": billNo,
      "Bill Date": billDate,
      "Total Sales Amount": Totalsales,
      "Tax Amount": TotalTax,
      "Total Bill Amount": TotalBill,
      "Round Off": round_difference,
    }];

    // Map rowData using columnDefs headerName
    const formattedRowData = filteredRowData.map(row => {
      const newRow = {};
      columnDefs.forEach(col => {
        if (!col.hide && col.field !== 'delete' && col.headerName) {
          newRow[col.headerName] = row[col.field];
        }
      });
      return newRow;
    });

    // Map rowDataTax using columnDefsTax headerName
    const formattedRowDataTax = filteredRowDataTax.map(row => {
      const newRow = {};
      columnDefsTax.forEach(col => {
        if (!col.hide) {
          newRow[col.headerName] = row[col.field];
        }
      });
      return newRow;
    });

    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    const rowDataSheet = XLSX.utils.json_to_sheet(formattedRowData);
    const rowDataTaxSheet = XLSX.utils.json_to_sheet(formattedRowDataTax);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Item Details");
    XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Tax Details");

    XLSX.writeFile(workbook, "Sales_data.xlsx");
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: '', itemName: '', unitWeight: 0, warehouse: selectedWarehouse ? selectedWarehouse.value : '', salesQty: 0, ItemTotalWeight: 0, purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', salesQty: '', ItemTotalWeight: '', purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    console.log("Selected option:", selected);
  };

  const handleAuthorizedButtonClick = async () => {
    if (!selectedStatus) {
      setAuthError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true);

    try {
      const headerResult = await AuthorizedHeader();
      const detailResult = await AuthorizedDetails();
      const taxDetailResult = await AuthorizedTaxDetails();
      if (headerResult === true && detailResult === true && taxDetailResult === true) {
        console.log("All API calls completed successfully");
        toast.success(`Bill ${selectedStatus.label} Successfully`, {
          autoClose: true,
          onClose: () => {
            window.location.reload();
          }
        });
      } else {
        const errorMessage =
          headerResult !== true
            ? headerResult
            : detailResult !== true
              ? detailResult
              : taxDetailResult !== true
                ? taxDetailResult
                : "An unknown error occurred.";

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      toast.warning(error.message || "An Error occured while Deleting Data");
    } finally {
      setLoading(false);
    }
  };


  const AuthorizedHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/SalesAuthHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", billNo);
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to header.";
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const AuthorizedDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/SalesAuthDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to detail.";
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const AuthorizedTaxDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/SalesAuthTaxDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to tax detail.";
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const navigateToSalesSettings = () => {
    navigate('/SalesSettings'); // Adjust the path as per your route setup
  };

  const ReturnAmountCalculation = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesReturnAmountCalculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sale_amt: TotalBill, paid_amt: parseFloat(paidAmount) }),
      });
      if (response.ok) {
        const data = await response.json();
        const [{ ReturnAmount }] = data;
        setReturnAmount(formatToTwoDecimalPoints(ReturnAmount))
      } else {
        const errorMessage = await response.text();
        console.error(`Server responded with error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!updated && paidAmount) {
      ReturnAmountCalculation();
    }
  }, [TotalBill, paidAmount, updated]);

  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen(true);
    console.log('Opening popup...');
  };

  const handleOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen1(true);
    console.log('Opening popup...');
  };

  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);
    setOpen4(false);
  };

  // const handleShowModal = () => setShowModal(true);
  // const handleCloseModal = () => setShowModal(false);
  // const handleShowModal2 = () => setShowModal2(true);
  // const handleCloseModal2 = () => setShowModal2(false);

  const handleChangeNo = (e) => {
    const refNo = e.target.value;
    setBillNo(refNo);
  }

  const handleShowModall = () => {
    setOpen3(true);
  };

  const handleShowModal = () => {
    setOpen2(true);
  };

  const handleSalesData = () => {
    setOpen4(true);
  };
  const [opens, setOpens] = useState(false);
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpens(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const company_code = sessionStorage.getItem('selectedCompanyCode');
      try {
        const response = await fetch(`${config.apiBaseUrl}/termsandCondition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code })
        })
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        const updatedData = await Promise.all(
          result.map(async (item) => ({
            ...item,
            Terms_conditions: item.attributedetails_name
          }))
        );
        setRowDataTerms(updatedData);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, []);

  const DeleteTerms = (params) => {
    const { data } = params;
    setRowDataTerms((prevRows) => {
      const updatedRows = prevRows.filter((row) => row !== data);
      if (updatedRows.length === 0) {
        return [
          {
            serialNumber: 1,
            Terms_conditions: "",
          },
        ];
      }
      return updatedRows.map((row, index) => ({
        ...row,
        serialNumber: index + 1,
      }));
    });
  };

  const handleValueChanged = (params) => {
    const { data, colDef } = params;
    if (colDef.field === "Terms_conditions" && data.Terms_conditions?.trim() !== "") {
      const isLastRow = rowDataTerms[rowDataTerms.length - 1] === data;
      if (isLastRow) {
        const newRow = {
          serialNumber: rowDataTerms.length + 1,
          Terms_conditions: "",
        };
        setRowDataTerms((prevRows) => [...prevRows, newRow]);
      }
    }
  };

  const columnDefsTermsConditions = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 70,
      valueGetter: (params) => params.node.rowIndex + 1,
      sortable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 25,
      tooltipValueGetter: () => "Delete",
      onCellClicked: DeleteTerms,
      cellRenderer: function () {
        return <FontAwesomeIcon title='Delete' icon={faTrash} style={{ cursor: 'pointer', marginRight: "12px" }} />;
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false,
    },
    {
      headerName: 'Terms & Conditions',
      field: 'Terms_conditions',
      sortable: false,
      editable: !showExcelButton,
      flex: 1,
      onCellValueChanged: (params) => handleValueChanged(params),
    },
  ];

  const [deletedRowDataTerms, setDeletedRowDataTerms] = useState([]);

  const deletedTermsConditions = [
    {
      headerName: 'S.No',
      field: 'deletedSerialNumber',
      maxWidth: 70,
      valueGetter: (params) => params.node.rowIndex + 1,
      sortable: false,
      minHeight: 50,
      maxHeight: 50,
    },
    {
      headerName: 'Terms & Conditions',
      field: 'deletedTermsConditions',
      sortable: false,
      editable: false,
      flex: 1
    },
  ];

  useEffect(() => {
    const fetchItemCode = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getSalesItemCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setItemCodeDrop(data);
        } else {
          console.warn("No data found for item codes");
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

  const handleChangeItem = async (selectedOption) => {
    setSelectedItem(selectedOption);

    const selectedItemCode = selectedOption?.value;
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    if (!selectedItemCode) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/getItemCodeSalesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_code: selectedItemCode, type: salesMode })
      });

      if (response.ok) {
        const searchData = await response.json();
        const matchedItem = searchData[0];
        if (!matchedItem) {
          toast.warning("No item data found.");
          return;
        }

        // Find first row with empty itemCode
        const emptyRowIndex = rowData.findIndex(row => !row.itemCode);

        if (emptyRowIndex !== -1) {
          // Update the first empty row
          const updatedRowData = [...rowData];
          updatedRowData[emptyRowIndex] = {
            ...updatedRowData[emptyRowIndex],
            itemCode: matchedItem.Item_code,
            itemName: matchedItem.Item_name,
            unitWeight: matchedItem.Item_wigh,
            discount: matchedItem.discount_Percentage,
            purchaseAmt: matchedItem.Item_std_sales_price,
            taxType: matchedItem.Item_sales_tax_type,
            taxDetails: matchedItem.combined_tax_details,
            taxPer: matchedItem.combined_tax_percent,
            keyField: `${updatedRowData[emptyRowIndex].serialNumber || ''}-${matchedItem.Item_code || ''}`,
            warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          };
          setRowData(updatedRowData);
        } else {
          // No empty row found, add a new row
          const newRow = {
            serialNumber: rowData.length + 1,
            itemCode: matchedItem.Item_code,
            itemName: matchedItem.Item_name,
            unitWeight: matchedItem.Item_wigh,
            discount: matchedItem.discount_Percentage,
            purchaseAmt: matchedItem.Item_std_sales_price,
            taxType: matchedItem.Item_sales_tax_type,
            taxDetails: matchedItem.combined_tax_details,
            taxPer: matchedItem.combined_tax_percent,
            keyField: `${rowData.length + 1}-${matchedItem.Item_code || ''}`,
            warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          };
          setRowData(prev => [...prev, newRow]);
        }

      } else {
        toast.warning("Item not found.");
      }
    } catch (error) {
      console.error("Error fetching item data from dropdown:", error);
      toast.error("Error: " + error.message);
    }
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };



  return (
    <div className="container-fluid ">
      {Screens === 'Add' ? (
        <div>
          {loading && <LoadingScreen />}
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className="card shadow-lg border-0 p-3 rounded-5" style={{ height: "auto" }}>
            <div className="d-flex justify-content-between">
              <div className="desktopbuttons">
                <div className='d-flex justify-content-start '> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{Screen === "Sales Order" ? 'Sales Order' : 'Sales'}</h4> </div>
              </div>
              <div className='col-md-5 d-flex justify-content-end row'>
                <div className='desktopbuttons'>
                  <div className='row d-flex justify-content-end'>
                    <div className="col-md-4 " title='Please select the screen'>
                      <Select
                        id="returnType"
                        className=" mt-1"
                        placeholder=""
                        required
                        value={SelectedScreen}
                        onChange={handleChangeScreen}
                        options={filteredOptionScreen}
                      />
                    </div>
                    <div className="col-md-4 " title='Please select the screen type'>
                      <Select
                        id="returnType"
                        className=" mt-1"
                        placeholder=""
                        required
                        value={selectedscreens}
                        onChange={handleChangeScreens}
                        options={filteredOptionScreens}
                      />
                    </div>
                    {buttonsVisible && ['add', 'all permission'].some(permission => sales.includes(permission)) && (
                      <div className='col-md-1 mt-1 mb-5' ><a className='border-none text-success p-1' style={{ cursor: "pointer" }} onClick={handleSaveButtonClick} title='Save'><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                        <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                      </svg>
                      </a>
                      </div>
                    )}
                    {authorizeButton && (
                      <div className='col-md-1 mt-1 mb-5' ><a className='border-none text-success p-1' style={{ cursor: "pointer" }} onClick={handleAuthorizedButtonClick} title="Authorization">
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5l-3.5-3.5a.5.5 0 0 1 .708-.708L6.707 10.293l6.439-6.439a.5.5 0 0 1 .708 0z" />
                        </svg>
                      </a>
                      </div>
                    )}
                    {['delete', 'all permission'].some(permission => sales.includes(permission)) && (
                      <div className='col-md-1 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' style={{ cursor: "pointer" }} onClick={handleDeleteButtonClick} title='Delete'><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                      </svg>
                      </a>
                      </div>
                    )}
                    {showExcelButton && ['all permission', 'view'].some(permission => sales.includes(permission)) && (
                      <div className='col-md-1 mt-1 mb-5' ><a className='border-none text-dark p-1' style={{ cursor: "pointer" }} title="Print" onClick={generateReport}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                        </svg>
                      </a>
                      </div>
                    )}
                    {showExcelButton && (
                      <div className='col-md-1 mt-1 mb-5' ><a className='border-none text-success p-1' style={{ cursor: "pointer" }} onClick={handleExcelDownload} title='Excel'><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-excel-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64" />
                      </svg>
                      </a>
                      </div>
                    )}
                    <div className='col-md-1 mt-1 mb-5 ' ><a className='border-none text-dark p-1 ' style={{ cursor: "pointer" }} title='Reload' onClick={handleReload}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                      </svg>
                    </a>
                    </div>
                    <div className='col-md-1 mt-1 mb-5 ' ><a className='border-none text-dark p-1' title='Setting' onClick={navigateToSalesSettings} style={{ cursor: "pointer" }}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-settings">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 
           1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 
           1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 
           1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 
           1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 
           1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 
           2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 
           1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 
           1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 
           1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 
           1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 
           0-1.51 1z"/>
                      </svg>
                    </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mobile_buttons">
              <div className='d-flex justify-content-between mb-3'>
                <div className='d-flex justify-content-start '>
                  <h4 className=" fw-semibold text-dark fs-2 fw-bold">{Screen === "Sales Order" ? 'Sales Order' : 'Sales'}</h4>
                </div>
                <div className='  d-flex justify-content-center'>
                  <div className=''>
                    <div className="mb-1">
                      <Select
                        id="returnType"
                        className=" "
                        placeholder=""
                        required
                        value={SelectedScreen}
                        onChange={handleChangeScreen}
                        options={filteredOptionScreen}
                      />
                    </div>
                  </div>
                  <div className=''>
                    <div className="mb-1 ">
                      <Select
                        id="returnType"
                        className=" "
                        placeholder=""
                        required
                        value={selectedscreens}
                        onChange={handleChangeScreens}
                        options={filteredOptionScreens}
                      />
                    </div>
                  </div>
                  <div className="col-auto position-relative d-flex justify-content-end ms-1 p-1" ref={dropdownRef}>
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
                        {buttonsVisible && ['add', 'all permission'].some(permission => sales.includes(permission)) && (
                          <div title='save' className='col-md-1 mt-1 mb-3' ><a className='border-none text-success p-1' onClick={handleSaveButtonClick} title='Save' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                            <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                          </svg>
                          </a>
                          </div>
                        )}
                        {authorizeButton && (
                          <div className='col-md-1 mt-1 me-0 mb-3' ><a className='border-none text-success p-1' style={{ cursor: "pointer" }} onClick={handleAuthorizedButtonClick} title="Authorization">
                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                              <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5l-3.5-3.5a.5.5 0 0 1 .708-.708L6.707 10.293l6.439-6.439a.5.5 0 0 1 .708 0z" />
                            </svg>
                          </a>
                          </div>
                        )}
                        {['delete', 'all permission'].some(permission => sales.includes(permission)) && (
                          <div title='delete' className='col-md-1 mt-1 me-0 mb-3' ><a className='border-none text-danger p-1' onClick={handleDeleteButtonClick} title='delete' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                          </svg>
                          </a>
                          </div>
                        )}
                        {showExcelButton && ['view', 'all permission'].some(permission => sales.includes(permission)) && (
                          <div className='col-md-1 mt-1 mb-3' ><a className='border-none text-dark p-1'
                            title="print" onClick={generateReport} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                              <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                            </svg>
                          </a>
                          </div>
                        )}
                        <div className='col-md-1 mt-1 mb-3' ><a className='border-none text-dark p-1' title='Reload' onClick={handleReload} style={{ cursor: "pointer" }}>
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
            <div className="row">
              {showDropdown && (
                <div className='col-md-3 mb-2'>
                  <label className={`fw-bold ${authError && !selectedStatus ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
                  <div title="Please select the status">
                    <Select
                      id="returnType"
                      className=""
                      placeholder="Select an option"
                      options={status}
                      value={selectedStatus}
                      title="Please select the status"
                      onChange={handleChangeStatus}
                      getOptionLabel={(option) => option.label || ""}
                      getOptionValue={(option) => option.value || ""}
                    />
                  </div>
                </div>
              )}
              <div className="col-md-3 mb-2">
                <label className={`fw-bold ${deleteError && !billNo ? 'text-danger' : ''}`}>Bill No{showAsterisk && <span className="text-danger">*</span>}</label>
                <div className="d-flex align-items-center">
                  <div className="position-relative flex-grow-1 me-2">
                    <input
                      type="text"
                      id="billNo"
                      className="form-control pe-5"
                      placeholder=""
                      title="Please enter the bill no"
                      autoComplete="off"
                      value={billNo}
                      onChange={handleChangeNo}
                      onKeyPress={handleKeyPressRef}
                    />
                    <a
                      className=" position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                      style={{ zIndex: 2, cursor: 'pointer' }}
                      onClick={handleShowModall}
                      title='Sales Help'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                      </svg>
                    </a>
                  </div>
                  {SelectedScreen?.label === "Sales" && (
                    <div className="form-check ms-1 mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="checkboxId"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-3 mb-2">
                <label className={`fw-bold ${error && !customerCode ? 'text-danger' : ''}`}>Customer Code{!showAsterisk && <span className="text-danger">*</span>}</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control pe-5"
                    id='customercode'
                    title="Please enter the customer code"
                    value={customerCode}
                    maxLength={18}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                  />
                  <a
                    className=" position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                    style={{ zIndex: 2, cursor: 'pointer' }}
                    onClick={handleShowModal}
                    title='Customer Help'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Customer Name</label>
                <input
                  type="text"
                  className='form-control'
                  id="customername"
                  title="Customer Name"
                  value={customerName}
                  readOnly
                />
              </div>
              <div className='col-md-3 mb-2'>
                <label className={`fw-bold ${error && !payType ? 'text-danger' : ''}`}>Pay Type{!showAsterisk && <span className="text-danger">*</span>}</label>
                <div title="Please select the pay type">
                  <Select
                    id="payType"
                    value={selectedPay}
                    onChange={handleChangePay}
                    options={filteredOptionPay}
                    className=""
                    placeholder=""
                    title="Please select the pay type"
                    data-tip="Please select a payment type"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className='col-md-3 mb-2'>
                <label className={`fw-bold ${error && !salesType ? 'text-danger' : ''}`}>Sales Type{!showAsterisk && <span className="text-danger">*</span>}</label>
                <div title="Please select the sales type">
                  <Select
                    id="salesType"
                    value={selectedSales}
                    onChange={handleChangeSales}
                    options={filteredOptionSales}
                    className=""
                    placeholder=""
                    title="Please select the sales type"
                    data-tip="Please select a payment type"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Order Type </label>
                <div title="Please select the order type">
                  <Select
                    id="ordertype"
                    value={selectedOrder}
                    onChange={handleChangeOrder}
                    options={filteredOptionOrder}
                    className=""
                    placeholder=""
                    title="Please select the order type"
                    data-tip="Please select a payment type"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className='col-md-3 mb-2'>
                <label className={`fw-bold ${error && !billDate ? 'text-danger' : ''}`}>Bill Date{!showAsterisk && <span className="text-danger">*</span>}</label>
                <input
                  type="Date"
                  className='form-control'
                  name="transactionDate"
                  id="billDate"
                  placeholder=""
                  title="Please enter the bill date"
                  min={financialYearStart}
                  max={financialYearEnd}
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  autoComplete="off"
                />
              </div>
              {/* <div className='col-md-3 mb-2'>
              <label className='fw-bold'>DC No</label>
              <input
                type="text"
                className='form-control'
                name="transactionNumber"
                id="dcno"
                placeholder=""
                required
                value={delvychellanno}
                maxLength={18}
                onChange={(e) => setDelvychellanno(e.target.value)}
                autoComplete="off"
              />
            </div> */}
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Default Warehouse </label>
                <div title="Please select the default warehouse">
                  <Select
                    id="returnType"
                    className="exp-input-field"
                    placeholder=""
                    title="Please select the default warehouse"
                    value={selectedWarehouse}
                    onChange={handleChangeWarehouse}
                    options={filteredOptionWarehouse}
                    data-tip="Please select a default warehouse"
                  />
                </div>
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Sales Mode</label>
                <div title="Please select the sales mode">
                  <Select
                    id="salesMode"
                    className="exp-input-field"
                    placeholder=""
                    required
                    title="Please select the sales mode"
                    value={selectedSalesMode}
                    onChange={handleChangeSalesMode}
                    options={filteredOptionSalesMode}
                    isDisabled={isLocked}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-lg border-0 p-5 rounded-5 mt-3" style={{ height: "auto" }}>
            <div className="row">
              <div className="col-md">
                <div className="row">
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Paid Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      name=""
                      id="paidAmount"
                      placeholder=""
                      title="Please enter the paid amount"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Return Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="returnAmount"
                      placeholder=""
                      required
                      readOnly
                      title="Return Amount"
                      value={returnAmount}
                      onChange={(e) => setReturnAmount(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Total Sales Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="totalSaleAmount"
                      placeholder=""
                      title="Total Sales Amount"
                      value={Totalsales}
                      onChange={(e) => setTotalsales(e.target.value)}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Tax Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="totalTaxAmount"
                      placeholder=""
                      title="Tax Amount"
                      value={TotalTax}
                      onChange={(e) => setTotalTax(e.target.value)}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Round Off</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="roundOff"
                      placeholder=""
                      title="Round Off"
                      value={round_difference}
                      onChange={(e) => setRoundDifference(e.target.value)}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Total Bill Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="totalBillAmount"
                      placeholder=""
                      title="Total Bill Amount"
                      value={TotalBill}
                      onChange={(e) => setTotalBill(e.target.value)}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-3 mb-2' style={{ display: "none" }}>
                    <label className='fw-bold'>Screen Type</label>
                    <input
                      className='form-control'
                      type="text"
                      required
                      title="Please enter the screen type"
                      value={Type}
                      onChange={(e) => setType(e.target.value)}
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Item Code</label>
                    <div title="Please select the item code">
                      <Select
                        id="salesMode"
                        className="exp-input-field"
                        placeholder=""
                        required
                        title="Please select the item code"
                        value={selectedItem}
                        onChange={handleChangeItem}
                        options={filteredOptionItem}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md'>
                <div className="ag-theme-alpine" style={{ height: 300, width: "100%" }}>
                  <AgGridReact
                    columnDefs={columnDefsTermsConditions}
                    rowData={rowDataTerms}
                    defaultColDef={{ editable: true }}
                    rowHeight={28}
                    onRowClicked={handleRowClicked}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-lg border-0 p-5 rounded-5 mt-3" style={{ height: "auto" }}>
            <div className='row '>
              <div className='d-flex justify-content-between'>
                <div className='desktopbuttons'>
                  <div className='d-flex justify-content-start ms-2'>
                    <button onClick={() => handleToggleTable('myTable')} title="Item Details" className={`col-md-8 salesbutton col-md-2 "toggle-btn" ${activeTable === 'myTable' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}> Item Details</button>
                    <button onClick={() => handleToggleTable('tax')} title="Tax Details" className={`col-md-8 salesbutton col-md-2 "toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}> Tax Details</button>
                  </div>
                </div>
                <div className='mobile_buttons'>
                  <div className='d-flex justify-content-start mt-3'>
                    <button onClick={() => handleToggleTable('myTable')} className={`col-md-8 salesbutton col-md-2  "toggle-btn" ${activeTable === 'myTable' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", fontSize: "13px" }}> Item Details</button>
                    <button onClick={() => handleToggleTable('tax')} className={`col-md-8 salesbutton col-md-2 "toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", fontSize: "13px", marginLeft: "8px" }}> Tax Details</button>
                  </div>
                </div>
                <div className='desktopbuttons'>
                  <div className='d-flex justify-content-end me-2'>
                    <button className=' col-md-7 salesbutton me-2' title="Add Row" onClick={handleAddRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                    </svg>
                    </button>
                    <button className='col-md-7 salesbutton' title="Less Row" onClick={handleRemoveRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-lg" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8" />
                    </svg>
                    </button>
                  </div>
                </div>
                <div className='mobile_buttons mt-4 p-1'>
                  <div className='d-flex justify-content-end me-2'>
                    <button className=' col-md-7 salesbutton me-2 ms-2' onClick={handleAddRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                    </svg>
                    </button>
                    <button className='col-md-7 salesbutton' onClick={handleRemoveRow} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-lg" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8" />
                    </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="ag-theme-alpine" style={{ height: 330, width: '100%' }}>
              <AgGridReact
                columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
                rowData={activeTable === 'myTable' ? rowData : rowDataTax}
                defaultColDef={{ editable: true, resizable: true }}
                rowSelection="single"
                onGridReady={(params) => setGridApi(params.api)}
                onRowClicked={handleRowClicked}
                onCellKeyDown={(event) => {
                  if (event.event.key === 'Enter') {
                    event.event.preventDefault();

                    const currentField = event.column.getColId();
                    const currentIndex = navigationOrder.indexOf(currentField);

                    if (currentIndex !== -1 && currentIndex < navigationOrder.length - 1) {
                      const nextField = navigationOrder[currentIndex + 1];

                      event.api.startEditingCell({
                        rowIndex: event.node.rowIndex,
                        colKey: nextField,
                      });
                    }
                  }
                }}
                onCellValueChanged={async (event) => {
                  const { field, data } = event.colDef;

                  if (field === 'salesQty') {
                    if (event.data.purchaseAmt > 0) {
                      await ItemSalesAmountCalculation(event);
                    } else {
                      toast.warning("Enter Purchase Amount greater than 0 before entering Sales Qty");
                    }
                  } else if (field === 'purchaseAmt') {
                    await ItemSalesAmountCalculation(event);
                  }

                  handleCellValueChanged(event);
                }}
              />
            </div>
          </div>
          <>
            <ItemHelp open={open} handleClose={handleClose} handleItem={handleItem} type={salesMode} />
            <WarehouseHelp open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
            <CustomerHelp open={open2} handleClose={handleClose} handleVendor={handleVendor} />
            <SalesPopup open={open3} handleClose={handleClose} handleData={handleData} apiPath={isChecked || SelectedScreen?.value === "Sales Order" ? "salesOrderSearchData" : "salessearchdata"} />
            {showScanner && (<BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleScanComplete} />)}
          </>
        </div>
      ) : (
        <div>
          {loading && <LoadingScreen />}
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className="card shadow-lg border-0 p-3 rounded-5" style={{ height: "auto" }}>
            <div className="d-flex justify-content-between">
              <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">{Screen === "Sales Order" ? 'Deleted Sales Order' : 'Deleted Sales'}</h4> </div>
              <div className='d-flex justify-content-end row'>
                <div className="col-md-6 " title='Please select the screen'>
                  <Select
                    id="returnType"
                    className=" mt-1"
                    placeholder=""
                    required
                    value={SelectedScreen}
                    onChange={handleChangeScreen}
                    options={filteredOptionScreen}
                  />
                </div>
                <div className="col-md-6 ">
                  <div title="Please select the screen type">
                    <Select
                      id="returnType"
                      className=" mt-1"
                      placeholder=""
                      required
                      value={selectedscreens}
                      onChange={handleChangeScreens}
                      options={filteredOptionScreens}
                    />
                  </div>
                </div>
                {/* <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-success p-1' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
              </svg>
              </a>
              </div>
              <div className='col-md-2 mt-1 me-0 mb-5' ><a className='border-none text-danger p-1' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
              </svg>
              </a>
              </div>
              <div className='col-md-2 mt-1 mb-5' ><a className='border-none text-dark p-1' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
              </svg>
              </a>
              </div>
              <div className='col-md-2 mt-1 mb-5 ' ><a className='border-none text-dark p-1 ' style={{ cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                </svg>
              </a>
              </div> */}
              </div>
            </div>
            <div className="row">
              <div className="col-md-3 mb-2">
                <label className="fw-bold">Bill No</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control pe-5"
                    id='saleReferNo'
                    required
                    title="Please enter the bill no"
                    value={refNo}
                    onChange={handleDeletedRerNo}
                    onKeyPress={handleKeyDelete}
                    autoComplete="off"
                  />
                  <a
                    className=" position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                    style={{ zIndex: 2, cursor: 'pointer' }}
                    onClick={handleSalesData}
                    title='Deleted Sales Help'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="col-md-3 mb-2">
                <label className="fw-bold">Customer Code</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control pe-5"
                    id='customercode'
                    value={deleteCustomerCode}
                    autoComplete="off"
                    readOnly
                    title='Customer Code'
                  />
                </div>
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Customer Name</label>
                <input
                  type="text"
                  className='form-control'
                  id="customername"
                  title='Customer Name'
                  value={deleteCustomerName}
                  readOnly
                />
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Pay Type </label>
                <input
                  id="payType"
                  value={deletePayType}
                  className="form-control"
                  placeholder=""
                  title='Pay Type'
                  readOnly
                  autoComplete="off"
                />
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Sales Type </label>
                <input
                  id="salesType"
                  value={deleteSalesType}
                  className="form-control"
                  placeholder=""
                  title='Sales Type'
                  autoComplete="off"
                  readOnly
                />
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Order Type </label>
                <input
                  id="ordertype"
                  value={deleteOrderType}
                  className="form-control"
                  placeholder=""
                  readOnly
                  autoComplete="off"
                  title='Order Type'
                />
              </div>
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Bill Date</label>
                <input
                  type="Date"
                  className='form-control'
                  id="billDate"
                  readOnly
                  placeholder=""
                  title='Bill Date'
                  value={deleteBillDate}
                  autoComplete="off"
                />
              </div>
              {/* <div className='col-md-3 mb-2'>
              <label className='fw-bold'>DC No</label>
              <input
                type="text"
                className='form-control'
                id="dcno"
                placeholder=""
                required
                readOnly
                value={deleteDelvychellanno}
                autoComplete="off"
              />
            </div> */}
              <div className='col-md-3 mb-2'>
                <label className='fw-bold'>Sales Mode </label>
                <input
                  id="deletedSalesMode"
                  className="form-control"
                  placeholder=""
                  title='Sales Mode'
                  readOnly
                  value={deletedSalesMode}
                />
              </div>
            </div>
          </div>
          <div className="card shadow-lg border-0 p-5 rounded-5 mt-3" style={{ height: "auto" }}>
            <div className='row'>
              <div className="col-md">
                <div className="row">
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Paid Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="deletedPaidAmount"
                      placeholder=""
                      readOnly
                      title='Paid Amount'
                      value={deletedPaidAmount}
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Return Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="deletedReturnAmount"
                      placeholder=""
                      title='Return Amount'
                      value={deletedReturnAmount}
                      autoComplete="off"
                      readOnly
                    />
                  </div>
                </div>
                <div className="row">
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Total Sales Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="totalSaleAmount"
                      placeholder=""
                      title='Total Sales Amount'
                      value={deleteTotalsales}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Tax Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="totalTaxAmount"
                      placeholder=""
                      title='Tax Amount'
                      value={deleteTotalTax}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Round Off</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="roundOff"
                      placeholder=""
                      title='Round Off'
                      value={deleteRoundedDifference}
                      readOnly
                      autoComplete="off"
                    />
                  </div>
                  <div className='col-md-6 mb-2'>
                    <label className='fw-bold'>Total Bill Amount</label>
                    <input
                      type="Number"
                      className='form-control'
                      id="totalBillAmount"
                      placeholder=""
                      readOnly
                      value={deleteTotalBill}
                      title='Total Bill Amount'
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
              <div className='col-md'>
                <div className="ag-theme-alpine" style={{ height: 200, width: "100%" }}>
                  <AgGridReact
                    columnDefs={deletedTermsConditions}
                    rowData={deletedRowDataTerms}
                    rowHeight={28}
                    onRowClicked={handleRowClicked}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-lg border-0 p-5 rounded-5 mt-3" style={{ height: "auto" }}>
            <div className='row '>
              <div className='d-flex justify-content-between'>
                <div className='desktopbuttons'>
                  <div className='d-flex justify-content-start ms-2'>
                    <button onClick={() => handleToggleTable('myTable')} title="Item Details" className={`col-md-8 salesbutton col-md-2 "toggle-btn" ${activeTable === 'myTable' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}> Item Details</button>
                    <button onClick={() => handleToggleTable('tax')} title="Tax Details" className={`col-md-8 salesbutton col-md-2 "toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}> Tax Details</button>
                  </div>
                </div>
                <div className='mobile_buttons'>
                  <div className='d-flex justify-content-start'>
                    <button onClick={() => handleToggleTable('myTable')} className={`col-md-8 salesbutton col-md-2  "toggle-btn" ${activeTable === 'myTable' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", fontSize: "11px" }}> Item Details</button>
                    <button onClick={() => handleToggleTable('tax')} className={`col-md-8 salesbutton col-md-2 "toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", fontSize: "11px" }}> Tax Details</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="ag-theme-alpine" style={{ height: 330, width: '100%' }}>
              <AgGridReact
                columnDefs={activeTable === 'myTable' ? columnDeletdDef : columnDelDefsTax}
                rowData={activeTable === 'myTable' ? rowDataDelete : rowDataTaxDelete}
                defaultColDef={{ editable: true, resizable: true }}
                rowSelection="Single"
              />
            </div>
            <>
              <SalesDeletedHelp open={open4} handleClose={handleClose} handleDeletedData={handleDeletedData} apiPath={SelectedScreen?.value === "Sales Order" ? "deletedSalesOrderSearchData" : "getsalesdelsearchdata"} />
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProductTable;
