import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import RetunrHelpPopup from '../Transactions/Popups/PurchaseReturnHelpPopup';
import Purchasereturnpopup from '../Transactions/Popups/PurchaseReturnPopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as XLSX from 'xlsx';
import { faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
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
import LoadingScreen from '../BookLoader';
import '../App.css';
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

const config = require('../ApiConfig');

function PurchaseReturn() {

  const [rowData, setRowData] = useState([]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [payType, setPayType] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [returnnumber, setReturNumber] = useState("");
  const [returnreason, setReturReason] = useState("");
  const [purch_autono, setPurch_autono] = useState("");
  const [returnperson, setReturPerson] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [vendorcode, setvendor_code] = useState('');
  const [TotalBillAmount, setTotalBillAmount] = useState(0);
  const [TotalTaxAmount, setTotalTaxAmount] = useState(0)
  const [TotalPurchaseAmount, setTotalPurchaseAmount] = useState(0)
  const [round_difference, setRoundDifference] = useState(0)
  const [error, setError] = useState("");
  const [vendor_name, setVendorName] = useState("");
    const [showAsterisk, setShowAsterisk] = useState(false);
      const [authError, setAuthError] = useState("");

  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });
  const [loading, setLoading] = useState(false);

  const returnReason = useRef();
  const retperson = useRef();
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [status, setStatus] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [showReportButton, setshowReportButton] = useState(false);


  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const purchaseReturnPermission = permissions
    .filter(permission => permission.screen_type === 'PurchaseReturn')
    .map(permission => permission.permission_type.toLowerCase());



  //Item Name Popup
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);

  const handleClickOpen = (event) => {
    setOpen(true);
  };

  const handleClickReturn = (event) => {
    setOpen1(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
  };

  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    console.log(clickedRowIndex)
  };

  const PurreturnItemAmountCalculation = async (params) => {
    if (params.data.purchaseQty >= params.data.returnQty) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getPurchaseReturnItemAmountCalculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            Item_SNO: params.data.serialNumber,
            Item_code: params.data.itemCode,
            return_qty: Number(params.data.returnQty),
            purchaser_amt: params.data.purchaseAmt,
            tax_type_header: params.data.taxDetails,
            tax_name_details: params.data.taxType,
            tax_percentage: params.data.taxPer,
            UnitWeight: params.data.unitWeight,
            company_code: sessionStorage.getItem('selectedCompanyCode')
          })
        });

        if (response.ok) {
          const searchData = await response.json();
          console.log(searchData);

          const updatedRowData = rowData.map(row => {
            if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
              const matchedItem = searchData.find(item => item.id === row.id);
              if (matchedItem) {
                return {
                  ...row,
                  returnWeight: formatToTwoDecimalPoints(matchedItem.ItemTotalWeight),
                  totalReturnAmount: formatToTwoDecimalPoints(matchedItem.TotalReturnAmount),
                  totalTaxAmount: formatToTwoDecimalPoints(matchedItem.TotalTaxAmount)
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
              existingItemWithSameCode.TaxPercentage = formatToTwoDecimalPoints(item.TaxPercentage);
              existingItemWithSameCode.TaxAmount = formatToTwoDecimalPoints(item.TaxAmount);
            } else {
              const newRow = {
                ItemSNO: item.ItemSNO,
                TaxSNO: item.TaxSNO,
                Item_code: item.Item_code,
                TaxType: item.TaxType,
                TaxPercentage: formatToTwoDecimalPoints(item.TaxPercentage),
                TaxAmount: formatToTwoDecimalPoints(item.TaxAmount)
              };
              updatedRowDataTaxCopy.push(newRow);
            }
          });

          updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);
          setRowDataTax(updatedRowDataTaxCopy);

          const hasReturnQty = updatedRowData.some(row => row.returnQty >= 0);

          if (hasReturnQty) {
            const totalReturnAmount = updatedRowData.map(row => row.totalReturnAmount || 0.00).join(',');
            const totalTaxAmount = updatedRowData.map(row => row.totalTaxAmount || 0.00).join(',');

            const formattedTotalItemAmounts = totalReturnAmount.endsWith(',') ? totalReturnAmount.slice(0, -1) : totalReturnAmount;
            const formattedTotalTaxAmounts = totalTaxAmount.endsWith(',') ? totalTaxAmount.slice(0, -1) : totalTaxAmount;

            console.log("formattedTotalItemAmounts", formattedTotalItemAmounts)
            console.log("formattedTotalTaxAmounts", formattedTotalTaxAmounts)

            await TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

          } else {
            console.log("No rows with purchaseQty greater than 0 found");
          }

        } else if (response.status === 404) {
          console.log("Data not found");
        } else {
          console.log("Bad request");
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    } else {
      console.log("Purchase quantity should be greater than or equal to return quantity. Skipping calculation.");
    }
  };



  const TotalAmountCalculation = async (formattedTotalTaxAmounts, formattedTotalItemAmounts) => {
    if (parseFloat(formattedTotalTaxAmounts) >= 0 && parseFloat(formattedTotalItemAmounts) >= 0) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/TotalAmountCalculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Tax_amount: formattedTotalTaxAmounts, company_code: sessionStorage.getItem("selectedCompanyCode"), Putchase_amount: formattedTotalItemAmounts }),
        });
        if (response.ok) {
          const data = await response.json();
          console.table(data)
          const [{ rounded_amount, TotalPurchase, round_difference, TotalTax }] = data;
          setTotalBillAmount(formatToTwoDecimalPoints(rounded_amount));
          setTotalPurchaseAmount(formatToTwoDecimalPoints(TotalPurchase));
          setRoundDifference(formatToTwoDecimalPoints(round_difference));
          setTotalTaxAmount(formatToTwoDecimalPoints(TotalTax));
        } else {
          const errorMessage = await response.text();
          console.error(`Server responded with error: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };


  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber; // Assuming s.no is used to identify the row

    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
    const updatedRowDataTax = rowDataTax.filter(row => row.ItemSNO !== serialNumberToDelete.toString());

    setRowData(updatedRowData);
    setRowDataTax(updatedRowDataTax);

    if (updatedRowData.length === 0) {
      const formattedTotalItemAmounts = '0.00';
      const formattedTotalTaxAmounts = '0.00';

      TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);
    }

    const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
      ...row,
      serialNumber: index + 1
    }));
    setRowData(updatedRowDataWithNewSerials);

    const updatedRowDataTaxWithNewSerials = updatedRowDataTax.map((taxRow) => {
      const correspondingRow = updatedRowDataWithNewSerials.find(
        (dataRow) => dataRow.itemCode === taxRow.Item_code
      );

      return correspondingRow
        ? { ...taxRow, ItemSNO: correspondingRow.serialNumber.toString() }
        : taxRow;
    });
    setRowDataTax(updatedRowDataTaxWithNewSerials);

    const totalItemAmounts = updatedRowData.map(row => row.totalReturnAmount || '0.00').join(',');
    const totalTaxAmounts = updatedRowData.map(row => row.totalTaxAmount || '0.00').join(',');

    const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
    const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

    TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

  };



  const onCellValueChanged = (params) => {
    if (params.colDef.field === 'returnQty') {
      const purchaseQty = params.data.purchaseQty;
      let newValue = parseFloat(params.newValue);

      if (isNaN(newValue) || newValue < 0 || newValue > purchaseQty) {
        newValue = 0;
        params.node.setDataValue('returnQty', newValue);
        params.api.refreshCells({ rowNodes: [params.node], columns: ['returnQty'] }); // Refresh cell

        let errorMessage = '';
        if (isNaN(newValue)) {
          errorMessage = 'Please enter a valid number.';
        } else if (newValue < 0) {
          errorMessage = 'Negative values are not allowed for return quantity.';
        } else if (newValue > purchaseQty) {
          errorMessage = 'Return quantity cannot be greater than purchase quantity.';
        }

        toast.warning("Check the Return Qty");
      } else {
        params.data.returnQty = newValue;
        PurreturnItemAmountCalculation(params);
      }
    } else {
      // Handle other fields if needed
    }
  };


  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning("Please enter a valid numeric quantity.");
      return false;
    }

    if (isNaN(newValue) || newValue < 0) {
      toast.warning("Return qty cannot be negative!");
      return false;
    }

    if (newValue > params.data.purchaseQty) {
      toast.warning("Return qty cannot be greater than the purchase quantity!");
      return false;
    }

    params.data.returnQty = newValue;
    return true;
  }

  // Column definitions for the grid
  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 80,
      editable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 25,
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      headerName: 'Item Code',
      field: 'itemCode',
      editable: true,
      // maxWidth: 140,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: true,
      // minWidth: 383,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Unit Weight',
      field: 'unitWeight',
      editable: true,
      // maxWidth: 150,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      editable: true,
      filter: true,
      // maxWidth: 150,
      editable: false,
    },
    {
      headerName: 'Purchase Qty',
      field: 'purchaseQty',
      editable: true,
      filter: true,
      // maxWidth: 140,
      editable: false,
    },
    {
      headerName: 'Return Qty',
      field: 'returnQty',
      editable: true,
      // maxWidth: 170,
      filter: true,
      valueSetter: qtyValueSetter,

      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: 'Total  Weight',
      field: 'itemTotalWeight',
      editable: true,
      // maxWidth: 140,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Return Weight',
      field: 'returnWeight',
      editable: true,
      // maxWidth: 160,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Unit Price',
      field: 'purchaseAmt',
      editable: true,
      // maxWidth: 170,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'totalTaxAmount',
      editable: true,
      // maxWidth: 130,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Total',
      field: 'totalReturnAmount',
      editable: true,
      filter: true,
      // maxWidth: 120,
      editable: false,
    },
    {
      headerName: 'Tax Type',
      field: 'taxType',
      editable: true,
      // maxWidth: 150,
      filter: true,
      hide: true,
      editable: false,
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: true,
      // maxWidth: 150,
      filter: true,
      hide: true,
      editable: false,
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: true,
      // maxWidth: 150,
      filter: true,
      hide: true,
      editable: false,
    },
  ];

  //DEFINE TAX DETAIL COLUMNS
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
      // minWidth: 401,
      editable: false,
    },
    {
      headerName: 'Tax Type ',
      field: 'TaxType',
      // minWidth: 401,
      editable: false,
    },
    {
      headerName: 'Tax %',
      field: 'TaxPercentage',
      // minWidth: 401,
      editable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxAmount',
      // minWidth: 401,
      editable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxName',
      // minWidth: 401,
      hide: true,
      editable: false,
    }
  ];


  const handleSaveButtonClick = async () => {
    if (!vendorcode || !returnDate || !purch_autono || !transactionDate || !returnperson || !returnreason) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    const filteredRowData = rowData.filter(row => row.returnQty > 0);

    if (filteredRowData.length === 0 || rowDataTax.length === 0) {
      toast.warning('Give Return Qty to save.');
      return;
    }
    setLoading(true);

    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        vendor_code: vendorcode,
        pay_type: payType,
        purchase_type: purchaseType,
        Entry_date: entryDate,
        transaction_no: purch_autono.toString(),
        transaction_date: transactionDate,
        purchase_amount_returne: parseFloat(TotalBillAmount),
        tax_amount: parseFloat(TotalTaxAmount),
        total_amount: parseFloat(TotalPurchaseAmount),
        Return_date: returnDate,
        return_reason: returnreason,
        return_person: returnperson,
        vendor_name: vendor_name,
        rounded_off: parseFloat(round_difference),
        created_by: sessionStorage.getItem('selectedUserCode')
      };
      const response = await fetch(`${config.apiBaseUrl}/addpurchasereturnheader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ Return_no }] = searchData;
        setReturNumber(Return_no);

        toast.success("Purchase Return Data inserted Successfully")

        await savePurchasereturnDetails(Return_no);
        await savePurchaserturnTaxDetails(Return_no);
        setShowExcelButton(true);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.warning(errorResponse.message || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const savePurchasereturnDetails = async (Return_no) => {
    setLoading(true);
    try {
      for (const row of rowData) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          transaction_date: transactionDate,
          transaction_no: purch_autono.toString(),
          return_no: Return_no,
          return_date: returnDate,
          warehouse_code: row.warehouse,
          vendor_code: vendorcode,
          item_code: row.itemCode,
          item_name: row.itemName,
          bill_qty: row.purchaseQty,
          return_qty: row.returnQty,
          bill_rate: row.totalReturnAmount,
          item_amt: row.purchaseAmt,
          weight: row.unitWeight,
          return_weight: row.returnWeight,
          total_weight: row.itemTotalWeight,
          return_details: returnreason,
          pay_type: payType,
          purchase_type: purchaseType,
          tax_amount: row.totalTaxAmount,
          customer_name: vendor_name,
          return_amt: row.totalReturnAmount,
          ItemSNo: row.serialNumber
        };
        const response = await fetch(`${config.apiBaseUrl}/addpurchasereturndetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Purchase Return Details Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.message); // Log error message
          toast.warning(errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  // CODE TO SAVE PURCHASERETURNTAX details 
  const savePurchaserturnTaxDetails = async (Return_no) => {
    setLoading(true);
    try {
      for (const row of rowData) {
        const matchingTaxRows = rowDataTax.filter(taxRow => taxRow.Item_code === row.itemCode);
        for (const taxRow of matchingTaxRows) {
          const Details = {
            company_code: sessionStorage.getItem('selectedCompanyCode'),
            TaxSNo: taxRow.TaxSNO,
            transaction_no: purch_autono.toString(),
            transaction_date: transactionDate,
            return_date: returnDate,
            return_no: Return_no,
            return_reason: returnreason,
            return_person: returnperson,
            item_code: taxRow.Item_code,
            item_name: row.itemName,
            tax_type: row.taxType,
            tax_per: taxRow.TaxPercentage,
            tax_amt: taxRow.TaxAmount,
            vendor_code: vendorcode,
            pay_type: payType,
            ItemSNo: row.serialNumber,
            tax_name_details: taxRow.TaxType,
          };
          const response = await fetch(`${config.apiBaseUrl}/addpurchasereturntaxdetails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("Purchase Return TaxDetails Data inserted successfully");
          } else {
            const errorResponse = await response.json();
            console.error(errorResponse.message); // Log error message
            toast.warning(errorResponse.message);
          }
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTable = (table) => {
    setActiveTable(table);
  };

  const ReturnHelp = async (data) => {
    setLoading(true);
    if (data && data.length > 0) {
      const [{ TransactionNo, TransactionDate, Entrydate, PurchaseType, PayType, purch_autono, VendorName, Vendorcode }] = data;

      const partycodeInput = document.getElementById('payType');
      if (partycodeInput) {
        partycodeInput.value = PayType;
        setPayType(PayType);
      } else {
        console.error('payType element not found');
      }

      const entrydate = document.getElementById('entryDate');
      if (entrydate) {
        entrydate.value = Entrydate;
        setEntryDate(formatDate(Entrydate));
      } else {
        console.error('entry element not found');
      }

      const transactiondate = document.getElementById('transactiondate');
      if (transactiondate) {
        transactiondate.value = TransactionDate;
        setTransactionDate(formatDate(TransactionDate));
      } else {
        console.error('entry element not found');
      }

      const purchasetype = document.getElementById('purchasetype');
      if (purchasetype) {
        purchasetype.value = PurchaseType;
        setPurchaseType(PurchaseType);
      } else {
        console.error('purchasetype element not found');
      }

      const transactionNumber = document.getElementById('PurchaseNo');
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setPurch_autono(TransactionNo);
      } else {
        console.error('transactionNumber element not found');
      }

      const vendorr = document.getElementById('party_code');
      if (vendorr) {
        vendorr.value = Vendorcode;
        setvendor_code(Vendorcode);
      } else {
        console.error('vendor element not found');
      }

      await purchasereturntax(TransactionNo);
      console.log(purch_autono)
    } else {
      console.log("Data not fetched...!");
      setLoading(false);
    }
    console.log(data);
  };

  const purchasereturntax = async (TransactionNo) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpurchasereturntax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let taxType = '';
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
          taxType = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTax(newTaxDetail);

        purchasereturnit(TransactionNo, taxNameDetailsString, taxPerDetaiString, taxType);
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };


  const purchasereturnit = async (TransactionNo, taxNameDetailsString, taxPerDetaiString, taxType) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpurchasereturnit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
            tax_amount,
            return_weight,
            bill_rate,
            return_amt,
            vendor_name
          } = item;

          setVendorName(vendor_name)

          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: item_code,
            itemName: item_name,
            unitWeight: weight,
            purchaseQty: bill_qty,
            returnweight: return_weight,
            warehouse: warehouse_code,
            itemTotalWeight: total_weight,
            purchaseAmt: item_amt,
            totalTaxAmount: tax_amount,
            totalReturnAmount: bill_rate,
            taxType: taxNameDetailsString,
            taxPer: taxPerDetaiString,
            taxDetails: taxType,
            returnamt: return_amt
          });
        });
        setRowData(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatToTwoDecimalPoints = (number) => {
    return parseFloat(number).toFixed(2);
  };

  const handleChangeNo = (e) => {
    const refNo = e.target.value;
    setPurch_autono(refNo); setStatus('Typing...');
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRefNo(purch_autono)
      retperson.current.focus();
    }
  };

  const handleKeyViewPress = (e) => {
    if (e.key === 'Enter') {
      handleRefViewNo(returnnumber)
      TransactionStatus(returnnumber)
    }
  };


  const TransactionStatus = async (returnNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purretauthstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ return_no: returnNo, company_code: sessionStorage.getItem('selectedCompanyCode') }),
      });
      if (response.ok) {
        const searchData = await response.json();
        if (Array.isArray(searchData)) {
          const formattedOptions = searchData.map((item) => ({
            value: item.descriptions,
            label: item.attributedetails_name,
          }));
          setStatus(formattedOptions);
        } else {
          console.log("Data fetched is not in the expected array format");
        }
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return (`${year}-${month}-${day}`);
  };

  const handleEntryDateChange = (event) => {
    setEntryDate(event.target.value);
  };

  const handleRefNo = async (code) => {
    setButtonsVisible(false)
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getPurchaseData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          setRowDataTax([]);
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
        }
        return;
      }

      const searchData = await response.json();

      if (searchData.table1 && searchData.table1.length > 0) {
        const item = searchData.table1[0];
        setEntryDate(formatDate(item.Entry_date));
        setPayType(item.pay_type);
        setPurchaseType(item.purchase_type);
        setTransactionDate(formatDate(item.transaction_date));
        setPurch_autono(item.transaction_no);
        setvendor_code(item.vendor_code);
      } else {
        console.log("Table 1 is empty or not found");
        clearFormFields();
      }

      if (searchData.table2 && searchData.table2.length > 0) {
        const updatedRowData = searchData.table2.map(item => {
          const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);
          const taxType = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
          const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
          const taxDetails = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

          setVendorName(item.vendor_name);

          return {
            serialNumber: item.ItemSNo,
            itemCode: item.item_code,
            itemName: item.item_name,
            unitWeight: item.weight,
            warehouse: item.warehouse_code,
            purchaseQty: item.bill_qty,
            itemTotalWeight: parseFloat(item.total_weight).toFixed(2),
            purchaseAmt: item.item_amt,
            TotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
            TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
            taxType: taxType || null,
            taxPer: taxPer || null,
            taxDetails: taxDetails || null
          };
        });

        setRowData(updatedRowData);
      } else {
        console.log("Table 2 is empty or not found");
        setRowData([]);
      }

      if (searchData.table3 && searchData.table3.length > 0) {
        const updatedRowDataTax = searchData.table3.map(item => {
          return {
            ItemSNO: item.ItemSNo,
            TaxSNO: item.TaxSNo,
            Item_code: item.item_code,
            TaxType: item.tax_name_details,
            TaxPercentage: item.tax_per,
            TaxAmount: item.tax_amt,
            TaxName: item.tax_type
          };
        });

        setRowDataTax(updatedRowDataTax);
      } else {
        console.log("Table 3 is empty or not found");
        setRowDataTax([]);
      }

      console.log("Data fetched successfully");
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFormFields = () => {
    setEntryDate("");
    setPayType("");
    setPurchaseType("");
    setTransactionDate("");
    setPurch_autono("");
    setvendor_code("");
    setReturNumber("");
    setReturReason("");
    setReturPerson("");
    setVendorName("");
    setEntryDate("");
    setRoundDifference("");
    setTotalPurchaseAmount("");
    setTotalBillAmount("");
    setTotalTaxAmount("");
    setRowData([]);
    setRowDataTax([]);
  };


  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToPurchaseReturnHeaderPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: returnnumber, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const PrintDetailData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToPurchaseReturnDetailPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: returnnumber, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
      const response = await fetch(`${config.apiBaseUrl}/refNumberToPurachseReturnSumTax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: returnnumber, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
    setLoading(true);
    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();
      const taxData = await PrintSumTax();

      if (headerData && detailData && taxData) {
        console.log("All API calls completed successfully");

        sessionStorage.setItem('PRheaderData', JSON.stringify(headerData));
        sessionStorage.setItem('PRdetailData', JSON.stringify(detailData));
        sessionStorage.setItem('PRtaxData', JSON.stringify(taxData));

        window.open('/PurchaseReturnPrint', '_blank');
      } else {
        console.log("Failed to fetch some data");
        toast.error("Return No Does Not Exists");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handletransactionDateChange = (event) => {
    setTransactionDate(event.target.value);
  };


  const handleReload = () => {
    window.location.reload();
  };

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setReturnDate(currentDate);
  }, [currentDate]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (selectedDate === currentDate) {
      setReturnDate(selectedDate);
      setStatus('Current Date Selected');
    } else {
      setStatus('Invalid Date Selected');
    }
  };

  const handleRefViewNo = async (code) => {
     setShowAsterisk(true);
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpurchasereturnView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          setRowDataTax([]);
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
        }
        return;
      }
      setShowExcelButton(true);
      setShowDropdown(true);
      const searchData = await response.json();
      setshowReportButton(true);
      if (searchData.table1 && searchData.table1.length > 0) {
        const item = searchData.table1[0];
        setEntryDate(formatDate(item.entry_date));
        setPayType(item.pay_type);
        setPurchaseType(item.purchase_type);
        setTransactionDate(formatDate(item.transaction_date));
        setReturnDate(formatDate(item.return_date));
        setPurch_autono(item.transaction_no);
        setvendor_code(item.vendor_code);
        setReturNumber(item.return_no);
        setReturReason(item.return_reason);
        setReturPerson(item.return_person);
        setVendorName(item.vendor_name);
        setEntryDate(formatDate(item.entry_date));
        setRoundDifference(item.rounded_off);
        setTotalPurchaseAmount(item.purchase_amount_returne);
        setTotalBillAmount(item.total_amount);
        setTotalTaxAmount(item.tax_amount);
      } else {
        console.log("Table 1 is empty or not found");
        clearFormFields();
      }

      if (searchData.table2 && searchData.table2.length > 0) {
        const updatedRowData = searchData.table2.map(item => {

          return {
            serialNumber: item.ItemSNo,
            itemCode: item.item_code,
            itemName: item.item_name,
            unitWeight: item.weight,
            warehouse: item.warehouse_code,
            purchaseQty: item.bill_qty,
            returnQty: item.return_qty,
            returnWeight: item.return_weight,
            itemTotalWeight: parseFloat(item.total_weight).toFixed(2),
            purchaseAmt: item.item_amt,
            totalTaxAmount: item.tax_amount,
            totalReturnAmount: item.bill_rate
          };
        });

        setRowData(updatedRowData);
      } else {
        console.log("Table 2 is empty or not found");
        setRowData([]);
      }

      if (searchData.table3 && searchData.table3.length > 0) {
        const updatedRowDataTax = searchData.table3.map(item => {
          return {
            ItemSNO: item.ItemSNo,
            TaxSNO: item.TaxSNo,
            Item_code: item.item_code,
            TaxType: item.tax_type,
            TaxPercentage: item.tax_per,
            TaxAmount: item.tax_amt,
            TaxName: item.tax_type
          };
        });

        setRowDataTax(updatedRowDataTax);
      } else {
        console.log("Table 3 is empty or not found");
        setRowDataTax([]);
      }

      console.log("Data fetched successfully");

    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemView = async (data) => {
    if (data && data.length > 0) {
      setShowExcelButton(true)
      setShowDropdown(true);

      const [{ TransactionDate, Entrydate, ReturnDate, TotalAmount, TransactionNo, RoundOff, PurchaseReTurnAmount, TotalTax, ReturnPerson, PayType, PurchaseType, ReturnNo, ReturnReason, VendorName, Vendorcode }] = data;

      // Set PayType
      const partycodeInput = document.getElementById('payType');
      if (partycodeInput) {
        partycodeInput.value = PayType;
        setPayType(PayType);
      } else {
        console.error('payType element not found');
      }

      const returnDate = document.getElementById('Returndate');
      if (returnDate) {
        returnDate.value = ReturnDate;
        setReturnDate(formatDate(ReturnDate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const Returno = document.getElementById('returnnumber');
      if (Returno) {
        Returno.value = ReturnNo;
        setReturNumber(ReturnNo);
      } else {
        console.error('returnnumber element not found');
      }

      const transactionno = document.getElementById('PurchaseNo');
      if (transactionno) {
        transactionno.value = TransactionNo;
        setPurch_autono(TransactionNo);
      } else {
        console.error('Transation element not found');
      }


      const Roundoff = document.getElementById('roundOff');
      if (Roundoff) {
        Roundoff.value = RoundOff;
        setRoundDifference(RoundOff);
      } else {
        console.error('RoundOff element not found');
      }

      const returnReason = document.getElementById('returnreason');
      if (returnReason) {
        returnReason.value = ReturnReason;
        setReturReason(ReturnReason);
      } else {
        console.error('returnreason element not found');
      }

      const returnperson = document.getElementById('returnperson');
      if (returnperson) {
        returnperson.value = ReturnPerson;
        setReturPerson(ReturnPerson);
      } else {
        console.error('returnreason element not found');
      }

      const totaltax = document.getElementById('totalTaxAmount');
      if (totaltax) {
        totaltax.value = TotalTax;
        setTotalTaxAmount(TotalTax);
      } else {
        console.error('TotalTax element not found');
      }

      const totalamount = document.getElementById('totalBillAmount');
      if (totalamount) {
        totalamount.value = PurchaseReTurnAmount;
        setTotalBillAmount(PurchaseReTurnAmount);
      } else {
        console.error('TotalTax element not found');
      }

      const Purchaseretamount = document.getElementById('totalPurchaseAmount');
      if (Purchaseretamount) {
        Purchaseretamount.value = TotalAmount;
        setTotalPurchaseAmount(TotalAmount);
      } else {
        console.error('TotalAmount element not found');
      }

      const entrydate = document.getElementById('entryDate');
      if (entrydate) {
        entrydate.value = Entrydate;
        setEntryDate(formatDate(Entrydate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const transactiondate = document.getElementById('transactiondate');
      if (transactiondate) {
        transactiondate.value = TransactionDate;
        setTransactionDate(formatDate(TransactionDate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const purchasetype = document.getElementById('purchasetype');
      if (purchasetype) {
        purchasetype.value = PurchaseType;
        setPurchaseType(PurchaseType);
      } else {
        console.error('purchasetype element not found');
      }

      const paytype = document.getElementById('payType');
      if (paytype) {
        paytype.value = PayType;
        setPayType(PayType);
      } else {
        console.error('purchasetype element not found');
      }


      const referenceNumberInput = document.getElementById('referenceNumber');
      if (referenceNumberInput) {
        referenceNumberInput.value = purch_autono;
        setPurch_autono(purch_autono);
      } else {
        console.error('referenceNumber element not found');
      }

      const vendorr = document.getElementById('party_code');
      if (vendorr) {
        vendorr.value = Vendorcode;
        setvendor_code(Vendorcode);
      } else {
        console.error('vendor element not found');
      }

      const partyName = document.getElementById('party_name');
      if (partyName) {
        partyName.value = VendorName;
        setVendorName(VendorName);
      } else {
        console.error('VendorName element not found');
      }

      TransactionStatus(ReturnNo)
      await purchasereturntaxView(ReturnNo);
    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };


  const Purreturnhelp = async (data) => {
    if (data && data.length > 0) {
      setshowReportButton(true)
       setShowAsterisk(true);
      setShowDropdown(true);
      setLoading(true);

      const [{ TransactionDate, Entrydate, ReturnDate, TotalAmount, TransactionNo, RoundOff, PurchaseReTurnAmount, TotalTax, ReturnPerson, PayType, PurchaseType, ReturnNo, ReturnReason, VendorName, Vendorcode }] = data;

      // Set PayType
      const partycodeInput = document.getElementById('payType');
      if (partycodeInput) {
        partycodeInput.value = PayType;
        setPayType(PayType);
      } else {
        console.error('payType element not found');
      }

      const returnDate = document.getElementById('Returndate');
      if (returnDate) {
        returnDate.value = ReturnDate;
        setReturnDate(formatDate(ReturnDate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const Returno = document.getElementById('returnnumber');
      if (Returno) {
        Returno.value = ReturnNo;
        setReturNumber(ReturnNo);
      } else {
        console.error('returnnumber element not found');
      }

      const transactionno = document.getElementById('PurchaseNo');
      if (transactionno) {
        transactionno.value = TransactionNo;
        setPurch_autono(TransactionNo);
      } else {
        console.error('Transation element not found');
      }


      const Roundoff = document.getElementById('roundOff');
      if (Roundoff) {
        Roundoff.value = RoundOff;
        setRoundDifference(RoundOff);
      } else {
        console.error('RoundOff element not found');
      }

      const returnReason = document.getElementById('returnreason');
      if (returnReason) {
        returnReason.value = ReturnReason;
        setReturReason(ReturnReason);
      } else {
        console.error('returnreason element not found');
      }

      const returnperson = document.getElementById('returnperson');
      if (returnperson) {
        returnperson.value = ReturnPerson;
        setReturPerson(ReturnPerson);
      } else {
        console.error('returnreason element not found');
      }

      const totaltax = document.getElementById('totalTaxAmount');
      if (totaltax) {
        totaltax.value = TotalTax;
        setTotalTaxAmount(TotalTax);
      } else {
        console.error('TotalTax element not found');
      }

      const totalamount = document.getElementById('totalBillAmount');
      if (totalamount) {
        totalamount.value = PurchaseReTurnAmount;
        setTotalBillAmount(PurchaseReTurnAmount);
      } else {
        console.error('TotalTax element not found');
      }

      const Purchaseretamount = document.getElementById('totalPurchaseAmount');
      if (Purchaseretamount) {
        Purchaseretamount.value = TotalAmount;
        setTotalPurchaseAmount(TotalAmount);
      } else {
        console.error('TotalAmount element not found');
      }

      const entrydate = document.getElementById('entryDate');
      if (entrydate) {
        entrydate.value = Entrydate;
        setEntryDate(formatDate(Entrydate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const transactiondate = document.getElementById('transactiondate');
      if (transactiondate) {
        transactiondate.value = TransactionDate;
        setTransactionDate(formatDate(TransactionDate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const purchasetype = document.getElementById('purchasetype');
      if (purchasetype) {
        purchasetype.value = PurchaseType;
        setPurchaseType(PurchaseType);
      } else {
        console.error('purchasetype element not found');
      }

      const paytype = document.getElementById('payType');
      if (paytype) {
        paytype.value = PayType;
        setPayType(PayType);
      } else {
        console.error('purchasetype element not found');
      }


      const referenceNumberInput = document.getElementById('referenceNumber');
      if (referenceNumberInput) {
        referenceNumberInput.value = purch_autono;
        setPurch_autono(purch_autono);
      } else {
        console.error('referenceNumber element not found');
      }

      const vendorr = document.getElementById('party_code');
      if (vendorr) {
        vendorr.value = Vendorcode;
        setvendor_code(Vendorcode);
      } else {
        console.error('vendor element not found');
      }

      const partyName = document.getElementById('party_name');
      if (partyName) {
        partyName.value = VendorName;
        setVendorName(VendorName);
      } else {
        console.error('VendorName element not found');
      }

      TransactionStatus(ReturnNo)
      await purchasereturntaxView(ReturnNo);
    } else {
      console.log("Data not fetched...!");
      setLoading(false);
    }
    console.log(data);
  };


  const purchasereturntaxView = async (ReturnNo) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpurchasereturntaxView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: ReturnNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
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
        });

        setRowDataTax(newTaxDetail);

        purchasereturnitView(ReturnNo);
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowDataTax([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const purchasereturnitView = async (ReturnNo) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpurchasereturnitView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: ReturnNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
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
            return_qty,
            tax_amount,
            return_weight,
            bill_rate,
            return_amt,

          } = item;

          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: item_code,
            itemName: item_name,
            unitWeight: weight,
            purchaseQty: bill_qty,
            returnweight: return_weight,
            warehouse: warehouse_code,
            itemTotalWeight: total_weight,
            purchaseAmt: item_amt,
            totalTaxAmount: tax_amount,
            returnQty: return_qty,
            totalTaxAmount: tax_amount,
            returnWeight: return_weight,
            totalReturnAmount: return_amt,
            bill_rate: bill_rate,
          });
        });
        setRowData(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {

      if (hasValueChanged) {
        await handleKeyDownStatus(e);
        setHasValueChanged(false);
      }


      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };
  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) {
      setHasValueChanged(false);
    }
  };


  const handleExcelDownload = () => {
    const filteredRowData = rowData.filter(row => row.returnQty > 0 && row.totalReturnAmount > 0 && row.purchaseAmt > 0);
    const filteredRowDataTax = rowDataTax.filter(taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0);

    const headerData = [{
      company_code: sessionStorage.getItem('selectedCompanyCode'),
      vendor_code: vendorcode,
      pay_type: payType,
      purchase_type: purchaseType,
      Entry_date: entryDate,
      transaction_no: purch_autono.toString(),
      transaction_date: transactionDate,
      purchase_amount_returne: parseFloat(TotalBillAmount),
      tax_amount: parseFloat(TotalTaxAmount),
      total_amount: parseFloat(TotalPurchaseAmount),
      Return_date: returnDate,
      return_reason: returnreason,
      return_person: returnperson,
      vendor_name: vendor_name,
      rounded_off: parseFloat(round_difference),
    }];

    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    const rowDataSheet = XLSX.utils.json_to_sheet(filteredRowData);
    const rowDataTaxSheet = XLSX.utils.json_to_sheet(filteredRowDataTax);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Details Data");
    XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Tax Details Data");

    XLSX.writeFile(workbook, "Purchase_Return_data.xlsx");
  };

  const handleChangeStatus = (selectedOption) => {
    setSelectedStatus(selectedOption);
    console.log("Selected option:", selectedOption);
  };

  const handleAuthorizedButtonClick = async () => {
      setAuthError(" ");
    setLoading(true);
    try {
      const headerResponse = await AuthorizedHeader();
      const detailsResponse = await AuthorizedDetails();
      const taxDetailsResponse = await AuthorizedTaxDetails();

    if (headerResponse === true && detailsResponse === true && taxDetailsResponse === true) {
         console.log("All API calls completed successfully");
         toast.success(`Data ${selectedStatus.label} Successfully`, {
           autoClose: true,
           onClose: () => {
             window.location.reload();
           }
         });
       } else {
         const errorMessage =
           headerResponse !== true
             ? headerResponse
             : detailsResponse !== true
               ? detailsResponse
               : taxDetailsResponse !== true
                 ? taxDetailsResponse
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
      const response = await fetch(`${config.apiBaseUrl}/PurchReturnAuthHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          return_no: returnnumber,
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
           toast.error('Error inserting data: ' + error.message);
         }
       };

  const AuthorizedDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/PurchReturnAuthDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          return_no: returnnumber,
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
           toast.error('Error inserting data: ' + error.message);
         }
       };
  const AuthorizedTaxDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/PurchReturnAuthTaxDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          return_no: returnnumber,
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
           toast.error('Error inserting data: ' + error.message);
         }
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

  return (
    <div className="container-fluid ">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3 rounded-5 mb-2" style={{ height: "auto" }}>
        <div className="d-flex justify-content-between">
          <div className='d-flex justify-content-start'> <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">Purchase Return</h4> </div>
          <div className='d-flex justify-content-end row'>
            <div className='desktopbuttons'>
              <div className='d-flex justify-content-end me-4 row'>
                {['add', 'all permission'].some(permission => purchaseReturnPermission.includes(permission)) && (
                  <div className='col-md-3 mt-1 mb-5' ><a className='border-none text-success p-1' onClick={handleSaveButtonClick} title='Save' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                  </svg>
                  </a>
                  </div>
                )}
                {showReportButton &&
                  <div className='col-md-3 mt-1 me-0 mb-5' ><a className='border-none text-success p-1' onClick={handleAuthorizedButtonClick} title='Authorization' style={{ cursor: "pointer" }}>  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5l-3.5-3.5a.5.5 0 0 1 .708-.708L6.707 10.293l6.439-6.439a.5.5 0 0 1 .708 0z" />
                        </svg>
                  </a>
                  </div>
                }
                {['view', 'all permission'].some(permission => purchaseReturnPermission.includes(permission)) && (
                  <div className='col-md-3 mt-1 mb-5' ><a className='border-none text-success p-1' onClick={generateReport} title='Excel' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-excel-fill" viewBox="0 0 16 16">
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64"/>
                </svg>
                  </a>
                  </div>
                )}
                <div title='reload' className='col-md-3 mt-1 mb-5' ><a className='border-none text-dark p-1' onClick={handleReload} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16">
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
                    <div className="dropdown-menu show mt-2 custom-dropdown p-2" style={{ display: 'block' }}>
                      {['add', 'all permission'].some(permission => purchaseReturnPermission.includes(permission)) && (
                        <div className='col-md-3 mt-1 mb-3' ><a className='border-none text-success p-1' onClick={handleSaveButtonClick} title='Save' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-floppy2" viewBox="0 0 16 16">
                          <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v3.5A1.5 1.5 0 0 1 11.5 6h-7A1.5 1.5 0 0 1 3 4.5V1H1.5a.5.5 0 0 0-.5.5m9.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                        </svg>
                        </a>
                        </div>
                      )}
                      <div className='col-md-3 mt-1 me-0 mb-3' ><a className='border-none text-success p-1' onClick={handleAuthorizedButtonClick} title='Aunthorization' style={{ cursor: "pointer" }}>  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5l-3.5-3.5a.5.5 0 0 1 .708-.708L6.707 10.293l6.439-6.439a.5.5 0 0 1 .708 0z" />
                        </svg>
                      </a>
                      </div>
                      {['view', 'all permission'].some(permission => purchaseReturnPermission.includes(permission)) && (
                        <div className='col-md-3 mt-1 mb-3' ><a className='border-none text-dark p-1' onClick={generateReport} title='print' style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
                        </svg>
                        </a>
                        </div>
                      )}
                      <div title='reload' className='col-md-3 mt-1 mb-3' ><a className='border-none text-dark p-1' onClick={handleReload} style={{ cursor: "pointer" }}><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16">
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
          {showDropdown && (
            <div className="col-md-3 form-group mb-2">
             <label className={`fw-bold ${error && !purch_autono ? 'text-danger' : ''}`}>Status<span className="text-danger">*</span></label>
              <div class="exp-form-floating">
                <div title="Please select the status">
                <Select
                  id="returnType"
                  className="exp-input-field"
                  placeholder="Select an option"
                  options={status}
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  getOptionLabel={(option) => option.label || ""}
                  getOptionValue={(option) => option.value || ""}
                />
              </div>
              </div>
            </div>
          )}
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !purch_autono ? 'text-danger' : ''}`}>Transaction No <span className="text-danger">*</span></label>
            <div className="position-relative">
              <input type="text" className="form-control pe-5"
                id='PurchaseNo'
                placeholder=""
                required
                value={purch_autono}
                onChange={handleChangeNo}
                onKeyPress={handleKeyPress}
                maxLength={50}
                title='Please enter the transaction no'
                autoComplete='off'
              />
              <a
                className=" position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                style={{ zIndex: 2, cursor:'pointer' }}
                title='Purchase Help'
                onClick={handleClickOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </a>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !returnDate ? 'text-danger' : ''}`}> Return Date <span className="text-danger">*</span></label>
            <div className="position-relative">
              <input type="date"
                className="form-control pe-5"
                id='Returndate'
                class="exp-input-field form-control"
                placeholder=""
                required
                title='Please enter the return date'
                value={returnDate}
                onChange={handleDateChange}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Return No</label>
            <div className="position-relative">
              <input type="text" className="form-control pe-5"
                name="purchasetype"
                id="returnnumber"
                placeholder=""
                required
                maxLength={50}
                value={returnnumber}
                title='Please enter the return no'
                onKeyPress={handleKeyViewPress}
                onChange={(e) =>setReturNumber(e.target.value)}
                autoComplete="off" />
              <a
                className=" position-absolute bg-none border-none p-2 ps-3 pe-3 top-50 end-0 translate-middle-y"
                style={{ zIndex: 2,cursor:'pointer' }}
                onClick={handleClickReturn}
                title='Purchase Return Help'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </a>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !returnperson ? 'text-danger' : ''}`}>Return Person <span className="text-danger">*</span></label>             <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                id='returnperson'
                placeholder=""
                required
                maxLength={50}
                value={returnperson}
                title='Please enter the return person'
                onChange={(e) => {
                  setReturPerson(e.target.value);
                }}
                autoComplete="off"
                ref={retperson}
                onKeyDown={(e) => handleKeyDown(e, returnReason, retperson)} />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !returnreason ? 'text-danger' : ''}`}>Return Reason <span className="text-danger">*</span></label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                name="returnreason"
                id="returnreason"
                placeholder=""
                pattern="[A-Za-z\s]*"
                maxLength={200}
                required
                value={returnreason}
                title='Please enter the return reason'
                onChange={(e) => {
                  setReturReason(e.target.value);
                }}
                autoComplete="off"
                ref={returnReason}
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !vendorcode ? 'text-danger' : ''}`}>Vendor Code <span className="text-danger">*</span></label>             <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                id='party_code'
                value={vendorcode}
                onChange={(e) => setvendor_code(e.target.value)}
                required
                title='Vendor code'
                autoComplete="off"
                readOnly />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">  Vendor Name</label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                id='party_name'
                value={vendor_name}
                onChange={(e) => setVendorName(e.target.value)}
                required
                title='Vendor name'
                autoComplete="off"
                readOnly />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">  Entry Date</label>
            <div className="position-relative">
              <input type="Date"
                className="form-control pe-5"
                id='entryDate'
                placeholder=""
                required
                title='Entry date'
                value={entryDate}
                onChange={handleEntryDateChange}
                autoComplete="off"
                readOnly />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Pay Type</label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                name="paytype"
                id="payType"
                required
                value={payType}
                title='Pay type'
                onChange={(e) => setPayType(e.target.value)}
                autoComplete="off"
                readOnly
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold"> Purchase Type</label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                name="purchasetype"
                id="purchasetype"
                placeholder=""
                required
                value={purchaseType}
                title='purchase type'
                onChange={(e) => setPurchaseType(e.target.value)}
                autoComplete="off"
                readOnly
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !transactionDate ? 'text-danger' : ''}`}>Transaction Date <span className="text-danger">*</span></label>             <div className="position-relative">
              <input type="date"
                className="form-control pe-5"
                id='transactiondate'
                class="exp-input-field form-control"
                placeholder=""
                required
                value={transactionDate}
                title='Transaction date'
                onChange={handletransactionDateChange}
                autoComplete="off"
                readOnly />
            </div>
          </div>
