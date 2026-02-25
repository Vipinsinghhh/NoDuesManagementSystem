import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux'; // ✅ import


export default function RegisterAsFaculty() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    employeeId: '',
    agreeToTerms: false
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseUrl = useSelector((state) => state.api.baseUrl); // ✅ get baseUrl from Redux
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);
    
    // Clear error when user types
    const newErrors = { ...errors };
    if (errors[name]) {
      newErrors[name] = '';
    }
    
    // Real-time password matching validation
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password' && newFormData.confirmPassword && value !== newFormData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (name === 'confirmPassword' && value !== newFormData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (name === 'confirmPassword' && value === newFormData.password) {
        newErrors.confirmPassword = '';
      }
    }
    
    setErrors(newErrors);
  };

  // Handle form submission
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.department) newErrors.department = 'Department is required';
 
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${baseUrl}Faculty/register`, formData);
      
      if (response.status === 201 || response.status === 200) {
        const { token, faculty } = response.data;
        localStorage.setItem('facultyToken', token);
        localStorage.setItem('facultyData', JSON.stringify((faculty)));
        localStorage.setItem('userType', 'faculty'); 
        
        toast.success('Registration Successful! Redirecting to dues page...', {
          position: "top-right",
          autoClose: 2000,
        });
        navigate('/completefacultyprofile');
      }
    } catch (error) {
      console.error("Registration failed", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to register. Please try again later.';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,  
      });
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  // List of departments
  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Business Administration',
    'Humanities',
    'Other'
  ];

  // List of academic titles
  const academicTitles = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Adjunct Professor',
    'Research Professor',
    'Emeritus Professor',
    'Visiting Professor',
    'Instructor',
    'Other'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Faculty Registration</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your faculty account to access the portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="your.email@university.edu"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            
           

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                className={`mt-1 block w-full px-3 py-2 border ${errors.department ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
            </div>
            
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.employeeId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="EMP12345"
                value={formData.employeeId}
                onChange={handleChange}
              />
              {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                className={`h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-300' : ''}`}
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">terms and conditions</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">privacy policy</a>
              </label>
            </div>
            {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          
          {/* Login link */}
          <div className="text-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={()=>navigate("/LoginasFaculty")}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
