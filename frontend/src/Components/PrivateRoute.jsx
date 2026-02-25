import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedUserTypes = [] }) => {
  const location = useLocation();
  
  // Check for any of the token types
  const studentToken = localStorage.getItem('studentToken');
  const facultyToken = localStorage.getItem('facultyToken');
  const hodToken = localStorage.getItem('hodToken');
  
  const isAuthenticated = studentToken || facultyToken || hodToken;
  
  const userType = localStorage.getItem('userType');
  
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // If allowedUserTypes is specified and user type doesn't match, redirect to home
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, render the children
  return children;
};

export default PrivateRoute;