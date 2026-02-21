import { useState, useEffect } from 'react';
import { ToWords } from 'to-words';
import secureLocalStorage from "react-secure-storage";
import printDB from '../printDB';

const Template = () => {
  const [headerData, setHeaderData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const toWords = new ToWords();

  useEffect(() => {
    const clearSpecificPrintData = async () => {
      const keysToDelete = ['PheaderData', 'PdetailData', 'PtaxData'];
      await Promise.all(keysToDelete.map((key) => printDB.reportData.delete(key)));
      console.log('Specific print data cleared from IndexedDB');
    };

    window.addEventListener('beforeunload', clearSpecificPrintData);

    return () => window.removeEventListener('beforeunload', clearSpecificPrintData);
  }, []);

  useEffect(() => {
    const fetchDataFromIDB = async () => {
      const header = await printDB.reportData.get('PheaderData');
      const detail = await printDB.reportData.get('PdetailData');
      const tax = await printDB.reportData.get('PtaxData');

      if (header && detail && tax) {
        setHeaderData(header.value);
        setDetailData(detail.value);
        setTaxData(tax.value);
      } else {
        console.error('Data not found in IndexedDB');
      }
    };

    fetchDataFromIDB();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const isPrintMode = query.get("Print") === "true";

    if (isPrintMode) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  if (!headerData || !detailData || !taxData) {
    return <div className="text-center">Loading...</div>;
  }

  const totalAmount = headerData[0].total_amount;
  const totalAmountInWords = `${toWords.convert(totalAmount)} rupees only`;

  const total = parseFloat(headerData[0].total_amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const tax = parseFloat(taxData[0].tax_amt).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const purchase = parseFloat(headerData[0].purchase_amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-white rounded-3 mx-auto mt-3" style={{ maxWidth: '700px' }}>
      <div className="border p-3">
        <div className="text-center mb-3">
          <h2>{headerData[0].company_name}</h2>
          <p className="text-center mb-1 small">{[headerData[0].address1, headerData[0].address2, headerData[0].address3]
            .filter((addr) => addr)
            .join(", ")},{headerData[0].city} - {headerData[0].pincode}</p>
          <p className="text-center mb-2 small">Ph: {headerData[0].contact_no}</p>
        </div>
        <h3 className="text-center mb-3">Purchase</h3>
        <div className="row mb-4">
          <div className="col-md-6">
            <p className="mb-0"><strong>Party Code:</strong> {headerData[0].vendor_code}</p>
            <p className="mb-0"><strong>Party Name:</strong> {detailData[0].vendor_name}</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0"><strong>Transaction No:</strong> {headerData[0].transaction_no}</p>
            <p className="mb-0"><strong>Transaction Date:</strong> {new Date(headerData[0].transaction_date).toLocaleDateString()}</p>
            <p className="mb-0"><strong>Purchase Type:</strong> {headerData[0].purchase_type}</p>
            <p className="mb-0"><strong>Pay Type:</strong> {headerData[0].pay_type}</p>
          </div>
        </div>
        <div className="table-responsive mb-2">
          <table className="table table-bordered table-sm">
            <thead className="table-light text-center">
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Unit Weight</th>
                <th>Qty</th>
                <th>Total Weight</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {detailData.map((row, index) => (
                <tr key={index}>
                  <td className="text-center">{row.ItemSNo}</td>
                  <td className="text-center">{row.item_name}</td>
                  <td className="text-center">{row.weight}</td>
                  <td className="text-center">{row.bill_qty}</td>
                  <td className="text-center">{row.total_weight}</td>
                  <td className="text-end">{row.item_amt}</td>
                  <td className="text-end">{row.tax_amount}</td>
                  <td className="text-end">{parseFloat(row.bill_rate).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td colSpan="7" className="text-end fw-bold">Total</td>
                <td className="text-end">&#8377; {parseFloat(detailData[detailData.length - 1].bill_rate || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="row justify-content-end">
          <div className="col-md-6">
            <table className="table table-bordered table-sm">
              <tbody>
                <tr>
                  <td><strong>Sub Total</strong></td>
                  <td className="text-end">&#8377; {purchase}</td>
                </tr>
                {taxData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.tax_name_details}%</td>
                    <td className="text-end">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(row.tax_amt)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>Round Off</td>
                  <td className="text-end">&#8377; {headerData[0].rounded_off}</td>
                </tr>
                <tr>
                  <td><strong>Total</strong></td>
                  <td className="text-end">&#8377; {total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <p className="fw-bold"><strong>Invoice Amount In Words:</strong> {totalAmountInWords}</p>
        </div>
      </div>
    </div>
  );
};

export default Template;