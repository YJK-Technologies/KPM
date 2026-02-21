import React from 'react';
import './BookLoader.css'; // You can use this to add your CSS styles

const BookLoader = () => {
  return (
<div className="loader-container container-fluid">
  <div className="book mx-auto">
    <div className="book__pg-shadow"></div>
    <div className="book__pg"></div>
    <div className="book__pg book__pg--2"></div>
    <div className="book__pg book__pg--3"></div>
    <div className="book__pg book__pg--4"></div>
    <div className="book__pg book__pg--5"></div>
  </div>

  <div className="loading-text position-absolute top-50 start-50 translate-middle text-center text-white">
    <h5>Loading, please wait...</h5>
  </div>
</div>
  );
};

export default BookLoader;
