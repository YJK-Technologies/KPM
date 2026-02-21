import { useEffect, useState } from 'react';
import { ToWords } from 'to-words';
import printDB from '../printDB';

const Receipt = () => {
  const toWords = new ToWords();
  const [headerData, setHeaderData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [taxData, setTaxData] = useState(null);

  useEffect(() => {
    const clearSpecificPrintData = async () => {
      const keysToDelete = ['SheaderData', 'SdetailData', 'StaxData'];
      await Promise.all(keysToDelete.map((key) => printDB.reportData.delete(key)));
      console.log('Specific print data cleared from IndexedDB');
    };

    window.addEventListener('beforeunload', clearSpecificPrintData);

    return () => window.removeEventListener('beforeunload', clearSpecificPrintData);
  }, []);

  useEffect(() => {
    const fetchDataFromIDB = async () => {
      const header = await printDB.reportData.get('SheaderData');
      const detail = await printDB.reportData.get('SdetailData');
      const tax = await printDB.reportData.get('StaxData');

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
    return <div>Loading...</div>;
  }

  const totalAmount = headerData[0].bill_amt;
  const totalAmountInWords = `${toWords.convert(totalAmount)} rupees only`;

  const total = parseFloat(headerData[0].bill_amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const tax = parseFloat(taxData[0].tax_amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sales = parseFloat(headerData[0].sale_amt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-3 mx-auto mt-3" style={{ maxWidth: '600px' }}>
      <div className="border p-3">
        <p className="mb-1 small">GSTIN : {headerData[0].company_gst_no}</p>
        <h5 className="text-center fw-bold mb-1">{headerData[0].company_name}</h5>
        <p className="text-center mb-1 small">{[headerData[0].address1, headerData[0].address2, headerData[0].address3]
          .filter((addr) => addr)
          .join(", ")},{headerData[0].city} - {headerData[0].pincode}</p>
        <p className="text-center mb-2 small">Ph: {headerData[0].contact_no}</p>

        <hr className="my-2" />
        <div className="d-flex justify-content-between small">
          <p className="mb-0"><strong>B.No:</strong> {headerData[0].bill_no}</p>
          <p className="mb-0"><strong>Payment Details:</strong> {headerData[0].pay_type}</p>
          <p className="mb-0"><strong>Date:</strong> {new Date(headerData[0].bill_date).toLocaleDateString()}</p>
        </div>

        <hr className="my-2" />
        <table className="table table-sm text-center mb-2 table-no-border">
          <thead className="table-light small">
            <tr>
              <th>No</th>
              <th>Item</th>
              <th>Rate</th>
              <th>Disc</th>
              <th>Qty</th>
              <th>Amt</th>
            </tr>
          </thead>
          <tbody className="small">
            {detailData.map((row, index) => (
              <tr key={index}>
                <td>{row.ItemSNo}</td>
                <td>{row.item_name}</td>
                <td>{row.item_amt}</td>
                <td>{row.discount_amount}</td>
                <td>{row.bill_qty}</td>
                <td style={{ textAlign: "right" }}>{parseFloat(row.bill_rate).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="fw-bold">
              <td colSpan="4" className="text-end">Total</td>
              {detailData.length > 0 && (
                <>
                  <td>{detailData[detailData.length - 1].total_bill_qty}</td>
                  <td style={{ textAlign: "right" }}>
                    {parseFloat(headerData[headerData.length - 1].sale_amt || 0).toFixed(2)}
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </table>

        <div className="row align-items-end mt-3">
          <div className="col-7">
            <table className="table-sm text-start w-100 border-none">
              <tbody className="small">
                {taxData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.hsn}</td>
                    <td>{row.tax_name_details}
                      {row.tax_per}%</td>
                    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.tax_amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-5 text-end small">
            <p className="mb-1 fw-bold"><strong>Round Off:</strong> ₹ {headerData[0].roff_amt}</p>
            {/* <h6 className="fw-bold">Net Amount: ₹ {parseFloat(headerData[headerData.length - 1].sale_amt || 0).toFixed(2)}</h6> */}
            <h6 className="fw-bold">Tax Amount: ₹ {parseFloat(headerData[headerData.length - 1].tax_amount || 0).toFixed(2)}</h6>
          </div>
        </div>

        <hr className="my-2" />
        <div className="small">
          <div className="d-flex justify-content-between mb-1">
            <span className="fw-bold">Total Amount:</span>
            <span className="fw-bold">{parseFloat(headerData[headerData.length - 1].bill_amt || 0).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="fw-bold">Discount:</span>
            <span className="fw-bold">{parseFloat(detailData[detailData.length - 1].total_discount_amount || 0).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="fw-bold">Net Amount:</span>
            <span className="fw-bold">{parseFloat(headerData[headerData.length - 1].sale_amt || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center mt-2 small">
          {headerData.map((row, index) => (
            <p key={index} className='mb-1'>
              {row.Terms_Conditions}
            </p>
          ))}
          <p className="fw-bold mb-0">Thank You. Visit Again.</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
