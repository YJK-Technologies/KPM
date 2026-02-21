// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './Home.js'
import Sidebar from './sidebar';
import Login from './Login.js';
import Signup from './Admin/Company.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from "react-secure-storage";

// Admin Components
import Company from './Admin/Company.js';
import CompanyMapping from './Admin/CompanyMapping.js';
import Location from './Admin/Locations.js';
import AddCompany from './Admin/AddScreens/AddCompany.js';
import AddCompanyMappings from './Admin/AddScreens/AddCompanyMappings.js';
import AddLocation from './Admin/AddScreens/AddLocation.js';
import AddRole from './Admin/AddScreens/AddRole.js';
import Role from './Admin/Role.js';
import AddRoleMapping from './Admin/AddScreens/AddRoleMapping.js';
import RoleMapping from './Admin/RoleMapping.js';
import RoleRights from './Admin/RoleRights.js';
import AddRoleRights from './Admin/AddScreens/AddRoleRights.js';
import User from './Admin/User.js';
import AddUser from './Admin/AddScreens/AddUser.js';

// Master Components
import AttributeDet from './Masters/AttributeDet.js';
import AddAttributeDet from './Masters/AddScreens/AddAttributeDet.js';
import Customer from './Masters/Customer.js';
import AddCustomerDet from './Masters/AddScreens/AddCustomerDet.js';
import Vendor from './Masters/Vendor.js';
import AddVendor from './Masters/AddScreens/AddVendorDet.js';
import Tax from './Masters/Tax.js';
import AddTax from './Masters/AddScreens/AddTaxDet.js';
import Warehouse from './Masters/warehouse.js';
import AddWarehouse from './Masters/AddScreens/AddWarehouse.js';
import Item from './Masters/Item.js';
import AddItem from './Masters/AddScreens/AddItem.js';
import NumberSeries from './Masters/NumberSeries.js';
import AddNumberSeries from './Masters/AddScreens/AddNumberSeries.js';

// Transaction & Reports
import OpeningItems from './Transactions/OpeningItems.js';
import Sales from './Transactions/Sales.js';
import Purchase from './Transactions/Purchase.js';
import SalesAnalysis from './Reports/SalesAnalysis.js';
import PurchaseAnalysis from './Reports/PurchaseAnalysis.js';
import ItemWiseStock from './Reports/ItemWiseStock.js';
import PurchaseReturn from './Transactions/PurchaseReturn.js';
import SalesReturn from './Transactions/SalesReturn.js';
import GSTReport from './Reports/GSTReport.js';
import OpeningItemAnalysis from './Reports/OpeningItemAnalysis.js';
import Dashboard from './Dashboard/Dashboard.js';
import ItemDashboard from './Dashboard/ItemDashboard/ItemDashboard.js'
import Topbar from './Topbar.js'
import Settings from './Settings/Settings.js'
import LOC from './ListOfCompanies.js'
import TSD from './Dashboard/Total_stock.js';
import CSD from './Dashboard/CurrentStock.js';
import PurchaseTemplate1 from './Transactions/Print/PurchaseTemplate1.js';
import PurchaseTemplate2 from './Transactions/Print/PurchaseTemplate2.js';
import PurchaseSetting from './Settings/PurchaseSetting.js';
import SalesSettings from './Settings/SalesSetting.js';
import LoadingScreen from './BookLoader.js';
import PurDashboardAnalysis from './Dashboard/PurchaseAnalysis.js';
import NotFound from './NotFound.js'
import PrintTemplate from './Masters/PrintTemplates.js';
import PdfPreviewHelp from './Masters/PdfPreviewHelp.js';
import SalesTemplate1 from './Transactions/Print/SalesTemplate1.js';
import SalesTemplate2 from './Transactions/Print/SalesTemplate2.js';
import Category from './Masters/Category.js';
import AddCategory from './Masters/AddScreens/AddCategory.js';