</div> </div>
          <div className="card shadow-lg border-0 p-3 rounded-5 mb-2" style={{ height: "auto" }}>
<div className='row'> 
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Total Purchase </label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                id="totalPurchaseAmount"
                placeholder=""
                required
                title='Total purchase'
                value={TotalPurchaseAmount}
                onChange={(e) => setTotalPurchaseAmount(e.target.value)}
                autoComplete="off"
                readOnly
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Total Tax</label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                name="totalTaxAmount"
                id="totalTaxAmount"
                placeholder=""
                required
                title='Total tax'
                value={TotalTaxAmount}
                onChange={(e) => setTotalTaxAmount(e.target.value)}
                autoComplete="off"
                readOnly />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Round Off</label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                name=""
                id="roundOff"
                placeholder=""
                required
                title='Round off'
                value={round_difference}
                onChange={(e) => setRoundDifference(e.target.value)}
                autoComplete="off"
                readOnly />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Total Bill Amount</label>
            <div className="position-relative">
              <input type="text"
                className="form-control pe-5"
                name=""
                id="totalBillAmount"
                placeholder=""
                required
                title='Total bill amount'
                value={TotalBillAmount}
                onChange={(e) => setTotalBillAmount(e.target.value)}
                autoComplete="off"
                readOnly />
            </div>
          </div>
        </div></div>
        <div className="card shadow-lg border-0 p-3 rounded-5 " style={{ height: "auto" }}>

        <div className='row ms-2'>
          <div className='d-flex justify-content-between'>
            <div className='d-flex justify-content-start'>
              <button title='Item Details' onClick={() => handleToggleTable('myTable')} className='col-md-8 salesbutton col-md-2' style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}> Item Details</button>
              <button title='Tax Details' onClick={() => handleToggleTable('tax')} className=' col-md-8 salesbutton col-md-2' style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", }}> Tax Details</button>
            </div>
          </div>
        </div>
        <div className="ag-theme-alpine " style={{ height: 330, width: '100%' }}>
          <AgGridReact
            columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
            rowData={activeTable === 'myTable' ? rowData : rowDataTax}
            defaultColDef={{ editable: true, resizable: true }}
            onRowClicked={handleRowClicked}
            onCellValueChanged={async (event) => {
              if (event.colDef.field === 'returnQty' || event.colDef.field === 'purchaseAmt') {
                await PurreturnItemAmountCalculation(event);
              }
              onCellValueChanged(event);
            }}
            pagination={true}
            paginationPageSize={5}
          />
        </div></div>
     
          <RetunrHelpPopup open={open} handleClose={handleClose} ReturnHelp={ReturnHelp} />
          <Purchasereturnpopup open={open1} handleClose={handleClose} Purreturnhelp={Purreturnhelp} />
        </div>
     

  );
};

export default PurchaseReturn;      