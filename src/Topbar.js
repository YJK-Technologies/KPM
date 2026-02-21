import React, { useRef, useState, useEffect } from 'react';
import logo1 from './Vintage1.png';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import Lottie from "lottie-react";
import Logoutanim from './Assets/Animations/Logout.json'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { showConfirmationToast } from './ToastConfirmation';
import secureLocalStorage from "react-secure-storage"; 

const config = require('./ApiConfig')
export default function Topbar() {
  const navigate = useNavigate();

  const user_code = sessionStorage.getItem('selectedUserCode');
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const dropdownRef = useRef(null);
  const userImageBase64 = sessionStorage.getItem('user_image');
  const userImageSrc = userImageBase64 ? `data:image/png;base64,${userImageBase64}` : null;
  const [companyName, setCompanyName] = useState(sessionStorage.getItem('selectedCompanyName') || '');
  const [locationName, setLocationName] = useState(sessionStorage.getItem('selectedLocationName') || '');

  const handleSettings = () => {
    navigate('/Settings');
  };

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);


  const handleLogout = () => {
    showConfirmationToast(
      "Are you sure you want to log out?",
      // If user confirms, clear the session and navigate
      () => {
        localStorage.clear();
        // sessionStorage.removeItem('isLoggedIn');
        sessionStorage.clear();
        navigate('/');
      },
      // If user cancels, show a message that logout was cancelled
      () => {
        toast.info("Logout cancelled");
      }
    );
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user_code');
  //   navigate('/');
  // };

  const cancelLogout = () => setShowModal(false);
  const confirmLogout = () => {
    setShowModal(false);
    alert("Logged out!");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('sessionStorage has changed!');
      setCompanyName(sessionStorage.getItem('selectedCompanyName') || '');
      setLocationName(sessionStorage.getItem('selectedLocationName') || '');
    };

    window.addEventListener('storageUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const dropdown = document.querySelector('.dropdown-menu.show');
        if (dropdown) dropdown.classList.remove('show');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error('File size exceeds 1MB. Please upload a smaller file.');
        return;
      }

      setSelectedImage(file);
      handleSaveImage(file);
      handleInsert(file);
    }
  };

  const handleSaveImage = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sessionStorage.setItem('user_image', reader.result.split(',')[1]);
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsert = async (file) => {
    try {
      const formData = new FormData();
      formData.append("user_code", user_code);
      if (file) {
        formData.append("user_img", file);
      }

      const response = await fetch(`${config.apiBaseUrl}/UpdateUserImage`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        console.log("Image uploaded/updated successfully");
        toast.success("Profile picture updated successfully!", {
          autoClose: 1000,
        });
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.error(errorResponse.message || "Bad request!", {
          autoClose: 1000,
        });
      } else {
        console.error("Failed to upload image");
        toast.error("Failed to upload image", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Error uploading image: ${error.message}`, {
        autoClose: 1000,
      });
    }
  };

  const hasAccess = (screen) => screenType.includes(screen.replace(/\s+/g, ''));

  const permissionsJSON = sessionStorage.getItem("permissions");
  const permissions = permissionsJSON ? JSON.parse(permissionsJSON) : [];
  const screenType = Array.isArray(permissions)
    ? permissions.map(p => p.screen_type?.replace(/\s+/g, ''))
    : [];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMenuOpen(prev => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

 const handleCompany = () => {
    navigate('/ListOfCompanies');
  };

  return (
    <div>
      <div className='desktopbuttons'>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4 mb-4">
          <a className="navbar-brand fw-bold text-primary" href="./Dashboard">
            <img src={logo1} alt="Logo" height={30} width={50} className="d-inline-block align-top" />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#topbarMenu"
            aria-controls="topbarMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="topbarMenu">
            <div className="d-flex align-items-center gap-3 text-white ">
              <form className="text-center small">
                <div className="input-group justify-content-center">
                  <div>
                    <h5 className="mb-1">{companyName}</h5>
                    <p className="mb-0">{locationName}</p>
                  </div>
                </div>
              </form>
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    className="btn btn-secondary d-flex align-items-center"
                    id="dropdown-user"
                  >
                    <span className="me-2 fw-semibold text-white">Welcome {user_code}</span>
                    {userImageSrc ? (
                      <img
                        src={userImageSrc}
                        alt="User Avatar"
                        width="35"
                        height="35"
                        className=" rounded-circle"
                        title={user_code}
                      />
                    ) : (
                      <div
                        className="avatar-placeholder rounded-circle position-relative"
                        title={user_code}
                      >
                        {user_code ? user_code.charAt(0) : 'U'}
                      </div>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleCompany}>List of Companies</Dropdown.Item>
                    <Dropdown.Item as="label" style={{ cursor: "pointer" }}>
                      Change Profile Picture
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      {selectedImage && (
                        <li style={{ cursor: "pointer" }}>
                          <button onClick={handleSaveImage} className="dropdown-item" >
                            Save Image
                          </button>
                        </li>
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleSettings}>Settings</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {showModal && (
                  <>
                    <div
                      className="modal fade show"
                      tabIndex="-1"
                      role="dialog"
                      style={{ display: 'block' }}
                    >
                      <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content bg-white text-dark">
                          <div className="modal-header border-0 justify-content-center">
                            <div style={{ width: 170, height: 100 }}>
                              <Lottie animationData={Logoutanim} loop={true} />
                            </div>
                          </div>
                          <div className="modal-body text-center">
                            <h5 className="modal-title mb-3">Confirm Logout</h5>
                            <p>Are you sure you want to logout?</p>
                          </div>
                          <div className="modal-footer justify-content-center">
                            <button className="btn btn-secondary me-2" onClick={cancelLogout}>
                              No
                            </button>
                            <button className="btn btn-danger" onClick={confirmLogout}>
                              Yes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                  </>
                )}
              </>
            </div>
          </div>
        </nav>
      </div>
      <div className='mobile_buttons'>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4 pb-3">
          <a className="navbar-brand fw-bold text-primary" href="/Dashboard">
            <img src={logo1} alt="Logo" height={50} width={50} className="d-inline-block align-top logo-img" />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`navbar-collapse ${isMenuOpen ? 'show' : 'collapse'}`} id="topbarMenu">
            <div className="dropdown-profile-header px-3 py-1 bg-dark text-white d-lg-none ">
              <div className="d-flex align-items-center justify-content-between">
                <div className="text-start small">
                  <div className="fw-bold">{companyName}</div>
                </div>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    className="btn btn-sm btn-secondary d-flex align-items-center"
                    id="dropdown-user-mobile"
                  >
                    <span className="me-2 fw-semibold text-white">{user_code}</span>
                    {userImageSrc ? (
                      <img
                        src={userImageSrc}
                        alt="User Avatar"
                        width="30"
                        height="30"
                        className="rounded-circle"
                      />
                    ) : (
                      <div
                        className="avatar-placeholder rounded-circle bg-secondary text-white text-center"
                        style={{
                          width: 30,
                          height: 30,
                          lineHeight: '30px',
                        }}
                      >
                        {user_code?.charAt(0) || 'U'}
                      </div>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-dark">
                    <Dropdown.Item href="/settings">Settings</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <div className="dropdown-menu-scrollable">
              <ul className="navbar-nav me-auto mt-0 pt-0 flex-column ms-5">
                {hasAccess("Dashboard") && (
                  <li className="nav-item">
                    <Link to="/Dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i class="bi bi-speedometer text-white fs-4"></i> Dashboard
                    </Link>
                  </li>
                )}

                {hasAccess("Company") && (
                  <li className="nav-item">
                    <Link to="/Company" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-building fs-4 text-primary"></i> Company
                    </Link>
                  </li>
                )}

                {hasAccess("CompanyMapping") && (
                  <li className="nav-item">
                    <Link to="/CompanyMapping" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-link-45deg fs-4 text-success"></i> Company Mapping
                    </Link>
                  </li>
                )}

                {hasAccess("Location") && (
                  <li className="nav-item">
                    <Link to="/Location" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-geo-alt-fill fs-4 text-warning"></i> Location
                    </Link>
                  </li>
                )}

                {hasAccess("Role") && (
                  <li className="nav-item">
                    <Link to="/Role" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-person-lock fs-4 text-danger"></i> Role
                    </Link>
                  </li>
                )}

                {hasAccess("RoleMapping") && (
                  <li className="nav-item">
                    <Link to="/RoleMapping" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-people-fill fs-4 text-white"></i> Role Mapping
                    </Link>
                  </li>
                )}

                {hasAccess("RoleRights") && (
                  <li className="nav-item">
                    <Link to="/RoleRights" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-shield-lock fs-4 text-info"></i> Role Rights
                    </Link>
                  </li>
                )}

                {hasAccess("User") && (
                  <li className="nav-item">
                    <Link to="/User" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-person-circle fs-4 text-white"></i> User
                    </Link>
                  </li>
                )}

                {hasAccess("Attribute") && (
                  <li className="nav-item">
                    <Link to="/Attribute" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-gear-fill fs-4 text-info"></i> Attribute
                    </Link>
                  </li>
                )}

                {hasAccess("Customer") && (
                  <li className="nav-item">
                    <Link to="/Customer" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-person-fill fs-4 text-success"></i> Customer
                    </Link>
                  </li>
                )}

                {hasAccess("Vendor") && (
                  <li className="nav-item">
                    <Link to="/Vendor" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-people-fill fs-4 text-warning"></i> Vendor
                    </Link>
                  </li>
                )}

                {hasAccess("Tax") && (
                  <li className="nav-item">
                    <Link to="/Tax" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-calculator-fill fs-4 text-danger"></i> Tax
                    </Link>
                  </li>
                )}

                {hasAccess("Warehouse") && (
                  <li className="nav-item">
                    <Link to="/Warehouse" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-archive-fill fs-4 text-white"></i> Warehouse
                    </Link>
                  </li>
                )}

                {hasAccess("Item") && (
                  <li className="nav-item">
                    <Link to="/Item" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-box-fill fs-4 text-primary"></i> Item
                    </Link>
                  </li>
                )}

                {hasAccess("NumberSeries") && (
                  <li className="nav-item">
                    <Link to="/NumberSeries" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-bar-chart-fill fs-4 text-white"></i> Number Series
                    </Link>
                  </li>
                )}

                {hasAccess("OpeningItem") && (
                  <li className="nav-item">
                    <Link to="/OpeningItem" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-folder-fill fs-4 text-success"></i> Opening Item
                    </Link>
                  </li>
                )}

                {hasAccess("Sales") && (
                  <li className="nav-item">
                    <Link to="/Sales" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-cash-stack fs-4 text-warning"></i> Sales
                    </Link>
                  </li>
                )}

                {hasAccess("Purchase") && (
                  <li className="nav-item">
                    <Link to="/Purchase" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-cart-fill fs-4 text-info"></i> Purchase
                    </Link>
                  </li>
                )}

                {hasAccess("PurchaseReturn") && (
                  <li className="nav-item">
                    <Link to="/PurchaseReturn" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-arrow-return-left fs-4 text-danger"></i> Purchase Return
                    </Link>
                  </li>
                )}

                {hasAccess("SalesReturn") && (
                  <li className="nav-item">
                    <Link to="/SalesReturn" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-arrow-return-right fs-4 text-white"></i> Sales Return
                    </Link>
                  </li>
                )}

                {hasAccess("SalesAnalysis") && (
                  <li className="nav-item">
                    <Link to="/SalesAnalysis" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-graph-up fs-4 text-primary"></i> Sales Analysis
                    </Link>
                  </li>
                )}

                {hasAccess("PurchaseAnalysis") && (
                  <li className="nav-item">
                    <Link to="/PurchaseAnalysis" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-cart-check fs-4 text-success"></i> Purchase Analysis
                    </Link>
                  </li>
                )}

                {hasAccess("ItemWiseStock") && (
                  <li className="nav-item">
                    <Link to="/ItemWiseStock" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-box fs-4 text-warning"></i> Item Wise Stock
                    </Link>
                  </li>
                )}

                {hasAccess("GSTReport") && (
                  <li className="nav-item">
                    <Link to="/GSTReport" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-file-earmark-bar-graph fs-4 text-danger"></i> GST Report
                    </Link>
                  </li>
                )}

                {hasAccess("OpenItemAnalysis") && (
                  <li className="nav-item">
                    <Link to="/OpenItemAnalysis" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <i class="bi bi-dropbox text-success fs-4"></i> Open Item Analysis
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}