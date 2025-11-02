// /client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h1 style={{ fontSize: '3rem', color: '#333' }}>404 - Page Not Found</h1>
      <p style={{ color: '#555', marginBottom: '20px' }}>
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: '#007b55',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
        }}
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
