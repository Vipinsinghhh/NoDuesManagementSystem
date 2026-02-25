import React from 'react';
import { HomeIcon, FileCheck, Clock, AlertCircle, User, BookOpen } from 'lucide-react';
import banner from "../Assets/banner.jpg";
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="relative h-screen md:h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center" 
          style={{ backgroundImage: `url(${banner})` }}
        ></div>
        <div className="absolute inset-0 bg-indigo-900/40"></div>
        <div className="relative container mx-auto px-6 h-full flex flex-col justify-center items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            No Dues Management System
          </h1>
          <p className="text-xl text-white max-w-2xl mb-8 drop-shadow-sm">
            Streamline your Dues clearance process with our easy-to-use No dues verification platform.
          </p>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition-colors duration-300 flex items-center shadow-lg"
            onClick={() => navigate('/registerasstudent')}
          >
            <HomeIcon className="mr-2 h-5 w-5" />
            Get Started
          </button>
        </div>
      </div>

      {/* Features section */}
      <div className="container mx-auto px-6 py-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Simplifying Dues Clearance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature icon={<FileCheck className="h-6 w-6 text-indigo-600" />} title="Easy Verification" description="Quick and simple verification process for students and faculty members." />
          <Feature icon={<Clock className="h-6 w-6 text-indigo-600" />} title="Real-time Updates" description="Get instant updates on clearance status from all departments." />
          <Feature icon={<AlertCircle className="h-6 w-6 text-indigo-600" />} title="Due Notifications" description="Automatic notifications for pending dues and clearance requirements." />
        </div>
      </div>

      {/* User types */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Who Can Use Our System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UserType icon={<User className="h-10 w-10 text-indigo-600 mr-3" />} title="Students" description="Track and complete your clearance process before graduation or semester end." />
            <UserType icon={<BookOpen className="h-10 w-10 text-indigo-600 mr-3" />} title="Faculty" description="Manage dues and clearances for students in your department efficiently." />
            <UserType icon={<User className="h-10 w-10 text-indigo-600 mr-3" />} title="HOD" description="Get overview reports and manage clearance processes for your entire department." />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-gray-100 rounded-xl shadow-lg">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-800 mb-10 max-w-2xl mx-auto">
            Log in to your account to manage your dues and clearance process effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
              onClick={() => navigate('/registerasstudent')}
            >
              {/* SVG icon here */}
              <span className="mr-2">🎓</span>
              Student Login
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
              onClick={() => navigate('/registerasfaculty')}
            >
              <span className="mr-2">👨‍🏫</span>
              Faculty Login
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
              onClick={() => navigate('/registerashod')}
            >
              <span className="mr-2">📋</span>
              HOD Login
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-12 bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700 text-center text-sm">
            Need assistance? Contact our support team at <span className="font-semibold text-gray-900">support@example.edu</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Optional sub-components for cleaner code

function Feature({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="p-2 bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UserType({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
