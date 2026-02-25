import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux'; // ✅ import


// Added missing constants
const branches = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering', 
  'Civil Engineering',
  'Chemical Engineering',
  'Electronics and Communication'
];

const years = ['1st', '2nd', '3rd', '4th'];

const sections = ['A', 'B', 'C', 'D'];

const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function RegisterasStudent() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    branch: '',
    year: '',
    section: '',
    semester: '',
    phoneNumber: '',
    dateOfBirth: '',
    agreeToTerms: false
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = useSelector((state) => state.api.baseUrl); // ✅ get baseUrl from Redux

  // Handle input changes with real-time password validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);

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
  const handleSubmit = async (e) => {
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

    if (!formData.rollNumber) newErrors.rollNumber = 'Roll number is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.section) newErrors.section = 'Section is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
    
      const response = await axios.post(`${baseUrl}Student/register`, formData);
      
      if (response.status === 201 || response.status === 200) {
        // Assuming the backend returns a token
        const { token ,user} = response.data;

    

        
        // Store token securely
        localStorage.setItem('studentToken', token);
        localStorage.setItem('studentData', JSON.stringify(user)); 
        localStorage.setItem('userType','student');
        
 // Show success toast
        toast.success('Registration Successful! Redirecting to dues page...', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        navigate('/dues');
         
      }
    } catch (error) {
      console.error("Registration failed", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to register. Please try again later.';
      
      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <ToastContainer />

      {errors.general && (
        <div className="text-center mb-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}


      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Student Registration</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your student account to access the portal
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

            {/* Student Information */}
            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                Roll Number
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                required
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.rollNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="e.g., CS20001"
                value={formData.rollNumber}
                onChange={handleChange}
              />
              {errors.rollNumber && <p className="mt-1 text-sm text-red-600">{errors.rollNumber}</p>}
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                required
                className={`mt-1 block w-full px-3 py-2 border ${errors.branch ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                value={formData.branch}
                onChange={handleChange}
              >
                <option value="">Select your branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              {errors.branch && <p className="mt-1 text-sm text-red-600">{errors.branch}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  required
                  className={`mt-1 block w-full px-3 py-2 border ${errors.year ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                  Section
                </label>
                <select
                  id="section"
                  name="section"
                  required
                  className={`mt-1 block w-full px-3 py-2 border ${errors.section ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.section}
                  onChange={handleChange}
                >
                  <option value="">Select section</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                {errors.section && <p className="mt-1 text-sm text-red-600">{errors.section}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Current Semester
              </label>
              <select
                id="semester"
                name="semester"
                required
                className={`mt-1 block w-full px-3 py-2 border ${errors.semester ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                value={formData.semester}
                onChange={handleChange}
              >
                <option value="">Select semester</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
              {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="10-digit number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
              </div>
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
                onClick={() => navigate("/LoginasStudent")}
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
