import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // ✅ import


const StudentDashboard = () => {
  const baseUrl = useSelector((state) => state.api.baseUrl);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  const submissionTypes = [
    {
      key: 'assignment',
      title: 'Assignments',
      icon: <LucideIcons.FileText className="mr-2 text-blue-600" />,
      hoverClass: 'hover:bg-blue-50'
    },
    {
      key: 'labManual',
      title: 'Lab Manuals',
      icon: <LucideIcons.Book className="mr-2 text-green-600" />,
      hoverClass: 'hover:bg-green-50'
    },
    {
      key: 'presentation',
      title: 'Presentations',
      icon: <LucideIcons.Mic2 className="mr-2 text-purple-600" />,
      hoverClass: 'hover:bg-purple-50'
    }
  ];

  useEffect(() => {
    // Get logged in student information and matching subjects
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get student data directly from localStorage
        const studentDataString = localStorage.getItem('studentData'); 
        
        if (!studentDataString) {
          console.error('No student data found in localStorage');
          setLoading(false);
          return;
        }

        const parsedStudentData = JSON.parse(studentDataString);
        
        
        // Set student data from localStorage
        setStudentData(parsedStudentData);
        
        const token = localStorage.getItem('studentToken');
        
        // Configure headers with auth token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Get all faculty data from the list endpoint
        const facultyResponse = await axios.get(`${baseUrl}Faculty/list`, config);
        
        // Extract faculty data
        const facultyData = Array.isArray(facultyResponse.data) ? facultyResponse.data : [];
        console.log(facultyData);
        
        // Get student's semester and section
        const studentSemester = parsedStudentData.semester;
        const studentSection = parsedStudentData.section;
        
        // Find matching subjects between faculty and student
        const matchingSubjects = [];

        facultyData.forEach(faculty => {
          if (faculty.teachingDetails && Array.isArray(faculty.teachingDetails)) {
            faculty.teachingDetails.forEach(detail => {
              if (detail.semester == studentSemester && detail.section == studentSection && detail.subject) {
                matchingSubjects.push(detail.subject);
              }
            });
          }
        });
        
        const uniqueSubjects = [...new Set(matchingSubjects)];
        setSubjects(uniqueSubjects);
        
        // Set first subject as active tab if subjects exist
        if (uniqueSubjects.length > 0) {
          setActiveTab(uniqueSubjects[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        console.log('Error details:', error.response ? error.response.data : 'No response data');
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Not Submitted': return 'bg-red-100 text-red-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitRequest = () => {
    if (requestMessage.trim()) {
      // Placeholder for request submission logic
      console.log('Dues Clearance Request:', requestMessage);
      setRequestMessage('');
      setIsRequestModalOpen(false);
    }
  };

  const renderSubmissionSection = () => {
    if (!activeTab || !studentData) {
      return (
        <div className="text-center py-8 text-gray-500">
          <LucideIcons.FileX className="mx-auto mb-2 text-gray-400" size={32} />
          <p>No submission data available for this subject.</p>
        </div>
      );
    }

    const subjectSubmissions = studentData.submissions?.[activeTab] || {};

    return (
      <div className="space-y-6">
        {submissionTypes.map((type) => {
          // Convert key to match the student data structure (e.g., assignment -> assignment)
          const statusKey = type.key;
          const status = subjectSubmissions[statusKey] || 'Not Submitted';
          
          return (
            <div key={type.key}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                {type.icon}
                {type.title}
              </h3>
              <div className={`flex justify-between items-center p-4 border rounded-lg mb-2 ${type.hoverClass} transition`}>
                <div>
                  <span className="font-medium">{activeTab} - {type.title}</span>
                  <p className="text-xs text-gray-500">
                    {status === 'Not Submitted' ? 'Deadline: Not set' : 'Last updated: Recently'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8 pt-20">
      <div className="container mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              Student Submission Dashboard
            </h1>
            <p className="text-blue-100 mt-2">
              {studentData ? (
                `${studentData.firstname} ${studentData.lastname} | Semester: ${studentData.semester} | Section: ${studentData.section}`
              ) : (
                'Track your assignments, lab manuals, and presentations'
              )}
            </p>
          </div>
          <button 
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition flex items-center"
          >
            <LucideIcons.MessageSquare className="mr-2" />
            Raise Dues Clearance
          </button>
        </div>

        {/* Subject Tabs */}
        <div className="bg-blue-50 p-4 border-b">
          {loading ? (
            <div className="flex justify-center py-2">
              <LucideIcons.Loader className="animate-spin text-blue-600" />
              <span className="ml-2">Loading your subjects...</span>
            </div>
          ) : subjects.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveTab(subject)}
                  className={`px-4 py-2 rounded-md transition whitespace-nowrap ${
                    activeTab === subject
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-gray-500">
              No subjects found for your semester and section
            </div>
          )}
        </div>

        {/* Submission Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LucideIcons.Loader className="animate-spin text-blue-600" />
              <span className="ml-2">Loading content...</span>
            </div>
          ) : subjects.length > 0 ? (
            renderSubmissionSection()
          ) : (
            <div className="text-center py-12 text-gray-500">
              <LucideIcons.AlertCircle className="mx-auto mb-2 text-yellow-500" size={32} />
              <p>No subjects are currently assigned to your semester and section.</p>
              <p className="text-sm mt-2">Please contact your academic advisor if you believe this is an error.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dues Clearance Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-96 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <LucideIcons.MessageSquare className="mr-2 text-blue-600" />
              Dues Clearance Request
            </h3>
            <textarea 
              className="w-full border rounded-md p-3 mb-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your dues clearance request..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitRequest}
                disabled={!requestMessage.trim()}
                className="flex-1 bg-blue-500 text-white py-2 rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
