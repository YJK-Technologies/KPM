import { AgGridReact } from "ag-grid-react";
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Barcode from "react-barcode";
import {
  ModuleRegistry, ClientSideRowModelModule, PaginationModule, TextFilterModule, NumberFilterModule,
  DateFilterModule, CustomFilterModule, CellStyleModule, ValidationModule,
} from "ag-grid-community";
import { useReactToPrint } from "react-to-print";
import "../../App.css";
import LoadingScreen from "../../BookLoader";
import secureLocalStorage from "react-secure-storage";

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
const config = require("../../ApiConfig");

const AddCategory = () => {
  const [Item_Category_Code, setItem_Category_Code] = useState("");
  const inputRef = useRef(null);
  const [Item_Category_Name, setItem_Category_Name] = useState("");
  const [Region_Code, setRegion_Code] = useState("");
  const [Country_Code, setCountry_Code] = useState("");
  const [Item_Category_Description, setItem_Category_Description] = useState("");
  const [Is_Default, setIs_Default] = useState(0);
  const [Display_Order, setDisplay_Order] = useState(0);
  const [Record_Version, setRecord_Version] = useState("");
  const [Item_Category_Image, setItem_Category_Image] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);

  const [statusdrop, setStatusdrop] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const purchaseprice = useRef(null);
  const salesprice = useRef(null);
  const discount = useRef(null);
  const mrpprice = useRef(null);
  const purchasetaxtype = useRef(null);
  const otherpurchasetaxtype = useRef(null);
  const salestaxtype = useRef(null);
  const othersalestaxtype = useRef(null);
  const HSNcode = useRef(null);
  const regbrand = useRef(null);
  const ourbrand = useRef(null);
  const Status = useRef(null);
  const img = useRef(null);
  const withtax = useRef(null);
  const withouttax = useRef(null);
  const seceondoryuom = useRef(null);
  const baseuom = useRef(null);
  const weigh = useRef(null);
  const nam = useRef(null);
  const variant = useRef(null);
  const code = useRef(null);
  const shortname = useRef(null);
  const barCode = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcode, setBarcode] = useState("");
  const [MRPprice, setMRPPrice] = useState(0);
  const [Discount, setDiscount] = useState(0);
  const created_by = sessionStorage.getItem("selectedUserCode");
  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [isUpdated, setIsUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyfield, setKeyfield] = useState('');

  const navigate = useNavigate();

  const location = useLocation();
  const locationState = location.state || {};
  const mode = locationState.mode || "create"; // ✅ default fallback
  const selectedRow = locationState.selectedRow || null;
  const Keyfields = location.state?.Keyfield;
  const company_code = sessionStorage.getItem('selectedCompanyCode');

  useEffect(() => {
    if (!location.state) {
      clearInputFields(); // ensure fresh create mode
    }
  }, []);

  useEffect(() => {
    if (mode === "update" && Keyfields) {
      fetchCategoryData();
    }
  }, [mode, Keyfields, statusdrop]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiBaseUrl}/getCategoryData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Keyfield: Keyfields,
          company_code
        }),
      });

      const data = await response.json();

      if (response.ok && data.length > 0) {
        const category = data[0];

        setItem_Category_Code(category.Item_Category_Code || "");
        setItem_Category_Name(category.Item_Category_Name || "");
        setItem_Category_Description(category.Item_Category_Description || "");
        setRecord_Version(category.Record_Version || 0);
        setDisplay_Order(category.Display_Order || 0);
        setKeyfield(category.Keyfield || '');

        const isDefaultBit =
          category.Is_Default === true ||
          category.Is_Default === 1 ||
          category.Is_Default === "1";

        // Set state as 1 (True) or 0 (False) for Toggle switch UI component
        setIs_Default(isDefaultBit ? 1 : 0);

        const isActiveBit =
          category.Is_Active === true ||
          category.Is_Active === 1 ||
          category.Is_Active === "1";

        console.log(isActiveBit)

        // Select 'Active' or 'Close' option object based on boolean status
        const targetStatusValue = isActiveBit ? "Active" : "Close";
        const statusOption = filteredOptionStatus.find(
          (opt) => opt.value === targetStatusValue
        );

        setSelectedStatus(statusOption)
        setStatus(statusOption || { value: targetStatusValue, label: targetStatusValue });

        setRegion_Code(category.Region_Code || "");
        setCountry_Code(category.Country_Code || "");

        if (
          category.Item_Category_Image &&
          category.Item_Category_Image.data
        ) {
          const base64Image = arrayBufferToBase64(
            category.Item_Category_Image.data,
          );
          const file = base64ToFile(
            `data:image/jpeg;base64,${base64Image}`,
            "Item_Category_Image.jpg",
          );
          setSelectedImage(`data:image/jpeg;base64,${base64Image}`);
          setItem_Category_Image(file);
        } else {
          setSelectedImage(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch category details");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate("/Category", {
      state: {
        refreshGrid: true,
        preservedInputs: location.state?.preservedInputs,
      },
    });
  };

  // console.log(selectedRow)
  const clearInputFields = () => {
    setItem_Category_Code("");
    setItem_Category_Name("");
    setItem_Category_Description("");
    setRecord_Version("");
    setDisplay_Order(0);
    setIs_Default(0);
    setRegion_Code("");
    setCountry_Code("");
    setSelectedStatus("");
    setSelectedImage(null);
    setStatus("");
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  // useEffect(() => {
  //   if (mode === "update" && selectedRow && !isUpdated) {
  //     setItem_Category_Code(selectedRow.Item_Category_Code || "");
  //     setItem_Category_Name(selectedRow.Item_Category_Name || "");
  //     setItem_Category_Description(selectedRow.Item_Category_Description || "");
  //     setRecord_Version(selectedRow.Record_Version || 0);
  //     setDisplay_Order(selectedRow.Display_Order || 0);
  //     setIs_Default(selectedRow.Is_Default || 0);
  //     const statusOption = filteredOptionStatus.find(
  //       (opt) => opt.value === (selectedRow.Is_Active ? 1 : 0),
  //     );

  //     setSelectedStatus(statusOption);
  //     setStatus(statusOption?.value ?? "");

  //     setRegion_Code(selectedRow.Region_Code || "");
  //     setCountry_Code(selectedRow.Country_Code || "");

  //     if (
  //       selectedRow.Item_Category_Image &&
  //       selectedRow.Item_Category_Image.data
  //     ) {
  //       const base64Image = arrayBufferToBase64(
  //         selectedRow.Item_Category_Image.data,
  //       );
  //       const file = base64ToFile(
  //         `data:image/jpeg;base64,${base64Image}`,
  //         "Item_Category_Image.jpg",
  //       );
  //       setSelectedImage(`data:image/jpeg;base64,${base64Image}`);
  //       setItem_Category_Image(file);
  //     } else {
  //       setSelectedImage(null);
  //     }
  //   } else if (mode === "create") {
  //     clearInputFields();
  //   }
  // }, [mode, selectedRow, isUpdated]);

  useEffect(() => {
    if (mode === "create" && statusdrop.length > 0) {
      const defaultStatus = statusdrop.find(
        (item) => item.attributedetails_name === "Active",
      );

      if (defaultStatus) {
        const defaultOption = {
          value: defaultStatus.attributedetails_name,
          label: defaultStatus.attributedetails_name,
        };

        setSelectedStatus(defaultOption);
        setStatus(defaultOption.value);
      }
    }
  }, [mode, statusdrop]);

  const base64ToFile = (base64Data, fileName) => {
    if (!base64Data || !base64Data.startsWith("data:")) {
      throw new Error("Invalid base64 string");
    }

    const parts = base64Data.split(",");
    if (parts.length !== 2) {
      throw new Error("Base64 string is not properly formatted");
    }

    const mimePart = parts[0];
    const dataPart = parts[1];

    const mime = mimePart.match(/:(.*?);/);
    if (!mime || !mime[1]) {
      throw new Error("Could not extract MIME type");
    }

    const binaryString = atob(dataPart);
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const fileBlob = new Blob([uint8Array], { type: mime[1] });
    return new File([fileBlob], fileName, { type: mime[1] });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds 1MB. Please upload a smaller file.");
        event.target.value = null;
        return;
      }
      setSelectedImage(URL.createObjectURL(file));
      setItem_Category_Image(file);
    }
  };

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleInsert = async () => {
    if (!Item_Category_Code || !Item_Category_Name || !status) {
      setError(true);
      toast.warning("Error: Missing required fields");
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("company_code", sessionStorage.getItem("selectedCompanyCode"),);
      formData.append("Item_Category_Code", Item_Category_Code);
      formData.append("Item_Category_Name", Item_Category_Name);
      formData.append("Item_Category_Description", Item_Category_Description);
      formData.append("Region_Code", Region_Code);
      formData.append("Country_Code", Country_Code);
      formData.append("Display_Order", Display_Order);
      formData.append("Record_Version", Record_Version);
      const activeBitValue = status && status === "Active" ? 1 : 0;
      formData.append("Is_Active", activeBitValue);
      const defaultBitValue = Is_Default === true || Is_Default === 1 || Is_Default === "1" ? 1 : 0;
      formData.append("Is_Default", defaultBitValue);
      formData.append("created_by", sessionStorage.getItem("selectedUserCode"));

      if (Item_Category_Image) {
        formData.append("Item_Category_Image", Item_Category_Image);
      }

      const response = await fetch(`${config.apiBaseUrl}/Item_Category_MasterInsert`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        console.log("Data inserted successfully");
        toast.success("Data inserted successfully!", {
          onClose: () => clearInputFields(), // Reloads the page after the toast closes
        });
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = async (
    e,
    nextFieldRef,
    value,
    hasValueChanged,
    setHasValueChanged,
  ) => {
    if (e.key === "Enter") {
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
    if (e.key === "Enter" && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const handleUpdate = async () => {
    if (!Item_Category_Code || !Item_Category_Name || !status) {
      setError(true);
      toast.warning("Error: Missing required fields");
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("company_code", sessionStorage.getItem("selectedCompanyCode"),);
      formData.append("Item_Category_Code", Item_Category_Code);
      formData.append("Item_Category_Name", Item_Category_Name);
      formData.append("Item_Category_Description", Item_Category_Description);
      formData.append("Region_Code", Region_Code);
      formData.append("Country_Code", Country_Code);
      formData.append("Display_Order", Display_Order);
      formData.append("Record_Version", Record_Version);
      const activeBitValue = status && status === "Active" ? 1 : 0;
      formData.append("Is_Active", activeBitValue);
      const defaultBitValue = Is_Default === true || Is_Default === 1 || Is_Default === "1" ? 1 : 0;
      formData.append("Is_Default", defaultBitValue);
      formData.append("Keyfield", keyfield);
      formData.append("created_by", sessionStorage.getItem("selectedUserCode"));

      if (Item_Category_Image) {
        formData.append("Item_Category_Image", Item_Category_Image);
      }

      const response = await fetch(`${config.apiBaseUrl}/Item_Category_MasterUpdate`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        toast.success("Data updated successfully", {
          // onClose: () => clearInputFields()
        });
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid sidenav">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="card shadow-lg border-0 p-3  rounded-5">
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            {" "}
            <h4 className="mb-5 fw-semibold text-dark fs-2 fw-bold">
              {mode === "update" ? "Update Category" : " Add Category"}
            </h4>{" "}
          </div>
          <div className="d-flex justify-content-end row">
            <div className="col-md-12 mt-1 me-0 mb-5">
              <a
                className="border-none text-danger p-1"
                title="Close"
                onClick={handleClick}
                style={{ cursor: "pointer" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  class="bi bi-x-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="row">
          {/* <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !Item_code ? 'text-danger' : ''}`}>Category ID<span className="text-danger">*</span></label>
            <div className="">
              <input type="text" className="form-control pe-5"
                id="Icode"
                class="exp-input-field form-control"
                placeholder=""
                required title="Please enter the code"
                value={Item_code}
                onChange={(e) => setItem_code(e.target.value)}
                maxLength={18}
                ref={inputRef}
                readOnly={mode === "update"}
                onKeyDown={(e) => handleKeyDown(e, variant, code)}
              />
            </div>
          </div> */}
          <div className="col-md-3 mb-2">
            <label
              className={`fw-bold ${error && !Item_Category_Code ? "text-danger" : ""}`}
            >
              Category Code<span className="text-danger">*</span>
            </label>
            <div title="Please select the variant">
              <input
                type="text"
                className="form-control"
                id="Iname"
                class="exp-input-field form-control"
                placeholder=""
                required
                title="Please enter the name"
                value={Item_Category_Code}
                onChange={(e) => setItem_Category_Code(e.target.value)}
                maxLength={40}
                defaultValue={0}
                ref={nam}
                onKeyDown={(e) => handleKeyDown(e, weigh, nam)}
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label
              className={`fw-bold ${error && !Item_Category_Name ? "text-danger" : ""}`}
            >
              Category Name<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="Iname"
              class="exp-input-field form-control"
              placeholder=""
              required
              title="Please enter the name"
              value={Item_Category_Name}
              onChange={(e) => setItem_Category_Name(e.target.value)}
              maxLength={40}
              defaultValue={0}
              ref={nam}
              onKeyDown={(e) => handleKeyDown(e, weigh, nam)}
            />
          </div>

          <div className="col-md-3 mb-2">
            <label className={`fw-bold`}>Region Code </label>
            <div title="Please select the base UOM">
              <input
                id="BUOM"
                value={Region_Code}
                onChange={(e) => setRegion_Code(e.target.value)}
                class="exp-input-field form-control"
                placeholder=""
                maxLength={60}
                ref={baseuom}
                onKeyDown={(e) => handleKeyDown(e, seceondoryuom, baseuom)}
              />
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <label className="fw-bold">Country Code</label>
            <input
              type="text"
              className="form-control"
              id="Ishname"
              placeholder=""
              required
              title="Please fill the short name here"
              value={Country_Code}
              onChange={(e) => setCountry_Code(e.target.value)}
              maxLength={50}
            />
          </div>
          {/* <div className="col-md-3 mb-2">
                        <label className={`fw-bold`}>Status</label>
                        <div title="Please select the secondary UOM">
                            <Select
                                type="text"
                                id="BUOM"
                                value={selectedStatus}
                                onChange={handleChangeStatus}
                                options={filteredOptionStatus}
                                classNamePrefix="react-select"
                                placeholder=""
                                maxLength={60}
                                ref={seceondoryuom}
                                onKeyDown={(e) => handleKeyDown(e, shortname, seceondoryuom)}
                            />
                        </div>
                    </div> */}
          <div className="col-md-3 mb-2">
            <label
              className={`fw-bold ${error && !status ? "text-danger" : ""}`}
            >
              Status<span className="text-danger">*</span>
            </label>
            <div title="Please select the status">
              <Select
                type="text"
                className=""
                value={selectedStatus}
                onChange={handleChangeStatus}
                options={filteredOptionStatus}
                placeholder=""
                classNamePrefix="react-select"
                ref={seceondoryuom}
                onKeyDown={(e) => handleKeyDown(e, shortname, seceondoryuom)}
              />
            </div>
          </div>
          {/* <div className="col-md-3 mb-2">
            <label className='fw-bold'>IS Deleted </label>
            <input
              type="text"
              className="form-control"
              id="Ishname"
              placeholder=""
              required title="Please enter the short name"
              value={Item_short_name}
              onChange={(e) => setItem_short_name(e.target.value)}
              maxLength={50}
              ref={shortname}
              onKeyDown={(e) => handleKeyDown(e, withouttax, shortname)}
            />
          </div> */}

          <div className="col-md-3 mb-2">
            <label className="fw-bold">Display Order </label>
            <input
              type="text"
              className="form-control"
              id="Iwtax"
              placeholder=""
              required
              title="Please enter the with tax"
              value={Display_Order}
              onChange={(e) => setDisplay_Order(e.target.value)}
              maxLength={20}
              ref={withtax}
              onKeyDown={(e) => handleKeyDown(e, purchaseprice, withtax)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <label className={`fw-bold`}>Record Version </label>
            <input
              type="text"
              className="form-control"
              id="Ipprice"
              placeholder=""
              required
              title="Please enter the purchase price"
              value={Record_Version}
              onChange={(e) => setRecord_Version(e.target.value)}
              maxLength={20}
              ref={purchaseprice}
              onKeyDown={(e) => handleKeyDown(e, salesprice, purchaseprice)}
            />
          </div>
          <div className="col-md-3 mb-2">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="Is_Default"
                checked={Is_Default === 1}
                onChange={(e) => setIs_Default(e.target.checked ? 1 : 0)}
              />
              <label className="form-check-label fw-bold" htmlFor="Is_Default">
                Default Display
              </label>
            </div>
          </div>
          {/* <div className="col-md-3 mb-2">
            <label className={`fw-bold ${error && !Item_std_sales_price ? 'text-danger' : ''}`}>Row GUID </label>
            <input
              type="text"
              className="form-control"
              id="Isprice"
              placeholder=""
              required title="Please enter the sales price"
              value={Item_std_sales_price}
              // onChange={(e) => setItem_std_sales_price(e.target.value)}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 5) {
                  setItem_std_sales_price(onlyNums);
                }
              }}
              maxLength={20}
              ref={salesprice}
              onKeyDown={(e) => handleKeyDown(e, mrpprice, salesprice)}
            />
          </div> */}
          {/* <div className="col-md-3 mb-2">
            <label className='fw-bold'>Source System </label>
            <input
              type="text"
              className="form-control"
              id="Isprice"
              placeholder=""
              required title="Please enter the MRP price"
              value={MRPprice}
              ref={mrpprice}
              // onChange={(e) => setMRPPrice(e.target.value)}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 5) {
                  setMRPPrice(onlyNums);
                }
              }}
              maxLength={20}
              onKeyDown={(e) => handleKeyDown(e, discount, mrpprice)}
            />
          </div> */}
          {/* <div className="col-md-3 mb-2">
            <label className='fw-bold'>Sync Status </label>
            <input
              type="text"
              className="form-control"
              id="Disc%"
              placeholder=""
              required title="Please enter the Discount Percentage"
              value={Discount}
              ref={discount}
              // onChange={(e) => setDiscount(e.target.value)}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/, ''); // remove non-numeric
                if (onlyNums.length <= 5) {
                  setDiscount(onlyNums);
                }
              }}
              maxLength={20}
              onKeyDown={(e) => handleKeyDown(e, purchasetaxtype, discount)}
            />
          </div> */}

          <div className="col-md-12 mb-2">
            <label className="fw-bold">Description</label>
            <textarea
              className="exp-input-field form-control"
              placeholder="Enter description"
              rows={4}
              value={Item_Category_Description || ""}
              onChange={(e) => setItem_Category_Description(e.target.value)}
              maxLength={250}
            />
          </div>

          <div className="col-md-3 mb-2">
            <label className="fw-bold">Image</label>
            <input
              type="File"
              className="form-control"
              accept="image/*"
              onChange={handleFileSelect}
              ref={img}
              onKeyDown={(e) => handleKeyDown(e, barCode, img)}
            />
          </div>
          {selectedImage && (
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <img
                  src={selectedImage}
                  alt="Selected Preview"
                  className="avatar rounded sm mt-4"
                  style={{ height: "200px", width: "200px" }}
                />
              </div>
            </div>
          )}

          <div className="col-md-2 mb-2 mt-4">
            {mode === "create" ? (
              <button
                onClick={handleInsert}
                className="btn btn-primary"
                title="Submit"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                className="btn btn-primary"
                title="Update"
              >
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
