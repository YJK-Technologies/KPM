import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFolder, FaChevronDown, FaChevronUp, FaUserCog, FaCogs,
  FaBars, FaArrowLeft, FaChartBar, FaFileAlt, FaBuilding, FaSitemap, FaUndo,
  FaMapMarkerAlt, FaUserTag, FaProjectDiagram, FaLockOpen, FaUserAlt, FaListAlt,
  FaUserFriends, FaTruck, FaPercentage, FaWarehouse, FaCubes, FaHashtag, FaPrint,
  FaDoorOpen, FaCashRegister, FaShoppingCart, FaUndoAlt, FaChartLine, FaChartPie,
  FaBoxes, FaFileInvoiceDollar,FaTags , FaSearchDollar, FaTachometerAlt
} from 'react-icons/fa';
import secureLocalStorage from "react-secure-storage";

const Sidebar = ({ isMinimized, setIsMinimized }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isTransOpen, setIsTransOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const toggleSidebar = () => setIsMinimized(!isMinimized);

  // Save to localStorage on change

  // 👇 Permission-based logic
  const permissionsJSON = sessionStorage.getItem("permissions");
  const permissions = permissionsJSON ? JSON.parse(permissionsJSON) : [];
  const screenType = Array.isArray(permissions)
    ? permissions.map(p => p.screen_type?.replace(/\s+/g, ''))
    : [];

  // Helper function to check access
  const hasAccess = (screen) => screenType.includes(screen.replace(/\s+/g, ''));



  return (
    <div style={isMinimized ? styles.sidebarMinimized : styles.sidebar}>
      <div style={styles.toggleButtonContainer}>
        <button onClick={toggleSidebar} style={styles.toggleButton}>
          {isMinimized ? <FaBars /> : <FaArrowLeft />}
        </button>
      </div>

      <div style={styles.sidebarContent}>

        {hasAccess("Dashboard") && (
          <ul style={styles.sidebarList}>
            <li style={styles.listItem}>
              <Link to="/Dashboard" title="Dashboard" style={isMinimized ? styles.linkMinimized : styles.link}>
                <FaTachometerAlt style={styles.icon} /> {!isMinimized && 'Dashboard'}
              </Link>
            </li>
          </ul>
        )}

        <SidebarSection
          isMinimized={isMinimized}
          isOpen={isAdminOpen}
          toggleOpen={() => setIsAdminOpen(!isAdminOpen)}
          title="Admin"
          links={[
            { to: '/Company', label: 'Company', screen: 'Company', icon: <FaBuilding title="Company" /> },
            { to: '/CompanyMapping', label: 'Company Mapping', screen: 'CompanyMapping', icon: <FaSitemap title="Company Mapping" /> },
            { to: '/Location', label: 'Location', screen: 'Location', icon: <FaMapMarkerAlt title="Location" /> },
            { to: '/Role', label: 'Role', screen: 'Role', icon: <FaUserTag title="Role" /> },
            { to: '/RoleMapping', label: 'Role Mapping', screen: 'RoleMapping', icon: <FaProjectDiagram title="Role Mapping" /> },
            { to: '/RoleRights', label: 'Role Rights', screen: 'RoleRights', icon: <FaLockOpen title="Role Rights" /> },
            { to: '/User', label: 'User', screen: 'User', icon: <FaUserAlt title="User" /> },
          ].filter(item => hasAccess(item.screen))}
        />

        <SidebarSection
          isMinimized={isMinimized}
          isOpen={isMasterOpen}
          toggleOpen={() => setIsMasterOpen(!isMasterOpen)}
          title="Masters"
          links={[
            { to: '/Attribute', label: 'Attribute', screen: 'AddAttributeDet', icon: <FaListAlt title="Attribute" /> },
            { to: '/Customer', label: 'Customer', screen: 'Customer', icon: <FaUserFriends title="Customer" /> },
            { to: '/Vendor', label: 'Vendor', screen: 'Vendor', icon: <FaTruck title="Vendor" /> },
            { to: '/Tax', label: 'Tax', screen: 'Tax', icon: <FaPercentage title="Tax" /> },
            { to: '/Warehouse', label: 'Warehouse', screen: 'Warehouse', icon: <FaWarehouse title="Warehouse" /> },
            { to: '/Item', label: 'Item', screen: 'Item', icon: <FaCubes title="Item" /> },
            { to: '/Category', label: 'Category', screen: 'Category', icon: <FaTags title="Category" /> },
            { to: '/NumberSeries', label: 'Number Series', screen: 'NumberSeries', icon: <FaHashtag title="Number Series" /> },
            { to: '/PrintTemplate', label: 'Print Templates', screen: 'PrintTemplate', icon: <FaPrint title="Print Templates" /> }
          ].filter(item => hasAccess(item.screen))}
        />

        <SidebarSection
          isMinimized={isMinimized}
          isOpen={isTransOpen}
          toggleOpen={() => setIsTransOpen(!isTransOpen)}
          title="Transactions"
          links={[
            { to: '/OpeningItem', label: 'Opening Item', screen: 'OpeningItem', icon: <FaDoorOpen title="Opening Item" /> },
            { to: '/Purchase', label: 'Purchase', screen: 'Purchase', icon: <FaShoppingCart title="Purchase" /> },
            { to: '/PurchaseReturn', label: 'Purchase Return', screen: 'PurchaseReturn', icon: <FaUndo title="Purchase Return" /> },
            { to: '/Sales', label: 'Sales', screen: 'Sales', icon: <FaCashRegister title="Sales" /> },
            { to: '/SalesReturn', label: 'Sales Return', screen: 'SalesReturn', icon: <FaUndoAlt title="Sales Return" /> },
          ].filter(item => hasAccess(item.screen))}
        />

        <SidebarSection
          isMinimized={isMinimized}
          isOpen={isReportOpen}
          toggleOpen={() => setIsReportOpen(!isReportOpen)}
          title="Reports"
          links={[
            { to: '/SalesAnalysis', label: 'Sales Analysis', screen: 'SalesAnalysis', icon: <FaChartLine title="Sales Analysis" /> },
            { to: '/PurchaseAnalysis', label: 'Purchase Analysis', screen: 'PurchaseAnalysis', icon: <FaChartPie title="Purchase Analysis" /> },
            { to: '/ItemWiseStock', label: 'Item Wise Stock', screen: 'ItemWiseStock', icon: <FaBoxes title="Item Wise Stock" /> },
            { to: '/GSTReport', label: 'GST Report', screen: 'GSTReport', icon: <FaFileInvoiceDollar title="GST Report" /> },
            { to: '/OpenItemAnalysis', label: 'Open Item Analysis', screen: 'OpenItemAnalysis', icon: <FaSearchDollar title="Open Item Analysis" /> },
          ].filter(item => hasAccess(item.screen))}
        />
      </div>

      <div style={styles.footer}>
        {!isMinimized ? (
          <>
            <div style={styles.footerText}>YJK TECHNOLOGIES</div>
            <div style={styles.footerVersion}>Version 0.0.1</div>
          </>
        ) : (
          <div style={styles.footerMinimized}>YJK</div>
        )}
      </div>

    </div>
  );
};

