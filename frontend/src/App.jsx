import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './Components/Navbar/Navbar.jsx';
import Home from "./Components/Pages/Home.jsx";
import About from "./Components/Pages/About.jsx";
import Services from "./Components/Pages/Services.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import LoginasFaculty from "./Components/Auth/Faculty/LoginasFaculty.jsx";
import LoginasStudent from "./Components/Auth/Student/LoginasStudent.jsx";
import LoginasHod from "./Components/Auth/Hod/LoginasHod.jsx";
import NotFound from "./Components/Pages/NotFound.jsx";
import RegisterasFaculty from './Components/Auth/Faculty/RegisterasFaculty.jsx';
import RegisterasStudent from "./Components/Auth/Student/RegisterasStudent.jsx";
import RegisterasHod from './Components/Auth/Hod/RegisterasHod.jsx';
import StudentDashboard from './Components/Pages/Dues.jsx';
import FacultyApproval from './Components/Pages/Facultyapproval.jsx';
import HodApproval from './Components/Pages/HodApproval.jsx';
import PrivateRoute from './Components/PrivateRoute.jsx';
import CompleteFacultyProfile from './Components/Auth/Faculty/completefacultyprofile.jsx';
import Profile from './Components/Pages/Profile.jsx';


export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/loginasfaculty" element={<LoginasFaculty />} />
          <Route path="/loginasstudent" element={<LoginasStudent />} />
          <Route path="/loginashod" element={<LoginasHod />} />
          <Route path="/registerasfaculty" element={<RegisterasFaculty />} />
          <Route path="/registerasstudent" element={<RegisterasStudent />} />
          <Route path="/registerashod" element={<RegisterasHod />} />

          {/* Protected Routes */}
          <Route
            path="/dues"
            element={
              <PrivateRoute allowedUserTypes={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/facultyapproval"
            element={
              <PrivateRoute allowedUserTypes={['faculty']}>
                <FacultyApproval />
              </PrivateRoute>
            }
          />
          <Route
            path="/hodapproval"
            element={
              <PrivateRoute allowedUserTypes={['hod']}>
                <HodApproval />
              </PrivateRoute>
            }
          />
          <Route
            path="/completefacultyprofile"
            element={
              <PrivateRoute allowedUserTypes={['faculty']}>
                <CompleteFacultyProfile />
              </PrivateRoute>} />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedUserTypes={['student']}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty/profile"
            element={
              <PrivateRoute allowedUserTypes={['faculty']}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/hod/profile"
            element={
              <PrivateRoute allowedUserTypes={['hod']}>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Default Route */}

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

