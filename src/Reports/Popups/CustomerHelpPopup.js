import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
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

const VendorProductTable = ({ open, handleClose }) => {


  return (
    <div className="container-fluid mt-0  m-5">
      {/* Trigger Button */}
    

      {/* Modal */}

      <div className={`modal fade show d-block`} tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
  <div className="modal-dialog modal-dialog-centered modal-lg mt-0 " role="document" >
    <div className="modal-content rounded-4 shadow-lg">
      <div className="modal-header">
        <h5 className="modal-title fw-bold fs-3">Customer Help</h5>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </div>
      <div className="modal-body">
                <div className="row">
                  

                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Customer Code</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Customer Name </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">Status </label>
                    <input type="text" className="form-control" />
                  </div>

                  <div className="col-md-3 mb-2">
                    <label className="fw-bold">State</label>
                    <input type="text" className="form-control" />
                  </div>

              

                

                  <div className="col-md-3 mb-2 mt-4 ">
                    <button className="btn btn-primary pt-1"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg></button>
                  </div>
                </div>
                 <div className="ag-theme-alpine mt-4" style={{ height: 330, width: '100%' }}>
                        <AgGridReact
                          
                            pagination={true}
                            paginationPageSize={5}
                          />
                
                        </div>
              </div>
            </div>
          </div>
          {/* Backdrop */}
        </div>
   
    </div>
  );
};

export default VendorProductTable;
