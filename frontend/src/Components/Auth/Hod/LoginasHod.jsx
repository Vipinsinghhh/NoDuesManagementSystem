import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux'; // ✅ import


export default function LoginAsHod() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
    const baseUrl = useSelector((state) => state.api.baseUrl); // ✅ get baseUrl from Redux
  

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setSuccess('Registration successful! Please login with your credentials.');
      // Clear the state to prevent showing the message after page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToRegister = () => {
    navigate('/registerashod');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${baseUrl}Hod/login`, formData);
      
      // Check if we have the token and user data in the response
      if (response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        // Store authentication data in localStorage
        localStorage.setItem('hodToken', token);
        localStorage.setItem('hodData', JSON.stringify((user)));
        localStorage.setItem('userType', 'hod'); // Set userType for private routing
        
        toast.success('Login successful! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Small delay to show the toast before redirect
        setTimeout(() => {
          navigate('/hodapproval', { replace: true });
        }, 500);
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (error) {
      console.error("Login failed", error);
      
      if (error.response?.status === 404) {
        setError("Employee ID not found. Please check your credentials.");
      } else if (error.response?.status === 401) {
        setError("Invalid password. Please try again.");
      } else {
        setError(error.response?.data?.error || "Failed to login. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <ToastContainer />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">HOD Login</h1>
          <p className="mt-2 text-gray-600">Enter your employee ID and password</p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
            {success}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                value={formData.employeeId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your employee ID"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button" 
                onClick={() => navigate('/forgotpassword')} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-gray-600">
              Don't have an account? <button type="button" onClick={navigateToRegister} className="font-medium text-indigo-600 hover:text-indigo-500">Register as HOD</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}