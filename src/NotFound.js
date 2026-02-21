import React from "react";
import { useNavigate } from "react-router-dom";
import video from './Assets/Videos/404.mp4'

const PageNotAvailable = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid ms-2 vh-100 d-flex flex-column align-items-center justify-content-center bg-white shadow-lg rounded-4 ">
      {/* Video on Top */}
      <div className="w-100 d-flex justify-content-center mb-4">
        <video
          src={video} // Replace with your actual path or import
          autoPlay
          loop
          muted
          style={{ width: "100%", maxWidth: "400px" }}
        />
      </div>

      {/* Text Below */}
      <div className="text-center">
        <h1 className="display-5 fw-bold">Page Not Available</h1>
        <p className="text-muted fs-5 mb-4">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
       
      </div>
    </div>
  );
};

export default PageNotAvailable;
