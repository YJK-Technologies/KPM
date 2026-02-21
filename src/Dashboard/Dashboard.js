// Dashboard.js
import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import './Dashboard.css';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import secureLocalStorage from "react-secure-storage"; 

const config = require('../ApiConfig');

export default function Dashboard() {
  const [salesChartType, setSalesChartType] = useState('bar');
  const [itemSalesChartType, setItemSalesChartType] = useState('bar');
  const [purchaseChartType, setPurchaseChartType] = useState('bar');
  const [currentStockChartType, setCurrentStockChartType] = useState('bar');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const [totalSales, setTotalSales] = useState('');
  const [totalPurchase, setTotalPurchase] = useState('');
  const [totalItem, setTotalItem] = useState('');
  const [totalCloseItem, setTotalCloseItem] = useState('');
  const [totalActiveItem, setTotalActiveItem] = useState('');
  const [stock, setStock] = useState('');

  const [salesCustomDateRange, setSalesCustomDateRange] = useState({ from: '', to: '' });
  const [purchaseCustomDateRange, setPurchaseCustomDateRange] = useState({ from: '', to: '' });
  const [itemWiseSalesCustomDateRange, setItemWiseSalesCustomDateRange] = useState({ from: '', to: '' });

  const [purchaseData, setPurchaseData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [itemWiseSalesData, setItemWiseSalesData] = useState([]);
  const [currentStockData, setCurrentStockData] = useState([]);
  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState('');
  const [selectedPurchasePeriod, setSelectedPurchasePeriod] = useState('');
  const [selectedItemWisePeriod, setSelectedItemWisePeriod] = useState('');
  const [purchasePeriod, setPurchasePeriod] = useState("");
  const [itemWisePeriod, setItemWisePeriod] = useState("");
  const [salesPeriod, setSalesPeriod] = useState("");
  const [perioddrop, setPerioddrop] = useState([]);
  const [itemperioddrop, setItemPerioddrop] = useState([]);
  const [formattedTotalSales, setFormattedTotalSales] = useState('0');
  const [formattedTotalPurchase, setFormattedTotalPurchase] = useState('0');
  const [formattedTotalStock, setFormattedTotalStock] = useState('0');
  const [sales, setSales] = useState(0);
  const [purchase, setPurchase] = useState(0);
  const [stockValue, setStockValue] = useState(0);

  useEffect(() => {
    // simulate API delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // adjust delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        setPerioddrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].Sno,
            label: val[0].DateRangeDescription,
          };
          setSelectedPurchasePeriod(firstOption);
          setSelectedSalesPeriod(firstOption);
          setPurchasePeriod(firstOption.value);
          setSalesPeriod(firstOption.value);
        }
      });
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        const filteredVal = val.filter(option => option.DateRangeDescription !== "Last Three Months" && option.DateRangeDescription !== "Current Month" && option.DateRangeDescription !== "Last Week");
        setItemPerioddrop(filteredVal);
        if (filteredVal.length > 0) {
          const firstOption = {
            value: filteredVal[0].Sno,
            label: filteredVal[0].DateRangeDescription,
          };
          setSelectedItemWisePeriod(firstOption);
          setItemWisePeriod(firstOption.value);
        }
      });
  }, []);

  const filteredOptionPeriod = perioddrop.map((option) => ({
    value: option.Sno,
    label: option.DateRangeDescription,
  }));
  const filteredOptionItemPeriod = itemperioddrop.map((option) => ({
    value: option.Sno,
    label: option.DateRangeDescription,
  }));

  const handleChangeSalesPeriod = (selectedPeriod) => {
    setSelectedSalesPeriod(selectedPeriod);
    setSalesPeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  const handleChangePurchasePeriod = (selectedPeriod) => {
    setSelectedPurchasePeriod(selectedPeriod);
    setPurchasePeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  const handleChangeItemWisePeriod = (selectedPeriod) => {
    setSelectedItemWisePeriod(selectedPeriod);
    setItemWisePeriod(selectedPeriod ? selectedPeriod.value : '');
  };

  useEffect(() => {
    const fetchDataAndAnimate = async () => {
      try {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");
        const response = await fetch(`${config.apiBaseUrl}/getAllDashboardData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code: companyCode }),
        });
        const data = await response.json();
        const [{ TotalSales, TotalPurchase }] = data;

        setTotalSales(TotalSales);
        setTotalPurchase(TotalPurchase);

        const duration = 2000;
        const stepTime = 10;
        const steps = duration / stepTime;
        const incrementSales = TotalSales / steps;
        const incrementPurchase = TotalPurchase / steps;

        let currentValueSales = 0;
        let currentValuePurchase = 0;

        const sales = setInterval(() => {
          currentValueSales += incrementSales;
          if (currentValueSales >= TotalSales) {
            clearInterval(sales);
            setSales(TotalSales);
          } else {
            setSales(Math.round(currentValueSales));
          }
        }, stepTime);

        const purchase = setInterval(() => {
          currentValuePurchase += incrementPurchase;
          if (currentValuePurchase >= TotalPurchase) {
            clearInterval(purchase);
            setPurchase(TotalPurchase);
          } else {
            setPurchase(Math.round(currentValuePurchase));
          }
        }, stepTime);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDataAndAnimate();
  }, []);

  useEffect(() => {
    setFormattedTotalSales(sales.toLocaleString('en-IN'));
  }, [sales]);

  useEffect(() => {
    setFormattedTotalPurchase(purchase.toLocaleString('en-IN'));
  }, [purchase]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");
        const response = await fetch(`${config.apiBaseUrl}/DashboardItemData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code: companyCode }),
        });
        const data = await response.json();
        const [{ totalItem, totalCloseItem, totalActiveItem }] = data;
        setTotalItem(totalItem);
        setTotalCloseItem(totalCloseItem);
        setTotalActiveItem(totalActiveItem);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");
        const response = await fetch(`${config.apiBaseUrl}/DashboardStockData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code: companyCode }),
        });
        const data = await response.json();
        const [{ overallStockValue }] = data;
        setStock(overallStockValue);

        const duration = 2000;
        const stepTime = 10;
        const steps = duration / stepTime;
        const incrementStock = overallStockValue / steps;

        let currentValue = 0;

        const stock = setInterval(() => {
          currentValue += incrementStock;
          if (currentValue >= overallStockValue) {
            clearInterval(stock);
            setStockValue(overallStockValue);
          } else {
            setStockValue(Math.round(currentValue));
          }
        }, stepTime);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFormattedTotalStock(stockValue.toLocaleString('en-IN'));
  }, [stockValue]);

  useEffect(() => {
    const fetchCurrentStockData = async () => {
      try {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");
        const response = await fetch(`${config.apiBaseUrl}/getCurrentStock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code: companyCode }),
        });
        if (response.ok) {
          const searchData = await response.json();
          const formattedData = searchData.map((item, index) => ({
            label: item.VariantGroup,
            value: item.TotalQty,
            color: COLORS[index % COLORS.length],
          }));
          setCurrentStockData(formattedData);
        } else if (response.status === 404) {
          console.log("Data Not Found");
          setCurrentStockData([]);
        } else {
          console.log("Bad request");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCurrentStockData([]);
      }
    };
    fetchCurrentStockData();
  }, []);

  const handleNavigateToItem = (e) => {
    navigate("/ItemDashboard");
    e.preventDefault();
  };

  const handleNavigateToSalesTrans = (e) => {
    navigate("/SalesAnalysis");
    e.preventDefault();
  };

  const handleNavigateToProductDash = (e) => {
    navigate("/PurDashboardAn");
    e.preventDefault();
  };

  const handleNavigateToTStockDash = (e) => {
    navigate("/TotalStock");
    e.preventDefault();
  };

  const handleNavigateToCurrentStock = (e) => {
    navigate("/CurrentStock");
    e.preventDefault();
  };

  const fetchPurchaseData = async () => {
    try {
      const body = {
        mode: purchasePeriod.toString(),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      };

      if (selectedPurchasePeriod.label === "Custom Date") {
        body.StartDate = purchaseCustomDateRange.from;
        body.EndDate = purchaseCustomDateRange.to;
      }

      const response = await fetch(`${config.apiBaseUrl}/getDashboardPurchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();
        const formattedData = searchData.map((item, index) => ({
          label: item.MonthYear,
          value: item.TotalPurchaseAmount,
          color: COLORS[index % COLORS.length],
        }));
        setPurchaseData(formattedData);
      } else if (response.status === 404) {
        console.log("Data Not Found");
        setPurchaseData([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      setPurchaseData([]);
    }
  };

  const fetchSalesData = async () => {
    try {
      const body = {
        mode: salesPeriod.toString(),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      };

      if (selectedSalesPeriod?.label === "Custom Date") {
        body.StartDate = salesCustomDateRange?.from;
        body.EndDate = salesCustomDateRange?.to;
      }

      const response = await fetch(`${config.apiBaseUrl}/getDashboardSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();
        const formattedData = searchData.map((item, index) => ({
          label: item.MonthYear,
          value: item.TotalSaleAmount,
          color: COLORS[index % COLORS.length],
        }));

        setSalesData(formattedData);
      } else if (response.status === 404) {
        console.log("Data Not Found");
        setSalesData([]);
      } else {
        console.log("Bad Request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      setSalesData([]);
    }
  };

  const fetchItemWiseSalesData = async () => {
    try {
      const body = {
        mode: itemWisePeriod.toString(),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      };

      if (selectedItemWisePeriod.label === "Custom Date") {
        body.StartDate = itemWiseSalesCustomDateRange.from;
        body.EndDate = itemWiseSalesCustomDateRange.to;
      }

      const response = await fetch(`${config.apiBaseUrl}/getDashboardItemSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();
        const formattedData = searchData.map((item, index) => ({
          label: item.item_code,
          value: item.OverallTotalSales,
          color: COLORS[index % COLORS.length],
        }));
        setItemWiseSalesData(formattedData);
      } else if (response.status === 404) {
        console.log("Data Not Found");
        setItemWiseSalesData([]);
      } else {
        console.log("Bad Request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      setItemWiseSalesData([]);
    }
  };

  useEffect(() => {
    if (!purchasePeriod) return;

    if (selectedPurchasePeriod?.label === "Custom Date") {
      if (purchaseCustomDateRange?.from && purchaseCustomDateRange?.to) {
        fetchPurchaseData();
      }
    } else {
      fetchPurchaseData();
    }
  }, [purchaseCustomDateRange, purchasePeriod]);

  useEffect(() => {
    if (!salesPeriod) return;
    if (selectedSalesPeriod?.label === "Custom Date") {
      if (salesCustomDateRange?.from && salesCustomDateRange?.to) {
        fetchSalesData();
      }
    } else {
      fetchSalesData();
    }
  }, [salesCustomDateRange, salesPeriod]);

  useEffect(() => {
    if (!itemWisePeriod) return;
    if (selectedItemWisePeriod?.label === "Custom Date") {
      if (itemWiseSalesCustomDateRange?.from && itemWiseSalesCustomDateRange?.to) {
        fetchItemWiseSalesData();
      }
    } else {
      fetchItemWiseSalesData();
    }
  }, [itemWisePeriod, itemWiseSalesCustomDateRange]);

  const handleSalesCustomDateChange = (e) => {
    const { name, value } = e.target;
    setSalesCustomDateRange((prevRange) => ({
      ...prevRange,
      [name]: value
    }));
  };
  const handlePurchaseCustomDateChange = (e) => {
    const { name, value } = e.target;
    setPurchaseCustomDateRange((prevRange) => ({
      ...prevRange,
      [name]: value
    }));
  };

  const handleItemSalesCustomDateChange = (e) => {
    const { name, value } = e.target;
    setItemWiseSalesCustomDateRange((prevRange) => ({
      ...prevRange,
      [name]: value
    }));
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const data = [
    { month: 'Dec', marketing: 50, cases: 25 },
    { month: 'Jan', marketing: 40, cases: 30 },
    { month: 'Feb', marketing: 30, cases: 45 },
    { month: 'Mar', marketing: 45, cases: 40 },
    { month: 'Apr', marketing: 75.04587, cases: 52.5487 },
    { month: 'May', marketing: 50, cases: 45 },
    { month: 'Jun', marketing: 30, cases: 60 },
  ];

  const salesCharts = () => {
    switch (salesChartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="Total Sales"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="value" name="Total Sales">
                {salesData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
              <Legend />
              <Pie
                data={salesData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label
              >
                {salesData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const purchaseCharts = () => {
    switch (purchaseChartType) {
      case "line":
        return (
          <LineChart width={600} height={300} data={purchaseData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Total Purchase"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart width={600} height={300} data={purchaseData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="value" name="Total Purchase">
              {purchaseData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        );
      case "pie":
        return (
          <PieChart width={400} height={300}>
            <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
            <Legend />
            <Pie
              data={purchaseData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {purchaseData.map((entry, index) => (
               <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  const itemSalesCharts = () => {
    switch (itemSalesChartType) {
      case "line":
        return (
          <LineChart width={600} height={300} data={itemWiseSalesData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(2)} Qty`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Item Sales"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart width={600} height={300} data={itemWiseSalesData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(2)} Qty`} />
            <Legend />
            <Bar dataKey="value" name="Item Sales">
              {itemWiseSalesData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        );
      case "pie":
        return (
          <PieChart width={400} height={300}>
            <Tooltip formatter={(value) => `${value.toFixed(2)} Qty`} />
            <Legend />
            <Pie
              data={itemWiseSalesData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {itemWiseSalesData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  const currentStockCharts = () => {
    switch (currentStockChartType) {
      case "line":
        return (
          <LineChart width={600} height={300} data={currentStockData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(2)} Qty`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Item Varient"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart width={600} height={300} data={currentStockData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(2)} Qty`} />
            <Legend />
            <Bar dataKey="value" name="Item Varient">
            {currentStockData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))} 
            </Bar>
          </BarChart>
        );
      case "pie":
        return (
          <PieChart width={400} height={300}>
            <Tooltip formatter={(value) => `${value.toFixed(2)} Qty`} />
            <Legend />
            <Pie
              data={currentStockData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {currentStockData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CF6",
    "#FF6384", "#36A2EB", "#FFCE56", "#B9FBC0", "#FDE4CF",
  ];

  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      dateJoined: "2025-04-01",
      status: "Active",
      imageUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      dateJoined: "2025-04-05",
      status: "Pending",
      imageUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=random"
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert@example.com",
      dateJoined: "2025-04-07",
      status: "Active",
      imageUrl: "https://ui-avatars.com/api/?name=Robert+Johnson&background=random"
    },
    {
      id: 4,
      name: "Emily Clark",
      email: "emily@example.com",
      dateJoined: "2025-04-10",
      status: "Inactive",
      imageUrl: "https://ui-avatars.com/api/?name=Emily+Clark&background=random"
    },
    {
      id: 4,
      name: "Emily Clark",
      email: "emily@example.com",
      dateJoined: "2025-04-10",
      status: "Inactive",
      imageUrl: "https://ui-avatars.com/api/?name=Emily+Clark&background=random"
    }
    ,
    {
      id: 4,
      name: "Emily Clark",
      email: "emily@example.com",
      dateJoined: "2025-04-10",
      status: "Inactive",
      imageUrl: "https://ui-avatars.com/api/?name=Emily+Clark&background=random"
    },
    {
      id: 4,
      name: "Emily Clark",
      email: "emily@example.com",
      dateJoined: "2025-04-10",
      status: "Inactive",
      imageUrl: "https://ui-avatars.com/api/?name=Emily+Clark&background=random"
    }
  ];

  const chartOptions = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
    { value: "pie", label: "Pie" },
  ];

  return (
    <div className="container-fluid mt-2">
      <div className="row col-md-12">
        {isLoading ? (
          <>
            <div className="col-md-3 mb-3 rounded-5"><Skeleton height={100} /></div>
            <div className="col-md-3 mb-3 rounded-5"><Skeleton height={100} /></div>
            <div className="col-md-3 mb-3 rounded-5"><Skeleton height={100} /></div>
            <div className="col-md-3 mb-3 rounded-5"><Skeleton height={100} /></div>
          </>
        ) : (
          <>
            <div className="col-md-3 mb-3" style={{ cursor: "pointer" }} onClick={handleNavigateToSalesTrans}>
              <div className="stat-card gradient-blue">
                <div>
                  <p className="stat-label">TOTAL SALES</p>
                  <h4 className="stat-value">₹ {formattedTotalSales}</h4>
                </div>
                <div className='stat-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" class="bi bi-bar-chart-line" viewBox="0 0 16 16">
                    <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1zm1 12h2V2h-2zm-3 0V7H7v7zm-5 0v-3H2v3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3" style={{ cursor: "pointer" }} onClick={handleNavigateToProductDash}>
              <div className="stat-card gradient-indigo">
                <div>
                  <p className="stat-label">TOTAL PURCHASE</p>
                  <h4 className="stat-value">₹ {formattedTotalPurchase}</h4>
                </div>
                <div className='stat-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" class="bi bi-cart4" viewBox="0 0 16 16">
                    <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3" style={{ cursor: "pointer" }} onClick={handleNavigateToItem}>
              <div className="stat-card gradient-indigo">
                <div>
                  <p className="stat-label">TOTAL ITEMS</p>
                  <h4 className="stat-value">{totalActiveItem}/{totalItem}</h4>
                </div>
                <div className='stat-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" class="bi bi-boxes" viewBox="0 0 16 16">
                    <path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3" style={{ cursor: "pointer" }} onClick={handleNavigateToTStockDash}>
              <div className="stat-card gradient-indigo">
                <div>
                  <p className="stat-label">TOTAL STOCK VALUES</p>
                  <h4 className="stat-value">₹ {formattedTotalStock}</h4>
                </div>
                <div className='stat-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" class="bi bi-box-seam-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className='col-md-12'>
        <div className='row'>
        <div className='col-12 col-md-6 mb-2'>
  <div className="bg-white shadow-lg rounded-5 p-4">
    <div className="flex flex-wrap justify-between items-center mb-4">
      <div className='w-100 d-flex flex-wrap justify-content-between mb-3'>
        <h4 className="text-lg font-semibold mb-2">Sales Statistics</h4>
        <div className='d-flex flex-column flex-md-row w-100 gap-2 d-flex justify-content-end'>
          <Select
            id="wcode"
            value={selectedSalesPeriod}
            onChange={handleChangeSalesPeriod}
            options={filteredOptionPeriod}
            className="me-md-3 w-100"
            placeholder=""
            required
            title="Please select an item code"
            maxLength={18}
          />
          <Select
            value={chartOptions.find(option => option.value === salesChartType)}
            onChange={(selectedOption) => setSalesChartType(selectedOption.value)}
            options={chartOptions}
            className="w-100"
          />
        </div>
      </div>

      {selectedSalesPeriod.label === "Custom Date" && (
        <div className='row d-flex justify-content-center mb-3 mt-2 w-100'>
          <div className='col-3 col-md-1'>
            <label className="fw-bold">From</label>
          </div>
          <div className='col-9 col-md-5 mb-2 mb-md-0'>
            <input
              type="date"
              className="form-control"
              name="from"
              value={salesCustomDateRange.from}
              onChange={handleSalesCustomDateChange}
            />
          </div>
          <div className='col-3 col-md-1'>
            <label className="fw-bold">To</label>
          </div>
          <div className='col-9 col-md-5'>
            <input
              type="date"
              className="form-control"
              name="to"
              value={salesCustomDateRange.to}
              onChange={handleSalesCustomDateChange}
            />
          </div>
        </div>
      )}
    </div>
    
    <ResponsiveContainer width="100%" height={300}>
      {isLoading ? <Skeleton height={300} /> : salesCharts()}
    </ResponsiveContainer>
  </div>
</div>
<div className='col-12 col-md-6'>
  <div className="bg-white shadow-lg rounded-5 p-4">
    <div className="flex flex-wrap justify-between items-center mb-4">
      <div className='w-100 d-flex flex-wrap justify-content-between mb-3'>
        <h4 className="text-lg font-semibold mb-2">Purchase Statistics</h4>
        <div className='d-flex flex-column flex-md-row w-100 gap-2'>
          <Select
            id="wcode"
            value={selectedPurchasePeriod}
            onChange={handleChangePurchasePeriod}
            options={filteredOptionPeriod}
            className="me-md-3 w-100"
            placeholder=""
            required
            title="Please select an item code"
            maxLength={18}
          />
          <Select
            value={chartOptions.find(option => option.value === purchaseChartType)}
            onChange={(selectedOption) => setPurchaseChartType(selectedOption.value)}
            options={chartOptions}
            className="w-100"
          />
        </div>
      </div>

      {selectedPurchasePeriod.label === "Custom Date" && (
        <div className='row d-flex justify-content-center mb-3 mt-2 w-100'>
          <div className='col-3 col-md-1'>
            <label className="fw-bold">From</label>
          </div>
          <div className='col-9 col-md-5 mb-2 mb-md-0'>
            <input
              type="date"
              className="form-control"
              name="from"
              value={purchaseCustomDateRange.from}
              onChange={handlePurchaseCustomDateChange}
            />
          </div>
          <div className='col-3 col-md-1'>
            <label className="fw-bold">To</label>
          </div>
          <div className='col-9 col-md-5'>
            <input
              type="date"
              className="form-control"
              name="to"
              value={purchaseCustomDateRange.to}
              onChange={handlePurchaseCustomDateChange}
            />
          </div>
        </div>
      )}
    </div>

    <ResponsiveContainer width="100%" height={300}>
      {isLoading ? <Skeleton height={300} /> : purchaseCharts()}
    </ResponsiveContainer>
  </div>
</div>

     
<div className="col-12 col-md-6 mt-2">
  <div className="bg-white shadow-lg rounded-5 p-4 h-100">
    <div className="flex flex-wrap justify-between items-center mb-4">
      <div className="w-100 d-flex flex-wrap justify-content-between gap-3">
        <h4 
          className="text-lg font-semibold cursor-pointer"
          onClick={handleNavigateToCurrentStock}
        >
          Current Stocks Statistics
        </h4>
        <div className="d-flex flex-column flex-md-row w-100 gap-2">
          <Select
            value={chartOptions.find(option => option.value === currentStockChartType)}
            onChange={(selectedOption) => setCurrentStockChartType(selectedOption.value)}
            options={chartOptions}
            className="w-100 w-md-auto"
          />
        </div>
      </div>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      {isLoading ? <Skeleton height={300} /> : currentStockCharts()}
    </ResponsiveContainer>
  </div>
</div>

<div className="col-12 col-md-6 mt-2">
  <div className="bg-white shadow-lg rounded-5 p-4 h-100">
    <div className="flex flex-wrap justify-between items-center mb-4 w-100">
      <div className="w-100 d-flex flex-wrap justify-content-between gap-3 mb-3">
        <h4 className="text-lg font-semibold">Total Items Statistics</h4>
        <div className="d-flex flex-column flex-md-row w-100 gap-2">
          <Select
            id="wcode"
            value={selectedItemWisePeriod}
            onChange={handleChangeItemWisePeriod}
            options={filteredOptionItemPeriod}
            className="w-100 w-md-auto"
            placeholder=""
            required
            title="Please select an item code"
            maxLength={18}
          />
          <Select
            value={chartOptions.find(option => option.value === itemSalesChartType)}
            onChange={(selectedOption) => setItemSalesChartType(selectedOption.value)}
            options={chartOptions}
            className="w-100 w-md-auto"
          />
        </div>
      </div>

      {selectedItemWisePeriod.label === "Custom Date" && (
        <div className="row d-flex justify-content-center mb-3 mt-2 w-100">
          <div className="col-3 col-md-1">
            <label className="fw-bold">From</label>
          </div>
          <div className="col-9 col-md-5">
            <input
              type="date"
              className="form-control"
              name="from"
              value={itemWiseSalesCustomDateRange.from}
              onChange={handleItemSalesCustomDateChange}
            />
          </div>
          <div className="col-3 col-md-1 mt-2 mt-md-0">
            <label className="fw-bold">To</label>
          </div>
          <div className="col-9 col-md-5">
            <input
              type="date"
              className="form-control"
              name="to"
              value={itemWiseSalesCustomDateRange.to}
              onChange={handleItemSalesCustomDateChange}
            />
          </div>
        </div>
      )}
    </div>

    <ResponsiveContainer width="100%" height={300}>
      {isLoading ? <Skeleton height={300} /> : itemSalesCharts()}
    </ResponsiveContainer>
  </div>
</div>

          <div className='col-md-4'>
            {/* <div className="bg-white shadow-lg rounded-5 p-4 h-100">
    <h4 className="text-lg font-semibold">New Customers</h4>
    <div className="overflow-hidden" style={{ maxHeight: '400px'}}>
      <table className="table table-sm table-borderless w-100">
        <tbody className="overflow-auto" style={{ maxHeight: '300px', display: 'block', overflowY: 'auto', Width:"1000px" }}>
          {
          isLoading
            ? Array(5).fill().map((_, i) => (
                <tr key={i}>
                  <td><Skeleton height={40} width={200} /></td>
                  <td><Skeleton height={30} width={100} /></td>
                </tr>
              ))
            : customers.map((cust) => (
            <tr key={cust.id}>
              <td className="py-2 px-5">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={cust.imageUrl || '/default-avatar.png'} // fallback image
                    alt={cust.name}
                    className="rounded-5 me-3 object-cover"
                    style={{ width: '40px', height: '40px' }}
                  />
                  <span className="font-weight-bold">{cust.name}</span>
                </div>
              </td>
              <td className="py-2 px-4">
                <span
                  className={`badge ${statusColor[cust.status]}`}
                >
                  {cust.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div> */}
          </div>
        </div>
        {/* <div className='row'>
    <div className='container mt-4'>
  <div className='row'>
    <div className='col-md-4'>
      <div className="card shadow-lg rounded-5 p-4">
        <h4 className="h5 font-weight-semibold">Popular Products</h4>
        <div className="overflow-auto">
          <table className="table table-sm table-bordered">
            <thead className="thead-light">
              <tr>
                <th className="py-2 px-4">Product</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td className="py-2 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={prod.imageUrl || '/default-product.png'}
                        alt={prod.name}
                        className="w-8 h-8 rounded-circle"
                      />
                      <span className="font-weight-bold">{prod.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`badge ${productStatusColor[prod.status]}`}
                    >
                      {prod.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div> */}
      </div>
    </div>
  );
}