const AppRouter = () => {
  const [loading, setLoading] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [screenTypes, setScreenTypes] = useState(JSON.parse(sessionStorage.getItem("screenTypes")) || []);

  useEffect(() => {
    const loadPermissions = () => {
      const permissionsJSON = sessionStorage.getItem("permissions");
      if (permissionsJSON) {
        const permissions = JSON.parse(permissionsJSON);
        const screens = permissions.map((permission) =>
          permission.screen_type.replace(/\s+/g, "")
        );
        setScreenTypes(screens);
        sessionStorage.setItem("screenTypes", JSON.stringify(screens));
      }
    };

    loadPermissions();
    window.addEventListener("permissionsUpdated", loadPermissions);
    return () => window.removeEventListener("permissionsUpdated", loadPermissions);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="*"
          element={
            <Layout
              screenTypes={screenTypes}
              isSidebarMinimized={isSidebarMinimized}
              setIsSidebarMinimized={setIsSidebarMinimized}
            />
          }
        />
      </Routes>
    </Router>
  );
};

const Layout = ({ screenTypes, isSidebarMinimized, setIsSidebarMinimized }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const hideSidebarRoutes = ['/', '/login', '/signup', '/salestemplate1', '/salestemplate2', '/purchasetemplate1', '/purchasetemplate2'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname.toLowerCase());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // useEffect(() => {
  //   setLoading(true);
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        draggable
        closeButton
      />
      {!shouldHideSidebar && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '50px',
              backgroundColor: '#f8f9fa',
              zIndex: 1000,
              borderBottom: '1px solid #ddd'
            }}
          >
            <Topbar isMobile={isMobile} />
          </div>

          {!isMobile && (
            <div className='desktopbuttons'>
              <Sidebar
                isMinimized={isSidebarMinimized}
                setIsMinimized={setIsSidebarMinimized}
              />
            </div>
          )}
        </>
      )}

      <div
        className={`${isMobile ? 'mobile_buttons' : 'desktopbuttons'}`}
        style={{
          marginLeft: isMobile ? '0' : (shouldHideSidebar ? '0' : (isSidebarMinimized ? '90px' : '280px')),
          padding: '20px',
          transition: 'margin-left 0.3s',
          marginTop: '50px',
        }}
      >

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/ListOfCompanies" element={<LOC />} />
          <Route path="/PurchaseTemplate1" element={<PurchaseTemplate1 />} />
          <Route path="/PurchaseTemplate2" element={<PurchaseTemplate2 />} />
          <Route path="/SalesTemplate1" element={<SalesTemplate1 />} />
          <Route path="/SalesTemplate2" element={<SalesTemplate2 />} />


          {[
            { path: "/Company", element: <Company /> },
            { path: "/AddCompany", element: <AddCompany /> },
            { path: "/CompanyMapping", element: <CompanyMapping /> },
            { path: "/AddCompanyMapping", element: <AddCompanyMappings /> },
            { path: "/Location", element: <Location /> },
            { path: "/AddLocation", element: <AddLocation /> },
            { path: "/AddRole", element: <AddRole /> },
            { path: "/Role", element: <Role /> },
            { path: "/RoleMapping", element: <RoleMapping /> },
            { path: "/AddRoleMapping", element: <AddRoleMapping /> },
            { path: "/RoleRights", element: <RoleRights /> },
            { path: "/AddRoleRights", element: <AddRoleRights /> },
            { path: "/User", element: <User /> },
            { path: "/AddUser", element: <AddUser /> },
            { path: "/Attribute", element: <AttributeDet /> },
            { path: "/AddAttributeDet", element: <AddAttributeDet /> },
            { path: "/Customer", element: <Customer /> },
            { path: "/AddCustomerDet", element: <AddCustomerDet /> },
            { path: "/Vendor", element: <Vendor /> },
            { path: "/AddVendorDet", element: <AddVendor /> },
            { path: "/Tax", element: <Tax /> },
            { path: "/AddTaxDet", element: <AddTax /> },
            { path: "/Warehouse", element: <Warehouse /> },
            { path: "/AddWarehouse", element: <AddWarehouse /> },
            { path: "/Item", element: <Item /> },
            { path: "/AddItem", element: <AddItem /> },
            { path: "/NumberSeries", element: <NumberSeries /> },
            { path: "/AddNumberSeries", element: <AddNumberSeries /> },
            { path: "/OpeningItem", element: <OpeningItems /> },
            { path: "/Sales", element: <Sales /> },
            { path: "/Purchase", element: <Purchase /> },
            { path: "/SalesAnalysis", element: <SalesAnalysis /> },
            { path: "/PurchaseAnalysis", element: <PurchaseAnalysis /> },
            { path: "/ItemWiseStock", element: <ItemWiseStock /> },
            { path: "/PurchaseReturn", element: <PurchaseReturn /> },
            { path: "/SalesReturn", element: <SalesReturn /> },
            { path: "/GSTReport", element: <GSTReport /> },
            { path: "/OpenItemAnalysis", element: <OpeningItemAnalysis /> },
            { path: "/Dashboard", element: <Dashboard /> },
            { path: "/ItemDashboard", element: <ItemDashboard /> },
            { path: "/Settings", element: <Settings /> },
            { path: "/TotalStock", element: <TSD /> },
            { path: "/CurrentStock", element: <CSD /> },
            // { path: "/PurchaseTemplate1", element: <PurchaseTemplate1 /> },
            // { path: "/PurchaseTemplate2", element: <PurchaseTemplate2 /> },
            { path: "/PurchaseSetting", element: <PurchaseSetting /> },
            { path: "/SalesSettings", element: <SalesSettings /> },
            { path: "/PurDashboardAn", element: <PurDashboardAnalysis /> },
            { path: "/PrintTemplate", element: <PrintTemplate /> },
            { path: "/PdfPreviewHelp", element: <PdfPreviewHelp /> },
            { path: "/Category", element: <Category /> },
            { path: "/AddCategory", element: <AddCategory /> },
            // { path: "/SalesTemplate1", element: <SalesTemplate1 /> },
            // { path: "/SalesTemplate2", element: <SalesTemplate2 /> },
          ].map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={screenTypes.includes(path.replace('/', '')) ? element : <NotFound />}
            />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default AppRouter;
