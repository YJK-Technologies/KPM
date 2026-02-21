import { useEffect, useState } from 'react';
import { ToWords } from 'to-words';
import printDB from '../printDB';

const SalesTemplate = () => {
    const [headerData, setHeaderData] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [taxData, setTaxData] = useState(null);
    const toWords = new ToWords();

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
        return <div className="text-center mt-5">Loading...</div>;
    }

    const totalAmount = headerData[0].bill_amt;
    const totalAmountInWords = `${toWords.convert(totalAmount)} rupees only`;

    const total = parseFloat(headerData[0].bill_amt).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const tax = parseFloat(taxData[0].tax_amt).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const sales = parseFloat(headerData[0].sale_amt).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <div className="bg-white rounded-3 mx-auto mt-3" style={{ maxWidth: '600px' }}>
            <div className="border p-3">
                <div className="text-center mb-3">
                    <h4 className="fw-bold">{headerData[0].company_name}</h4>
                    <p className="text-center mb-1 small">{[headerData[0].address1, headerData[0].address2, headerData[0].address3]
                        .filter((addr) => addr)
                        .join(", ")},{headerData[0].city} - {headerData[0].pincode}</p>
                    <p className="text-center mb-2 small">Ph: {headerData[0].contact_no}</p>
                </div>
                <h5 className="text-center mb-4">Sales Invoice</h5>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <p className="mb-0"><strong>Party Code:</strong> {headerData[0].customer_code}</p>
                        <p className="mb-0"><strong>Party Name:</strong> {detailData[0].customer_name}</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <p className="mb-0"><strong>Transaction No:</strong> {headerData[0].bill_no}</p>
                        <p className="mb-0"><strong>Transaction Date:</strong> {new Date(headerData[0].bill_date).toLocaleDateString()}</p>
                        <p className="mb-0"><strong>Purchase Type:</strong> {headerData[0].sales_type}</p>
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
                                    <td>{row.item_name}</td>
                                    <td className="text-center">{row.weight}</td>
                                    <td className="text-center">{row.bill_qty}</td>
                                    <td className="text-center">{row.total_weight}</td>
                                    <td className="text-end">{row.item_amt}</td>
                                    <td className="text-end">{row.tax_amt}</td>
                                    <td className="text-end">{parseFloat(row.bill_rate).toFixed(2)}</td>
                                </tr>
                            ))}
                            <tr className="fw-bold">
                                <td colSpan="7" className="text-end">Total</td>
                                <td className="text-end">₹ {sales}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="row justify-content-end">
                    <div className="col-md-6">
                        <table className="table table-bordered table-sm">
                            <tbody>
                                <tr>
                                    <td>Sub Total</td>
                                    <td className="text-end">₹ {sales}</td>
                                </tr>
                                {taxData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.tax_name_details} {row.tax_per}%</td>
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
                                    <td className="text-end">₹ {headerData[0].roff_amt}</td>
                                </tr>
                                <tr className="fw-bold">
                                    <td>Total</td>
                                    <td className="text-end">₹ {total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-3">
                    <p className="fw-bold">Invoice Amount In Words: <span className="fst-italic">{totalAmountInWords}</span></p>
                </div>
            </div>
        </div>
    );
};

export default SalesTemplate;