const getIconByTitle = (title) => {
  switch (title) {
    case 'Admin':
      return <FaUserCog style={styles.icon} title='Admin'/>;
    case 'Masters':
      return <FaCogs style={styles.icon} title='Masters'/>;
    case 'Transactions':
      return <FaFileAlt style={styles.icon} title='Transactions'/>;
    case 'Reports':
      return <FaChartBar style={styles.icon} title='Reports'/>;
    default:
      return <FaFolder style={styles.icon} />;
  }
};

const SidebarSection = ({ title, links, isMinimized, isOpen, toggleOpen }) => {
  if (!links.length) return null;

  return (
    <ul style={styles.sidebarList}>
      <li style={styles.listItem}>
        <div onClick={toggleOpen} style={isMinimized ? styles.linkMinimized : styles.link}>
          {getIconByTitle(title)}
          {!isMinimized && (
            <>
              {title}
              {isOpen ? <FaChevronUp style={styles.chevron} /> : <FaChevronDown style={styles.chevron} />}
            </>
          )}
        </div>

        {isMinimized && isOpen && (
          <ul style={styles.minimizedIconList}>
            {links.map(({ to, icon }) => (
              <li key={to} style={styles.minimizedIconItem}>
                <Link to={to} style={styles.linkMinimized}>
                  {icon && <span style={styles.icon}>{icon}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!isMinimized && isOpen && (
          <ul style={styles.nestedList}>
            {links.map(({ to, label, icon }) => (
              <li key={to} style={styles.listItem}>
                <Link to={to} style={styles.link}>
                  {icon && <span style={styles.icon}>{icon}</span>}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    height: '95vh',
    backgroundColor: '#d83500',
    color: 'white',
    position: 'fixed',
    borderRadius: '30px',
    padding: '10px',
    margin: '10px',
    fontFamily: 'Arial, sans-serif',
    transition: 'width 0.3s ease',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    scrollbarWidth: 'thin',
  },
  sidebarContent: {
    flex: 1,
    overflowY: 'auto',
  },
  sidebarMinimized: {
    width: '100px',
    height: '95vh',
    backgroundColor: '#d83500',
    color: 'white',
    position: 'fixed',
    borderRadius: '30px',
    margin: '10px',
    fontFamily: 'Arial, sans-serif',
    transition: 'width 0.3s ease',
    overflowY: 'auto',
    pointerEvents: 'auto',
    listStyleType: 'none',
    scrollbarWidth: 'thin',
    scrollbarColor: '#666',
    display: 'flex',
    flexDirection: 'column',
  },
  toggleButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px',
  },
  toggleButton: {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: "30px",
    padding: "5px",
    position: "fixed",
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: '1000',
  },
  logoContainer: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  sidebarList: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    marginBottom: '10px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 12px',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'background 0.3s',
  },
  linkMinimized: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50px',
    cursor: 'pointer',
    width: '50px',
    margin: '0 auto',
    color: 'white',
    textDecoration: 'none',
  },
  nestedList: {
    listStyleType: 'none',
    paddingLeft: '20px',
  },
  icon: {
    marginRight: '10px',
  },
  chevron: {
    marginLeft: 'auto',
  },
  footer: {
    bottom: 0,
    padding: '10px',
    fontFamily: 'Arial, sans-serif',
    // backgroundColor: '#34495e',
    borderTop: '1px solid #7f8c8d',
    textAlign: 'center',
    fontSize: '12px',
    color: '#ecf0f1',
  },
  footerText: {
    fontWeight: 'bold',
  },
  footerVersion: {
    fontSize: '11px',
    color: '#ecf0f1',
  },
  footerMinimized: {
    fontWeight: 'bold',
    fontSize: '12px',
    color: '#ecf0f1',
    marginBottom:'10px'
  },
};

export default Sidebar;
